import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const UNKNOWN_TIMEOUT = 30_000;

function formatElapsed(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

export default function PaymentStatusScreen({
  paymentState,
  onRetry,
}) {
  const {
    state,
    amount,
    refId,
    reason,
    unknownStartedAt,
    startedAt,
  } = paymentState;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (
      !['pending', 'unknown'].includes(state)
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(interval);
  }, [state]);

  const pendingElapsed = startedAt
    ? formatElapsed(now - startedAt)
    : '0s';

  const unknownElapsed = unknownStartedAt
    ? now - unknownStartedAt
    : 0;

  const remainingSeconds = Math.max(
    0,
    Math.ceil(
      (UNKNOWN_TIMEOUT - unknownElapsed) / 1000,
    ),
  );

  const renderContent = () => {
    switch (state) {
      case 'initiating':
        return (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>
              Sending payment...
            </Text>
          </>
        );

      case 'pending':
        return (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>
              Processing...
            </Text>
            <Text style={styles.subtitle}>
              Payment is being processed
            </Text>
            <Text style={styles.timer}>
              Elapsed: {pendingElapsed}
            </Text>
          </>
        );

      case 'polling':
        return (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>
              Confirming with bank...
            </Text>
          </>
        );

      case 'success':
        return (
          <>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.title}>
              Payment successful
            </Text>
            <Text style={styles.amount}>
              ₹{amount}
            </Text>
            <Text style={styles.subtitle}>
              UPI reference: {refId}
            </Text>

            <Pressable
              onPress={onRetry}
              style={styles.button}>
              <Text style={styles.buttonText}>
                Pay another amount
              </Text>
            </Pressable>
          </>
        );

      case 'failed':
        return (
          <>
            <Text style={styles.failedIcon}>×</Text>
            <Text style={styles.title}>
              Payment failed
            </Text>
            <Text style={styles.subtitle}>
              {reason}
            </Text>

            <Pressable
              onPress={onRetry}
              style={styles.button}>
              <Text style={styles.buttonText}>
                Try again
              </Text>
            </Pressable>
          </>
        );

      case 'unknown':
        return (
          <>
            <Text style={styles.unknownIcon}>!</Text>
            <Text style={styles.title}>
              Could not confirm.
            </Text>
            <Text style={styles.subtitle}>
              Checking...
            </Text>
            <Text style={styles.timer}>
              Checking for {remainingSeconds}s
            </Text>
          </>
        );

      case 'manual_check':
        return (
          <>
            <Text style={styles.unknownIcon}>!</Text>
            <Text style={styles.title}>
              Payment status unclear
            </Text>
            <Text style={styles.subtitle}>
              Check your UPI app.
            </Text>

            <Pressable
              onPress={onRetry}
              style={styles.button}>
              <Text style={styles.buttonText}>
                Contact support
              </Text>
            </Pressable>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  amount: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 16,
  },
  timer: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  successContainer:{
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgreen',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'green',
  },
  successIcon: {
    fontSize: 72,
    color: 'green',
  },
  failedIcon: {
    fontSize: 72,
    color: 'red',
  },
  unknownIcon: {
    fontSize: 72,
    color: '#D99000',
  },
  button: {
    marginTop: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});