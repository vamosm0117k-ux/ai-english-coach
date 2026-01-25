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
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                if (onErrorRef.current) {
                    onErrorRef.current(event.error);
                }
            }
            // Don't set isListening to false for no-speech, let it continue
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended, shouldRestart:', shouldRestartRef.current);
            // Auto-restart if should restart
            if (shouldRestartRef.current && !isStoppingRef.current) {
                console.log('Restarting speech recognition...');
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                        setIsListening(false);
                    }
                }, 100);
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
