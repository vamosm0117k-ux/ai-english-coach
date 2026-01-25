import { useReducer, useCallback } from 'react';
import type { AppState, AppAction, Message, Feedback } from '../types';

const initialState: AppState = {
    phase: 'setup',
    duration: 5,
    timeRemaining: 5 * 60,
    messages: [],
    audioBlobs: [],
    feedback: null,
    isListening: false,
    isProcessing: false,
    currentTopic: '',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_DURATION':
            return {
                ...state,
                duration: action.payload,
                timeRemaining: action.payload * 60,
            };
        case 'START_CONVERSATION':
            return {
                ...state,
                phase: 'conversation',
                currentTopic: action.payload.topic,
                timeRemaining: state.duration * 60,
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        case 'ADD_AUDIO_BLOB':
            return {
                ...state,
                audioBlobs: [...state.audioBlobs, action.payload],
            };
        case 'TICK_TIMER':
            const newTime = state.timeRemaining - 1;
            if (newTime <= 0 && state.phase === 'conversation') {
                return { ...state, timeRemaining: 0, phase: 'timeCheck' };
            }
            return { ...state, timeRemaining: newTime };
        case 'EXTEND_TIME':
            return {
                ...state,
                phase: 'conversation',
                timeRemaining: state.timeRemaining + action.payload * 60,
            };
        case 'SHOW_TIME_CHECK':
            return { ...state, phase: 'timeCheck' };
        case 'SET_FEEDBACK':
            return { ...state, feedback: action.payload };
        case 'GO_TO_FEEDBACK':
            return { ...state, phase: 'feedback' };
        case 'SET_LISTENING':
            return { ...state, isListening: action.payload };
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.payload };
        case 'SET_API_KEY':
            return { ...state, apiKey: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'RESET':
            return { ...initialState, apiKey: state.apiKey };
        default:
            return state;
    }
}

export function useAppState() {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const setDuration = useCallback((minutes: number) => {
        dispatch({ type: 'SET_DURATION', payload: minutes });
    }, []);

    const startConversation = useCallback((topic: string) => {
        dispatch({ type: 'START_CONVERSATION', payload: { topic } });
    }, []);

    const addMessage = useCallback((message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []);

    const addAudioBlob = useCallback((blob: Blob) => {
        dispatch({ type: 'ADD_AUDIO_BLOB', payload: blob });
    }, []);

    const tickTimer = useCallback(() => {
        dispatch({ type: 'TICK_TIMER' });
    }, []);

    const extendTime = useCallback((minutes: number) => {
        dispatch({ type: 'EXTEND_TIME', payload: minutes });
    }, []);

    const showTimeCheck = useCallback(() => {
        dispatch({ type: 'SHOW_TIME_CHECK' });
    }, []);

    const setFeedback = useCallback((feedback: Feedback) => {
        dispatch({ type: 'SET_FEEDBACK', payload: feedback });
    }, []);

    const goToFeedback = useCallback(() => {
        dispatch({ type: 'GO_TO_FEEDBACK' });
    }, []);

    const setListening = useCallback((listening: boolean) => {
        dispatch({ type: 'SET_LISTENING', payload: listening });
    }, []);

    const setProcessing = useCallback((processing: boolean) => {
        dispatch({ type: 'SET_PROCESSING', payload: processing });
    }, []);

    const setApiKey = useCallback((key: string) => {
        dispatch({ type: 'SET_API_KEY', payload: key });
    }, []);

    const setError = useCallback((error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return {
        state,
        setDuration,
        startConversation,
        addMessage,
        addAudioBlob,
        tickTimer,
        extendTime,
        showTimeCheck,
        setFeedback,
        goToFeedback,
        setListening,
        setProcessing,
        setApiKey,
        setError,
        reset,
    };
}
