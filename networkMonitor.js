import NetInfo from '@react-native-community/netinfo';
let _forcedState = null;
const _listeners = new Set();
export function __simulateOffline() {
    _forcedState = false;
    _listeners.forEach(fn => fn(false));
}
export function __simulateOnline() {
    _forcedState = null;
    NetInfo.fetch().then(s => _listeners.forEach(fn => fn(s.isConnected)));
}
export function addNetworkListener(fn) {
    _listeners.add(fn);
    const unsub = NetInfo.addEventListener(s => {
        if (_forcedState === null) fn(s.isConnected);
    });
    return () => { _listeners.delete(fn); unsub(); };
}
export async function isConnected() {
    if (_forcedState !== null) return _forcedState;
    const state = await NetInfo.fetch();
    return state.isConnected;
} 
