import { useState, useEffect } from 'react';
import { speakText, unlockAudio } from '../services/geminiService';
import { logger } from '../utils/logger';

interface SetupScreenProps {
    duration: number;
    apiKey: string;
    onDurationChange: (minutes: number) => void;
    onApiKeyChange: (key: string) => void;
    onStart: () => void;
    onStartDemo: () => void;
}

const TIME_OPTIONS = [
    { value: 1, label: '1分', description: 'テスト用' },
    { value: 5, label: '5分', description: '短い練習' },
    { value: 10, label: '10分', description: '標準的な練習' },
    { value: 15, label: '15分', description: '充実した練習' },
    { value: 20, label: '20分', description: '本格的な練習' },
];

export function SetupScreen({
    duration,
    apiKey,
    onDurationChange,
    onApiKeyChange,
    onStart,
    onStartDemo,
}: SetupScreenProps) {
    const [showApiInput, setShowApiInput] = useState(!apiKey);
    const [isTestingAudio, setIsTestingAudio] = useState(false);

    useEffect(() => {
        // Attempt to unlock audio on mount (though usually requires interaction)
        unlockAudio();
    }, []);

    const handleAudioTest = async () => {
        if (isTestingAudio) return;
        setIsTestingAudio(true);
        logger.info('Starting audio test...');

        // Ensure unlock is called on interaction
        unlockAudio();

        try {
            await speakText("This is an audio test. Can you hear me?");
            logger.info('Audio test completed');
        } catch (e) {
            logger.error('Audio test failed', e);
        } finally {
            setIsTestingAudio(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-10 animate-fade-in">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-2xl mb-4">
                        <svg
                            className="w-12 h-12 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold gradient-text">
                        AI English Coach
                    </h1>
                    <p className="text-white/60 text-lg">
                        AIと英会話を練習して、詳細なフィードバックを受け取りましょう
                    </p>
                </div>

                {/* API Key Input */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Gemini API Key
                        </h2>
                        {apiKey && (
                            <button
                                onClick={() => setShowApiInput(!showApiInput)}
                                className="text-sm text-accent hover:text-accent-light transition-colors"
                            >
                                {showApiInput ? '隠す' : '変更する'}
                            </button>
                        )}
                    </div>

                    {showApiInput && (
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => onApiKeyChange(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder-white/30 focus:outline-none focus:border-accent
                         transition-colors"
                        />
                    )}

                    {apiKey && !showApiInput && (
                        <p className="text-green-400 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            API Keyが設定されています
                        </p>
                    )}
                </div>


                {/* Duration Selection */}
                <div className="glass-card p-6 space-y-6">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        会話時間を選択
                    </h2>

                    <div className="grid grid-cols-5 gap-3">
                        {TIME_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onDurationChange(option.value)}
                                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${duration === option.value
                                        ? 'bg-gradient-to-r from-accent to-primary-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                    }
                `}
                            >
                                <div className="text-2xl font-bold">{option.value}</div>
                                <div className="text-xs opacity-70">分</div>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-white/50 text-sm">
                        {TIME_OPTIONS.find(o => o.value === duration)?.description}
                    </p>
                </div>

                {/* Audio Test Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleAudioTest}
                        disabled={isTestingAudio}
                        className="text-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2 text-white/70"
                    >
                        {isTestingAudio ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                テスト再生中...
                            </>
                        ) : (
                            <>
                                <span>🔊</span>
                                音声テスト（クリックして確認）
                            </>
                        )}
                    </button>
                </div>

                {/* Start Button */}
                <button
                    onClick={() => {
                        unlockAudio();
                        onStart();
                    }}
                    disabled={!apiKey}
                    className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    会話を開始する
                </button>

                {/* Demo Mode Button */}
                <button
                    onClick={() => {
                        unlockAudio();
                        onStartDemo();
                    }}
                    className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-3"
                >
                    <span className="text-xl">🎮</span>
                    デモモードで試す（API不要）
                </button>

                {!apiKey && (
                    <p className="text-center text-white/50 text-sm">
                        ※ API Keyがなくてもデモモードで体験できます
                    </p>
                )}

                {/* Features info */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                    {[
                        { icon: '🎤', title: '音声認識', desc: '話すだけで入力' },
                        { icon: '💬', title: 'AI会話', desc: 'ネイティブ講師風' },
                        { icon: '📝', title: 'フィードバック', desc: '発音・文法・語彙' },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="text-3xl mb-2">{feature.icon}</div>
                            <div className="text-white font-medium text-sm">{feature.title}</div>
                            <div className="text-white/50 text-xs">{feature.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
