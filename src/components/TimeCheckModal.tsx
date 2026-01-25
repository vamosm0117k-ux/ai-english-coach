interface TimeCheckModalProps {
    onContinue: () => void;
    onFinish: () => void;
}

export function TimeCheckModal({ onContinue, onFinish }: TimeCheckModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative glass-card p-8 max-w-md w-full animate-fade-in space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="p-4 bg-amber-500/20 rounded-full">
                        <svg
                            className="w-12 h-12 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                        時間になりました！
                    </h2>
                    <p className="text-white/60">
                        会話を続けますか？それとも終了してフィードバックを受け取りますか？
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onContinue}
                        className="w-full btn-secondary py-4 flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        続ける（+5分）
                    </button>

                    <button
                        onClick={onFinish}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        終了してフィードバックを受け取る
                    </button>
                </div>
            </div>
        </div>
    );
}
