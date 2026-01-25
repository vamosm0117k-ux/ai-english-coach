import { useState, useEffect, useCallback, useRef } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { TimeCheckModal } from './components/TimeCheckModal';
import { FeedbackScreen } from './components/FeedbackScreen';
import { useAppState } from './hooks/useAppState';
import { useTimer } from './hooks/useTimer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import {
    initializeGemini,
    getRandomTopic,
    getConversationResponse,
    generateFeedback,
    getDemoResponse,
    getDemoFeedback,
    speakText,
    MODELS,
} from './services/geminiService';
import type { Message, SpeechRecognitionResult } from './types';

function App() {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MODELS[0].value);

    const {
        state,
        setDuration,
        startConversation,
        addMessage,
        addAudioBlob,
        tickTimer,
        extendTime,
        setFeedback,
        goToFeedback,
        setListening,
        setProcessing,
        setApiKey,
        setError,
        reset,
    } = useAppState();

    const [interimTranscript, setInterimTranscript] = useState('');
    const pendingTranscriptRef = useRef('');
    const debounceTimeoutRef = useRef<number | null>(null);
    const accumulatedTranscriptRef = useRef('');
    const stopListeningRef = useRef<() => void>(() => { });
    const startListeningRef = useRef<() => void>(() => { });

    // Handle AI response
    const handleAIResponse = useCallback(async (messages: Message[]) => {
        setProcessing(true);
        try {
            // Validate model (fallback to default if selected is invalid)
            const modelToUse = MODELS.some(m => m.value === selectedModel)
                ? selectedModel
                : MODELS[0].value;

            const response = await getConversationResponse(messages, state.currentTopic, modelToUse);
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
            };
            addMessage(aiMessage);
            // Stop listening while AI speaks, then restart
            stopListeningRef.current();
            try {
                await speakText(response);
            } catch (e) {
                console.error('Speech error:', e);
            }
            startListeningRef.current();
        } catch (error) {
            console.error('AI response error full details:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setError(`AIからの応答を取得できませんでした: ${errorMessage.slice(0, 100)}...`);
        }
        setProcessing(false);
    }, [state.currentTopic, selectedModel, addMessage, setProcessing, setError]);

    const sendAccumulatedMessage = useCallback(() => {
        const text = accumulatedTranscriptRef.current.trim();
        if (!text) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };
        addMessage(userMessage);

        // Reset accumulation
        accumulatedTranscriptRef.current = '';

        if (isDemoMode) {
            // Simulate demo AI response
            setProcessing(true);
            setTimeout(() => {
                const demoResponse = getDemoResponse();
                const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: demoResponse,
                    timestamp: Date.now(),
                };
                // Stop listening while AI speaks
                stopListeningRef.current();
                addMessage(aiMessage);
                // Speak the response, then restart listening
                speakText(demoResponse)
                    .catch(console.error)
                    .finally(() => startListeningRef.current());
                setProcessing(false);
            }, 1500);
        } else {
            handleAIResponse([...state.messages, userMessage]);
        }
    }, [isDemoMode, addMessage, state.messages, handleAIResponse, setProcessing]);

    // Speech recognition callback
    const handleSpeechResult = useCallback((result: SpeechRecognitionResult) => {
        // Always clear existing timeout on new input
        if (debounceTimeoutRef.current) {
            window.clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }

        if (result.isFinal) {
            // Clear interim
            setInterimTranscript('');
            pendingTranscriptRef.current = '';

            if (result.transcript.trim()) {
                // Append to accumulation
                const text = result.transcript.trim();
                accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + text;

                // Set timeout to send (Debounce 7s - wait for user to finish speaking)
                debounceTimeoutRef.current = window.setTimeout(sendAccumulatedMessage, 7000);
            }
        } else {
            // Update interim transcript
            setInterimTranscript(result.transcript);
            pendingTranscriptRef.current = result.transcript;
        }
    }, [sendAccumulatedMessage]);

    const handleSpeechError = useCallback((error: string) => {
        console.error('Speech error:', error);
        if (error === 'not-allowed') {
            setError('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
        }
    }, [setError]);

    const {
        isListening,
        isSupported: speechSupported,
        startListening,
        stopListening,
    } = useSpeechRecognition(handleSpeechResult, handleSpeechError);

    const {
        startRecording,
        stopRecording,
    } = useAudioRecorder(addAudioBlob);

    // Timer
    useTimer(
        state.phase === 'conversation',
        tickTimer,
        undefined,
        state.timeRemaining
    );

    // Update listening state
    useEffect(() => {
        setListening(isListening);
    }, [isListening, setListening]);

    // Keep refs updated with latest functions
    useEffect(() => {
        stopListeningRef.current = stopListening;
        startListeningRef.current = startListening;
    }, [stopListening, startListening]);



    // Start conversation
    const handleStart = useCallback(async () => {
        if (!state.apiKey) return;

        setProcessing(true);
        initializeGemini(state.apiKey);
        const topic = getRandomTopic();
        startConversation(topic);

        // Validate model (fallback to default if selected is invalid)
        const modelToUse = MODELS.some(m => m.value === selectedModel)
            ? selectedModel
            : MODELS[0].value;

        // Start recording and listening
        await startRecording();
        startListening();

        // Get initial AI greeting
        try {
            const response = await getConversationResponse([], topic, modelToUse);
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
            };
            addMessage(aiMessage);
            // Stop listening while AI speaks greeting, then restart
            stopListening();
            try {
                await speakText(response);
            } catch (e) {
                console.error('Speech error:', e);
            }
            startListening();
        } catch (error: unknown) {
            console.error('Initial greeting error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('API key not valid')) {
                setError('API Keyが無効です。正しいキーを入力してください。');
            } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                setError('API利用上限（429 Error）です。\n\n【重要】Gemini Advanced会員でも、API Keyのプロジェクトに「請求先アカウント（クレカ）」紐付けがないと無料枠扱いになります。\nGoogle AI Studio/Cloud Consoleで請求設定をご確認ください。\n\nまたは、モデルを「Gemini 1.5 Pro」に変更して再試行してください。');
            } else {
                setError(`接続エラー: ${errorMessage}`);
            }
        }
        setProcessing(false);
    }, [state.apiKey, startConversation, startRecording, startListening, addMessage, setProcessing, setError]);

    // Start demo mode (no API needed)
    const handleStartDemo = useCallback(async () => {
        setIsDemoMode(true);
        const topic = 'travel and memorable trips';
        startConversation(topic);

        // Start recording and listening
        await startRecording();
        startListening();

        // Get demo AI greeting
        setProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        const demoGreeting = getDemoResponse();
        const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: demoGreeting,
            timestamp: Date.now(),
        };
        addMessage(aiMessage);
        // Stop listening while AI speaks greeting
        stopListening();
        // Speak the greeting, then restart listening
        speakText(demoGreeting)
            .catch(console.error)
            .finally(() => startListening());
        setProcessing(false);
    }, [startConversation, startRecording, startListening, addMessage, setProcessing]);

    // Continue conversation
    const handleContinue = useCallback(() => {
        extendTime(5);
        startListening();
    }, [extendTime, startListening]);

    // Finish and get feedback
    const handleFinish = useCallback(async () => {
        stopListening();
        stopRecording();
        goToFeedback();
        setProcessing(true);

        try {
            // Use demo feedback if in demo mode
            const feedback = isDemoMode
                ? getDemoFeedback()
                : await generateFeedback(state.messages);
            setFeedback(feedback);
        } catch (error) {
            console.error('Feedback generation error:', error);
            setError('フィードバックの生成に失敗しました。');
        }
        setProcessing(false);
    }, [isDemoMode, stopListening, stopRecording, goToFeedback, setProcessing, state.messages, setFeedback, setError]);

    // Handle time check phase - pause listening
    useEffect(() => {
        if (state.phase === 'timeCheck') {
            stopListening();
        }
    }, [state.phase, stopListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
            stopRecording();
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [stopListening, stopRecording]);

    // Render based on phase
    if (!speechSupported) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div className="glass-card p-8 max-w-md text-center space-y-4">
                    <div className="text-5xl">😞</div>
                    <h1 className="text-2xl font-bold text-white">ブラウザ未対応</h1>
                    <p className="text-white/60">
                        このブラウザは音声認識に対応していません。
                        <br />
                        Chrome、Edge、またはSafariをお使いください。
                    </p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div className="glass-card p-8 max-w-md text-center space-y-4">
                    <div className="text-5xl">⚠️</div>
                    <h1 className="text-2xl font-bold text-white">エラーが発生しました</h1>
                    <p className="text-white/60">{state.error}</p>
                    <button onClick={reset} className="btn-primary">
                        最初からやり直す
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {state.phase === 'setup' && (
                <SetupScreen
                    duration={state.duration}
                    apiKey={state.apiKey}
                    selectedModel={selectedModel}
                    onDurationChange={setDuration}
                    onApiKeyChange={setApiKey}
                    onModelChange={setSelectedModel}
                    onStart={handleStart}
                    onStartDemo={handleStartDemo}
                />
            )}

            {state.phase === 'conversation' && (
                <ConversationScreen
                    messages={state.messages}
                    timeRemaining={state.timeRemaining}
                    isListening={state.isListening}
                    isProcessing={state.isProcessing}
                    currentTopic={state.currentTopic}
                    interimTranscript={interimTranscript}
                />
            )}

            {state.phase === 'timeCheck' && (
                <>
                    <ConversationScreen
                        messages={state.messages}
                        timeRemaining={0}
                        isListening={false}
                        isProcessing={false}
                        currentTopic={state.currentTopic}
                        interimTranscript=""
                    />
                    <TimeCheckModal onContinue={handleContinue} onFinish={handleFinish} />
                </>
            )}

            {state.phase === 'feedback' && (
                state.feedback ? (
                    <FeedbackScreen feedback={state.feedback} onNewSession={reset} />
                ) : (
                    <div className="min-h-screen gradient-bg flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-white/60">フィードバックを生成中...</p>
                        </div>
                    </div>
                )
            )}
        </>
    );
}

export default App;
