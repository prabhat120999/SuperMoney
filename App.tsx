import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import uuid from 'react-native-uuid';

import {
  initiatePayment,
  pollPaymentStatus,
} from './mockApi';

import {
  addNetworkListener,
} from './networkMonitor';

import {
  initialState,
  paymentReducer,
} from './src/payment/paymentReducer';

import PaymentEntryScreen from './src/screens/PaymentEntryScreen';
import PaymentStatusScreen from './src/screens/PaymentStatusScreen';
function createIdempotencyKey() {
  try {
    const v4 = uuid?.v4 ?? uuid?.default?.v4;
    const value = typeof v4 === 'function' ? v4() : null;
    if (value) {
      return String(value);
    }
  } catch {
    // Fall through to a local key if the UUID package export is wrapped.
  }

  return `pay_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const INIT_TIMEOUT = 10_000;
const POLL_TIMEOUT = 5_000;
const POLL_INTERVAL = 3_000;
const UNKNOWN_TIMEOUT = 30_000;

function withTimeout(promise, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, timeout);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function getErrorMessage(code) {
  switch (code) {
    case 'INVALID_VPA':
      return 'Invalid UPI ID';

    case 'LIMIT_EXCEEDED':
      return 'Payment limit exceeded';

    default:
      return 'Payment could not be initiated';
  }
}

export default function App() {
  const [state, dispatch] = useReducer(
    paymentReducer,
    initialState
  );


  const stateRef = useRef(state);
  const submitLockRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state.state === 'idle') {
      submitLockRef.current = false;
    }
  }, [state.state]);

  const pollTimerRef = useRef(null);


  const unknownTimerRef = useRef(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const clearUnknownTimer = useCallback(() => {
    if (unknownTimerRef.current) {
      clearTimeout(unknownTimerRef.current);
      unknownTimerRef.current = null;
    }
  }, []);

  const cleanupTimers = useCallback(() => {
    clearPollTimer();
    clearUnknownTimer();
  }, [
    clearPollTimer,
    clearUnknownTimer,
  ]);



  const enterUnknown = useCallback(() => {
    clearPollTimer();

    dispatch({
      type: 'ENTER_UNKNOWN',
    });

    clearUnknownTimer();

    unknownTimerRef.current = setTimeout(() => {
      if (
        stateRef.current.state === 'unknown'
      ) {
        clearPollTimer();

        dispatch({
          type: 'MANUAL_CHECK',
        });
      }
    }, UNKNOWN_TIMEOUT);
  }, [
    clearPollTimer,
    clearUnknownTimer,
  ]);


  const pollOnce = useCallback(
    async (paymentId) => {
      const currentState =
        stateRef.current.state;

      if (
        currentState !== 'polling' &&
        currentState !== 'unknown'
      ) {
        return;
      }

      try {
        const response =
          await withTimeout(
            pollPaymentStatus({
              paymentId,
            }),
            POLL_TIMEOUT
          );


        if (
          response?.status === 'success'
        ) {
          cleanupTimers();

          dispatch({
            type: 'SUCCESS',
            refId: response.refId,
          });

          return;
        }


        if (
          response?.status === 'failed'
        ) {
          cleanupTimers();

          dispatch({
            type: 'FAILED',
            reason: response.reason,
          });

          return;
        }

      

        if (
          stateRef.current.state === 'unknown'
        ) {
          const elapsed =
            Date.now() -
            stateRef.current.unknownStartedAt;

          if (elapsed >= UNKNOWN_TIMEOUT) {
            cleanupTimers();

            dispatch({
              type: 'MANUAL_CHECK',
            });

            return;
          }

        
          schedulePoll(paymentId);

          return;
        }

      
        const elapsed =
          Date.now() -
          stateRef.current.pollingStartedAt;

        if (elapsed >= UNKNOWN_TIMEOUT) {
          enterUnknown();
          return;
        }

        schedulePoll(paymentId);
      } catch (error) {

        enterUnknown();
      }
    },
    [
      cleanupTimers,
      enterUnknown,
    ]
  );

  const schedulePoll = useCallback(
    (paymentId) => {
      clearPollTimer();

      pollTimerRef.current =
        setTimeout(() => {
          pollOnce(paymentId);
        }, POLL_INTERVAL);
    },
    [
      clearPollTimer,
      pollOnce,
    ]
  );

  const startPolling = useCallback(
    (paymentId) => {
      dispatch({
        type: 'START_POLLING',
      });

      schedulePoll(paymentId);
    },
    [schedulePoll]
  );



  const initiate = useCallback(
    async ({
      upiId,
      amount,
      idempotencyKey,
    }) => {
      try {
        const response =
          await withTimeout(
            initiatePayment({
              upiId,
              amount,
              idempotencyKey,
            }),
            INIT_TIMEOUT
          );

    
        if (response?.error) {
          dispatch({
            type: 'FAILED',
            reason:
              getErrorMessage(
                response.error.code
              ),
          });
          submitLockRef.current = false;
          return;
        }
        if (
          response?.status === 'pending'
        ) {
          dispatch({
            type: 'INIT_PENDING',
            paymentId:
              response.paymentId,
          });
          startPolling(
            response.paymentId
          );
          return;
        }
      } catch (error) {
        enterUnknown();
      }
    },
    [
      enterUnknown,
      startPolling,
    ]
  );

  

  const handleSubmit = useCallback(
    ({ upiId, amount }) => {
      if (submitLockRef.current) {
        return;
      }

      if (stateRef.current.state !== 'idle') {
        return;
      }

      const idempotencyKey = createIdempotencyKey();

      submitLockRef.current = true;

      const nextState = paymentReducer(stateRef.current, {
        type: 'SUBMIT',
        upiId,
        amount,
        idempotencyKey,
      });

      stateRef.current = nextState;
      dispatch({
        type: 'SUBMIT',
        upiId,
        amount,
        idempotencyKey,
      });

      initiate({
        upiId,
        amount,
        idempotencyKey,
      });
    },
    [initiate]
  );



  useEffect(() => {
    const unsubscribe =
      addNetworkListener(
        (connected) => {
          if (connected) {
            return;
          }

          const current =
            stateRef.current;


          if (
            current.state === 'polling'
          ) {
            enterUnknown();
          }
        }
      );

    return unsubscribe;
  }, [enterUnknown]);



  useEffect(() => {
    return () => {
      clearPollTimer();
      clearUnknownTimer();
    };
  }, [
    clearPollTimer,
    clearUnknownTimer,
  ]);


  if (state.state === 'idle') {
    return (
      <PaymentEntryScreen
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <PaymentStatusScreen
      paymentState={state}
      onRetry={() => {
        cleanupTimers();
        submitLockRef.current = false;
        dispatch({
          type: 'RESET',
        });
      }}
    />
  );
}
