import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

const PaymentEntryScreen = ({ onSubmit }) => {
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');

    const validUpi = UPI_REGEX.test(upiId.trim());

    const numericAmount = Number(amount);

    const validAmount =
        amount.length > 0 && Number.isFinite(numericAmount) && numericAmount >= 1;

    const canPay = validUpi && validAmount;

    const handlePay = () => {
        if (!canPay) return;

        onSubmit({
            upiId: upiId.trim(),
            amount: numericAmount,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Send Money</Text>

            <Text style={styles.payementLabel}>Enter Payement Details</Text>
            <Text style={styles.label}>UPI ID</Text>

            <TextInput
                style={[
                    styles.input,
                    upiId.length > 0 && !validUpi && styles.inputError,
                ]}
                placeholder="name@bank"
                autoCapitalize="none"
                keyboardType="email-address"
                value={upiId}
                onChangeText={setUpiId}
            />

            {upiId.length > 0 && !validUpi && (
                <Text style={styles.error}>Enter a valid UPI ID, e.g. name@bank</Text>
            )}

            <Text style={styles.label}>Amount (Rs)</Text>

            <TextInput
                style={[
                    styles.input,
                    amount.length > 0 && !validAmount && styles.inputError,
                ]}
                placeholder="Amount"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
            />

            {amount.length > 0 && !validAmount && (
                <Text style={styles.error}>Amount must be at least ₹1</Text>
            )}
            <Text>Paying to</Text>
            <Text>Amit Kumar</Text>
            <Text>Icici Bank</Text>
            <Pressable
                onPress={handlePay}
                disabled={!canPay}
                style={[styles.button, !canPay && styles.buttonDisabled]}>
                <Text style={styles.buttonText}>Pay Now {validAmount ? `Rs.${amount}` : ''}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 32,
    },
    payementLabel: {
        fontSize: 14,
        // fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
    },

    inputError: {
        borderColor: '#dc2626',
    },

    error: {
        color: '#dc2626',
        marginTop: 6,
        fontSize: 13,
    },

    button: {
        height: 52,
        borderRadius: 10,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },

    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
export default PaymentEntryScreen;