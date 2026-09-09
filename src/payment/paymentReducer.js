export const initialState = {
    state: 'idle',
  
    upiId: '',
    amount: '',
  
    paymentId: null,
    idempotencyKey: null,
  
    startedAt: null,
    pollingStartedAt: null,
    unknownStartedAt: null,
  
    refId: null,
    reason: null,
  };
  
  export function paymentReducer(state, action) {
    switch (action.type) {
      case 'SUBMIT':
        if (state.state !== 'idle') return state;
  
        return {
          ...state,
          state: 'initiating',
          upiId: action.upiId,
          amount: action.amount,
          idempotencyKey: action.idempotencyKey,
          startedAt: Date.now(),
        };
  
      case 'INIT_PENDING':
        if (state.state !== 'initiating') return state;
  
        return {
          ...state,
          state: 'pending',
          paymentId: action.paymentId,
        };
  
      case 'START_POLLING':
        if (state.state !== 'pending') return state;
  
        return {
          ...state,
          state: 'polling',
          pollingStartedAt: Date.now(),
        };
  
      case 'SUCCESS':
        if (!['polling', 'unknown'].includes(state.state)) {
          return state;
        }
  
        return {
          ...state,
          state: 'success',
          refId: action.refId,
        };
  
      case 'FAILED':
        if (!['initiating', 'polling', 'unknown'].includes(state.state)) {
          return state;
        }
  
        return {
          ...state,
          state: 'failed',
          reason: action.reason,
        };
  
      case 'ENTER_UNKNOWN':
        if (!['initiating', 'polling'].includes(state.state)) {
          return state;
        }
  
        return {
          ...state,
          state: 'unknown',
          unknownStartedAt: Date.now(),
        };
  
      case 'MANUAL_CHECK':
        if (state.state !== 'unknown') return state;
  
        return {
          ...state,
          state: 'manual_check',
        };
  
      case 'RESET':
        return initialState;
  
      default:
        return state;
    }
  }
  