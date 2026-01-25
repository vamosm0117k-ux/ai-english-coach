import { formatTime } from '../hooks/useTimer';

interface TimerProps {
    timeRemaining: number;
    isWarning?: boolean;
}

export function Timer({ timeRemaining, isWarning = false }: TimerProps) {
    const isLow = timeRemaining < 60;

    return (
        <div
            className={`
        fixed top-6 right-6 z-50
        px-6 py-3 rounded-2xl
        backdrop-blur-md
        font-mono text-2xl font-bold
        transition-all duration-300
        ${isLow || isWarning
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 timer-pulse'
                    : 'bg-white/10 text-white border border-white/20'
                }
      `}
        >
            <div className="flex items-center gap-3">
                <svg
                    className={`w-5 h-5 ${isLow ? 'animate-bounce-gentle' : ''}`}
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
                <span>{formatTime(timeRemaining)}</span>
            </div>
        </div>
    );
}
