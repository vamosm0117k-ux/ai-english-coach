import { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognitionResult } from '../types';

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
            console.error('Speech Recognition API not supported');
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
            console.error('Speech recognition error:', event.error, event.message);
            // Most errors should allow restart, only stop for fatal errors
            if (event.error === 'not-allowed') {
                if (onErrorRef.current) {
                    onErrorRef.current(event.error);
                }
                setIsListening(false);
                shouldRestartRef.current = false;
            } else if (event.error === 'network') {
                console.log('Network error - will retry');
                // Allow restart
            } else if (event.error === 'no-speech') {
                console.log('No speech detected - continuing to listen');
                // Don't stop, just continue
            } else if (event.error === 'aborted') {
                console.log('Recognition aborted');
                // Check if we should restart
            } else {
                console.log('Other error:', event.error, '- will retry');
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended, shouldRestart:', shouldRestartRef.current, 'isStopping:', isStoppingRef.current);
            // Auto-restart if should restart
            if (shouldRestartRef.current && !isStoppingRef.current) {
                console.log('Restarting speech recognition...');
                // Longer delay for Android
                setTimeout(() => {
                    if (!shouldRestartRef.current || isStoppingRef.current) {
                        console.log('Restart cancelled');
                        setIsListening(false);
                        return;
                    }
                    try {
                        recognition.start();
                        console.log('Recognition restarted successfully');
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                        // Try again after another delay
                        setTimeout(() => {
                            if (shouldRestartRef.current && !isStoppingRef.current) {
                                try {
                                    recognition.start();
                                } catch (e2) {
                                    console.error('Second restart attempt failed:', e2);
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
            console.log('Speech recognition started');
            setIsListening(true);
        };

        recognition.onaudiostart = () => {
            console.log('Audio capture started');
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
            console.error('Speech recognition not available');
            return;
        }

        console.log('Starting speech recognition...');
        isStoppingRef.current = false;
        shouldRestartRef.current = true;

        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
            // Already started, that's ok
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        console.log('Stopping speech recognition...');
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
