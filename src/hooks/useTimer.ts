import { useEffect, useRef, useCallback } from 'react';

export function useTimer(
    isActive: boolean,
    onTick: () => void,
    onComplete?: () => void,
    timeRemaining?: number
) {
    const intervalRef = useRef<number | null>(null);

    const startTimer = useCallback(() => {
        if (intervalRef.current) return;

        intervalRef.current = window.setInterval(() => {
            onTick();
        }, 1000);
    }, [onTick]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            startTimer();
        } else {
            stopTimer();
        }

        return () => stopTimer();
    }, [isActive, startTimer, stopTimer]);

    useEffect(() => {
        if (timeRemaining !== undefined && timeRemaining <= 0 && onComplete) {
            stopTimer();
            onComplete();
        }
    }, [timeRemaining, onComplete, stopTimer]);

    return { startTimer, stopTimer };
}

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
