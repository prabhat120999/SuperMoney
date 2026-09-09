let _scenario = 'happy_path';
let _pollCount = 0;
export function __setScenario(s) { _scenario = s; _pollCount = 0; }
export function initiatePayment({ upiId, amount, idempotencyKey }) {
    return new Promise((resolve) => {
        if (_scenario === 'network_loss') return; // never resolves 
        setTimeout(() => {
            if (_scenario === 'invalid_vpa')
                return resolve({ error: { code: 'INVALID_VPA' } });
            if (_scenario === 'limit_exceeded')
                return resolve({ error: { code: 'LIMIT_EXCEEDED' } });
            resolve({ status: 'pending', paymentId: 'PAY_' + Date.now() });
        }, 1500);
    });
}
export function pollPaymentStatus({ paymentId }) {
    return new Promise((resolve) => {
        if (_scenario === 'network_drop_after_init') return; // never resolves
        setTimeout(() => {
            _pollCount++;
            if (_scenario === 'happy_path')
                return resolve(_pollCount >= 3
                    ? { status: 'success', refId: 'UPI' + Date.now() }
                    : { status: 'pending' });
            if (_scenario === 'known_failure')
                return resolve({ status: 'failed', reason: 'Insufficient balance' });
            if (_scenario === 'poll_timeout')
                return resolve({ status: 'pending' }); // never terminal
            resolve({ status: 'pending' });
        }, 800);
    });
} 
