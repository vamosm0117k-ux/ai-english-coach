import { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognitionResult } from '../types';
import { logger } from '../utils/logger';

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    onaudiostart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export function useSpeechRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isStoppingRef = useRef(false);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);
    const shouldRestartRef = useRef(false);

    // Keep refs updated
    useEffect(() => {
        onResultRef.current = onResult;
        onErrorRef.current = onError;
    }, [onResult, onError]);

    // Initialize speech recognition once
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            logger.error('Speech Recognition API not supported');
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const lastResult = event.results[event.results.length - 1];
            const transcript = lastResult[0].transcript;
            const isFinal = lastResult.isFinal;

            onResultRef.current({ transcript, isFinal });
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            logger.error('Speech recognition error:', { error: event.error, message: event.message });
            // Most errors should allow restart, only stop for fatal errors
            if (event.error === 'not-allowed') {
                if (onErrorRef.current) {
                    onErrorRef.current(event.error);
                }
                setIsListening(false);
                shouldRestartRef.current = false;
            } else if (event.error === 'network') {
                logger.warn('Network error - will retry');
                // Allow restart
            } else if (event.error === 'no-speech') {
                logger.info('No speech detected - continuing to listen');
                // Don't stop, just continue
            } else if (event.error === 'aborted') {
                logger.info('Recognition aborted');
                // Check if we should restart
            } else {
                logger.warn('Other speech error:', event.error);
            }
        };

        recognition.onend = () => {
            logger.info('Speech recognition ended', { shouldRestart: shouldRestartRef.current, isStopping: isStoppingRef.current });
            // Auto-restart if should restart
            if (shouldRestartRef.current && !isStoppingRef.current) {
                logger.info('Restarting speech recognition...');
                // Longer delay for Android
                setTimeout(() => {
                    if (!shouldRestartRef.current || isStoppingRef.current) {
                        logger.info('Restart cancelled');
                        setIsListening(false);
                        return;
                    }
                    try {
                        recognition.start();
                        logger.info('Recognition restarted successfully');
                    } catch (e) {
                        logger.error('Failed to restart recognition:', e);
                        // Try again after another delay
                        setTimeout(() => {
                            if (shouldRestartRef.current && !isStoppingRef.current) {
                                try {
                                    recognition.start();
                                } catch (e2) {
                                    logger.error('Second restart attempt failed:', e2);
                                    setIsListening(false);
                                }
                            }
                        }, 500);
                    }
                }, 200);
            } else {
                setIsListening(false);
            }
        };

        recognition.onstart = () => {
            logger.info('Speech recognition started');
            setIsListening(true);
        };

        recognition.onaudiostart = () => {
            logger.info('Audio capture started');
        };

        recognitionRef.current = recognition;

        return () => {
            isStoppingRef.current = true;
            shouldRestartRef.current = false;
            recognition.abort();
        };
    }, []); // Empty dependency - only run once

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) {
            logger.error('Speech recognition not available for start');
            return;
        }

        logger.info('Starting speech recognition...');
        isStoppingRef.current = false;
        shouldRestartRef.current = true;

        try {
            recognitionRef.current.start();
        } catch (e) {
            logger.error('Error starting recognition:', e);
            // Already started, that's ok
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        logger.info('Stopping speech recognition...');
        isStoppingRef.current = true;
        shouldRestartRef.current = false;
        recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
    };
}
