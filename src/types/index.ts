// Application Phase States
export type AppPhase = 'setup' | 'conversation' | 'timeCheck' | 'feedback';

// Message type for conversation history
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

// Pronunciation issue in feedback
export interface PronunciationIssue {
    word: string;
    ipa: string;
    explanation: string;
    tip: string;
}

// Grammar correction in feedback
export interface GrammarCorrection {
    original: string;
    corrected: string;
    explanation: string;
    grammarPoint: string;
}

// Vocabulary suggestion in feedback
export interface VocabularySuggestion {
    used: string;
    suggested: string[];
    context: string;
    explanation: string;
}

// Complete feedback structure
export interface Feedback {
    pronunciation: {
        summary: string;
        issues: PronunciationIssue[];
    };
    grammar: {
        summary: string;
        corrections: GrammarCorrection[];
    };
    vocabulary: {
        summary: string;
        suggestions: VocabularySuggestion[];
    };
    overallComment: string;
}

// App state interface
export interface AppState {
    phase: AppPhase;
    duration: number; // in minutes
    timeRemaining: number; // in seconds
    messages: Message[];
    audioBlobs: Blob[];
    feedback: Feedback | null;
    isListening: boolean;
    isProcessing: boolean;
    currentTopic: string;
    apiKey: string;
    error: string | null;
}

// Action types for state reducer
export type AppAction =
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'START_CONVERSATION'; payload: { topic: string } }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'ADD_AUDIO_BLOB'; payload: Blob }
    | { type: 'TICK_TIMER' }
    | { type: 'EXTEND_TIME'; payload: number }
    | { type: 'SHOW_TIME_CHECK' }
    | { type: 'SET_FEEDBACK'; payload: Feedback }
    | { type: 'GO_TO_FEEDBACK' }
    | { type: 'SET_LISTENING'; payload: boolean }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_API_KEY'; payload: string }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET' };

// Speech recognition result type
export interface SpeechRecognitionResult {
    transcript: string;
    isFinal: boolean;
}
