import { useEffect, useRef, useState } from 'react';
import { Timer } from './Timer';
import { WaveformVisualizer } from './WaveformVisualizer';
import type { Message } from '../types';

interface ConversationScreenProps {
    messages: Message[];
    timeRemaining: number;
    isListening: boolean;
    isProcessing: boolean;
    currentTopic: string;
    interimTranscript: string;
}

// Component for AI message bubble with show/hide text
function AIMessageBubble({ message }: { message: Message }) {
    const [showText, setShowText] = useState(false);

    return (
        <div className="animate-slide-up message-bubble-ai">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1 space-y-2">
                    {showText ? (
                        <p className="text-white leading-relaxed">{message.content}</p>
                    ) : (
                        <p className="text-white/50 italic">🔊 音声を聞いてください</p>
                    )}
                    <button
                        onClick={() => setShowText(!showText)}
                        className="text-xs text-accent/80 hover:text-accent transition-colors flex items-center gap-1"
                    >
                        {showText ? (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                テキストを隠す
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                テキストを表示
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ConversationScreen({
    messages,
    timeRemaining,
    isListening,
    isProcessing,
    currentTopic,
    interimTranscript,
}: ConversationScreenProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, interimTranscript]);

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            {/* Timer */}
            <Timer timeRemaining={timeRemaining} />

            {/* Topic indicator */}
            <div className="fixed top-6 left-6 z-50">
                <div className="glass-card px-4 py-2 text-white/60 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>Topic: {currentTopic}</span>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col pt-20 pb-6 px-6 max-w-4xl mx-auto w-full">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                    {messages.map((message) => (
                        message.role === 'assistant' ? (
                            <AIMessageBubble key={message.id} message={message} />
                        ) : (
                            <div
                                key={message.id}
                                className="animate-slide-up message-bubble-user"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <p className="text-white leading-relaxed">{message.content}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm">👤</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}

                    {/* Interim transcript (what user is currently saying) */}
                    {interimTranscript && (
                        <div className="message-bubble-user opacity-70">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-white/70 italic">{interimTranscript}...</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm">👤</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Waveform visualizer */}
                <div className="py-8">
                    <WaveformVisualizer isListening={isListening} isProcessing={isProcessing} />
                </div>

                {/* Hint text */}
                <p className="text-center text-white/40 text-sm">
                    {isListening
                        ? '話してください - あなたの声を聞いています...'
                        : isProcessing
                            ? 'AIが応答を考えています...'
                            : '音声認識を開始しています...'}
                </p>
            </div>
        </div>
    );
}
