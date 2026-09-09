import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

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
  } = paymentState;

  const [remainingSeconds, setRemainingSeconds] = useState(30);

  useEffect(() => {
    if (state !== 'unknown') {
      return;
    }

    const update = () => {
      const elapsed =
        Date.now() - unknownStartedAt;

      const remaining = Math.max(
        0,
        Math.ceil((30_000 - elapsed) / 1000)
      );

      setRemainingSeconds(remaining);
    };

    update();

    const timer = setInterval(update, 250);

    return () => clearInterval(timer);
  }, [state, unknownStartedAt]);

  switch (state) {
    case 'initiating':
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />

          <Text style={styles.title}>
            Sending payment...
          </Text>
        </View>
      );

    case 'pending':
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />

          <Text style={styles.title}>
            Processing...
          </Text>

          <Text style={styles.subtitle}>
            Payment is being processed
          </Text>
        </View>
      );

    case 'polling':
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />

          <Text style={styles.title}>
            Confirming with bank...
          </Text>
        </View>
      );

    case 'success':
      return (
        <View style={styles.container}>
        <View style={styles.successIconContainer}>
        
          <Text style={styles.successIcon}>✓</Text>
        </View>

          <Text style={styles.title}>
            Payment Successful
          </Text>

          <Text style={styles.amount}>
            ₹{amount}
          </Text>

          <Text style={styles.subtitle}>
            UPI Ref: {refId}
          </Text>
          <Pressable
            style={styles.button}
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>
              Pay another amount
            </Text>
          </Pressable>
        </View>
      );

    case 'failed':
      return (
        <View style={styles.container}>
          <Text style={styles.failedIcon}>✕</Text>

          <Text style={styles.title}>
            Payment Failed
          </Text>

          <Text style={styles.subtitle}>
            {reason}
          </Text>

          <Pressable
            style={styles.button}
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      );

    case 'unknown':
      return (
        <View style={styles.container}>
          <Text style={styles.warningIcon}>!</Text>

          <Text style={styles.title}>
            Could not confirm.
          </Text>

          <Text style={styles.subtitle}>
            Checking...
          </Text>

          <Text style={styles.countdown}>
            {remainingSeconds}s
          </Text>
        </View>
      );

    case 'manual_check':
      return (
        <View style={styles.container}>
          <Text style={styles.warningIcon}>!</Text>

          <Text style={styles.title}>
            Payment status unclear
          </Text>

          <Text style={styles.subtitle}>
            Check your UPI app.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => {
              // Support CTA
            }}
          >
            <Text style={styles.buttonText}>
              Contact support
            </Text>
          </Pressable>
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },

  amount: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 20,
  },

  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignSelf: 'center',
    justifyContent: 'center',
  },

  successIcon: {
    fontSize: 50,
    color: '#16a34a',
    alignSelf: 'center',
    justifyContent: 'center',
  },

  failedIcon: {
    fontSize: 64,
    color: '#dc2626',
  },

  warningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fef3c7',
    color: '#d97706',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 42,
  },

  countdown: {
    fontSize: 40,
    fontWeight: '700',
    marginTop: 24,
    color: '#d97706',
  },

  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
