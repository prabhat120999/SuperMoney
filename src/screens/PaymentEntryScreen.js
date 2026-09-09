import React, { useMemo, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const UPI_REGEX =
    /^[a-zA-Z0-9]+@[a-zA-Z]+$/;

export default function PaymentEntryScreen({ onSubmit }) {
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');

    const trimmedUpiId = upiId.trim();

    const validUpi = useMemo(
        () => UPI_REGEX.test(trimmedUpiId),
        [trimmedUpiId],
    );

    const numericAmount = useMemo(
        () => Number(amount),
        [amount],
    );

    const validAmount = useMemo(
        () =>
            amount.length > 0 &&
            Number.isFinite(numericAmount) &&
            numericAmount >= 1,
        [amount, numericAmount],
    );

    const canPay = validUpi && validAmount;

    const handlePay = () => {
        if (!canPay) {
            return;
        }

        onSubmit({
            upiId: trimmedUpiId,
            amount: numericAmount,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Make Payment</Text>

            <Text style={styles.label}>UPI ID</Text>

            <TextInput
                value={upiId}
                onChangeText={setUpiId}
                placeholder="name@bank"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
            />

            {upiId.length > 0 && !validUpi && (
                <Text style={styles.error}>
                    Enter a valid UPI ID, for example name@bank
                </Text>
            )}

            <Text style={styles.label}>Amount</Text>

            <TextInput
                value={amount}
                onChangeText={text => {
                    if (/^\d*(\.\d{0,2})?$/.test(text)) {
                        setAmount(text);
                    }
                }}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                style={styles.input}
            />

            {amount.length > 0 && !validAmount && (
                <Text style={styles.error}>
                    Amount must be at least ₹1
                </Text>
            )}
            {validUpi?<>
            <Text style={styles.labelPayingTo}>
                Paying to:
            </Text>
            <View style={styles.recipientCard}>
                <Text style={styles.recipientName}>
                    Amit Kumar
                </Text>

                <Text style={styles.recipientBank}>
                    ICICI Bank
                </Text>
            </View>
            </>
            : null}

            <Pressable
                disabled={!canPay}
                onPress={handlePay}
                style={[
                    styles.button,
                    !canPay && styles.disabledButton,
                ]}>
                <Text style={styles.buttonText}>
                    Pay Now {validAmount ? `₹${numericAmount}` : ''}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0D0D0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 6,
    },
    error: {
        color: '#D32F2F',
        fontSize: 12,
        marginBottom: 16,
    },
    labelPayingTo: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 16,
    },
    recipientCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        marginTop: 8,
    },
    recipientName: {
        fontSize: 16,
        fontWeight: '600',
    },
    recipientBank: {
        marginTop: 4,
        color: '#666',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#111',
        marginTop: 24,
    },
    disabledButton: {
        backgroundColor: '#BDBDBD',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});