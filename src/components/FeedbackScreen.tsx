import { PronunciationPractice } from './PronunciationPractice';
import type { Feedback } from '../types';

interface FeedbackScreenProps {
    feedback: Feedback;
    onNewSession: () => void;
}

export function FeedbackScreen({ feedback, onNewSession }: FeedbackScreenProps) {
    return (
        <div className="min-h-screen gradient-bg py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-2xl">
                        <svg
                            className="w-12 h-12 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold gradient-text">
                        フィードバック
                    </h1>
                    <p className="text-white/60">
                        会話の分析結果をご確認ください
                    </p>
                </div>

                {/* Overall Comment */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent/20 rounded-xl">
                            <span className="text-2xl">💬</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-2">総合コメント</h2>
                            <p className="text-white/80 leading-relaxed">{feedback.overallComment}</p>
                        </div>
                    </div>
                </div>

                {/* Pronunciation Section */}
                <div className="feedback-section">
                    <div className="feedback-section-title text-rose-400">
                        <span className="text-2xl">🎯</span>
                        <span>発音 (Pronunciation)</span>
                    </div>
                    <p className="text-white/70">{feedback.pronunciation.summary}</p>

                    {feedback.pronunciation.issues.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {feedback.pronunciation.issues.map((issue, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <PronunciationPractice word={issue.word} ipa={issue.ipa} />
                                    </div>
                                    <p className="text-white/70 text-sm">{issue.explanation}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-green-400">💡</span>
                                        <span className="text-white/60">{issue.tip}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-green-400/70 text-sm mt-2">
                            ✨ 発音に関する大きな問題は見つかりませんでした！
                        </p>
                    )}
                </div>

                {/* Grammar Section */}
                <div className="feedback-section">
                    <div className="feedback-section-title text-amber-400">
                        <span className="text-2xl">📝</span>
                        <span>文法 (Grammar)</span>
                    </div>
                    <p className="text-white/70">{feedback.grammar.summary}</p>

                    {feedback.grammar.corrections.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {feedback.grammar.corrections.map((correction, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-4 space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-400">✗</span>
                                            <span className="text-white/60 line-through">{correction.original}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span className="text-white">{correction.corrected}</span>
                                        </div>
                                    </div>
                                    <div className="pl-6 border-l-2 border-accent/30 space-y-1">
                                        <p className="text-accent text-sm font-medium">{correction.grammarPoint}</p>
                                        <p className="text-white/60 text-sm">{correction.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-green-400/70 text-sm mt-2">
                            ✨ 文法に関する大きな問題は見つかりませんでした！
                        </p>
                    )}
                </div>

                {/* Vocabulary Section */}
                <div className="feedback-section">
                    <div className="feedback-section-title text-emerald-400">
                        <span className="text-2xl">📚</span>
                        <span>語彙 (Vocabulary)</span>
                    </div>
                    <p className="text-white/70">{feedback.vocabulary.summary}</p>

                    {feedback.vocabulary.suggestions.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {feedback.vocabulary.suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white/5 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-white/50 text-sm">使用した表現:</span>
                                        <span className="px-3 py-1 bg-white/10 rounded-lg text-white">
                                            {suggestion.used}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-white/50 text-sm">より良い表現:</span>
                                        {suggestion.suggested.map((word, i) => (
                                            <PronunciationPractice key={i} word={word} />
                                        ))}
                                    </div>
                                    <p className="text-white/60 text-sm">{suggestion.explanation}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-green-400/70 text-sm mt-2">
                            ✨ 語彙に関する大きな問題は見つかりませんでした！
                        </p>
                    )}
                </div>

                {/* New Session Button */}
                <div className="pt-6">
                    <button
                        onClick={onNewSession}
                        className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        新しいセッションを開始
                    </button>
                </div>
            </div>
        </div>
    );
}
