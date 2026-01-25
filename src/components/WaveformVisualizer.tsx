interface WaveformVisualizerProps {
    isListening: boolean;
    isProcessing?: boolean;
}

export function WaveformVisualizer({ isListening, isProcessing = false }: WaveformVisualizerProps) {
    const bars = Array.from({ length: 20 }, (_, i) => i);

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Status indicator */}
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full ${isListening
                            ? 'bg-green-400 animate-pulse'
                            : isProcessing
                                ? 'bg-yellow-400 animate-pulse'
                                : 'bg-gray-500'
                        }`}
                />
                <span className="text-white/70 text-sm font-medium">
                    {isListening
                        ? 'Listening...'
                        : isProcessing
                            ? 'Processing...'
                            : 'Ready'}
                </span>
            </div>

            {/* Waveform animation */}
            <div className="flex items-center justify-center gap-1 h-32">
                {bars.map((i) => (
                    <div
                        key={i}
                        className={`
              w-2 rounded-full
              transition-all duration-150
              ${isListening
                                ? 'bg-gradient-to-t from-accent to-primary-400 waveform-bar'
                                : isProcessing
                                    ? 'bg-gradient-to-t from-yellow-500 to-orange-400 opacity-50'
                                    : 'bg-white/20'
                            }
            `}
                        style={{
                            height: isListening
                                ? `${Math.random() * 60 + 40}%`
                                : isProcessing
                                    ? '30%'
                                    : '20%',
                            animationDelay: `${i * 0.05}s`,
                        }}
                    />
                ))}
            </div>

            {/* Microphone icon */}
            <div
                className={`
          p-6 rounded-full
          transition-all duration-300
          ${isListening
                        ? 'bg-accent/30 shadow-lg shadow-accent/30'
                        : 'bg-white/10'
                    }
        `}
            >
                <svg
                    className={`w-12 h-12 ${isListening ? 'text-accent' : 'text-white/50'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
            </div>
        </div>
    );
}
