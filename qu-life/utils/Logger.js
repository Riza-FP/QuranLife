import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_STORAGE_KEY = 'app_debug_logs';
const MAX_LOGS = 50;

const Logger = {
    async logError(message, error) {
        try {
            const timestamp = new Date().toISOString();
            const errorDetails = error ? (error.message || JSON.stringify(error)) : '';
            const newLog = {
                id: Date.now().toString(),
                timestamp,
                level: 'ERROR',
                message,
                details: errorDetails
            };

            const existingLogs = await Logger.getLogs();
            const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);

            await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
            console.error(`[Logger] ${message}`, error); // Also log to console
        } catch (e) {
            console.error("Failed to save log:", e);
        }
    },

    async logInfo(message) {
        try {
            const timestamp = new Date().toISOString();
            const newLog = {
                id: Date.now().toString(),
                timestamp,
                level: 'INFO',
                message,
                details: ''
            };

            const existingLogs = await Logger.getLogs();
            const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);

            await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
            console.log(`[Logger] ${message}`);
        } catch (e) {
            console.error("Failed to save log:", e);
        }
    },

    async getLogs() {
        try {
            const logs = await AsyncStorage.getItem(LOG_STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            console.error("Failed to get logs:", e);
            return [];
        }
    },

    async clearLogs() {
        try {
            await AsyncStorage.removeItem(LOG_STORAGE_KEY);
        } catch (e) {
            console.error("Failed to clear logs:", e);
        }
    }
};

export default Logger;
