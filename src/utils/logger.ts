export interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: any;
}

type LogListener = (entry: LogEntry) => void;

class DebugLogger {
    private logs: LogEntry[] = [];
    private listeners: LogListener[] = [];
    private maxLogs = 50;

    log(level: 'info' | 'warn' | 'error', message: string, details?: any) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            details
        };

        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        this.listeners.forEach(listener => listener(entry));

        // Also log to browser console
        console[level](`[Debug] ${message}`, details || '');
    }

    info(message: string, details?: any) {
        this.log('info', message, details);
    }

    warn(message: string, details?: any) {
        this.log('warn', message, details);
    }

    error(message: string, details?: any) {
        this.log('error', message, details);
    }

    getLogs() {
        return this.logs;
    }

    subscribe(listener: LogListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

export const logger = new DebugLogger();
