import { useEffect, useState } from 'react';
import { logger, LogEntry } from '../utils/logger';

export function DebugConsole() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [audioState, setAudioState] = useState({
        speaking: false,
        paused: false,
        voices: 0
    });

    useEffect(() => {
        setLogs(logger.getLogs());
        const unsubscribe = logger.subscribe((entry) => {
            setLogs(prev => [entry, ...prev].slice(0, 50));
        });

        // Poll audio state
        const interval = setInterval(() => {
            const synth = window.speechSynthesis;
            if (synth) {
                setAudioState({
                    speaking: synth.speaking,
                    paused: synth.paused,
                    voices: synth.getVoices().length
                });
            }
        }, 500);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 left-4 z-50 bg-black/50 text-white/50 text-xs px-2 py-1 rounded hover:bg-black/80 hover:text-white"
            >
                Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-96 h-64 bg-black/90 text-green-400 font-mono text-xs rounded-lg shadow-xl overflow-hidden flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-2 bg-white/10 border-b border-white/10">
                <span className="font-bold">Debug Console</span>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/50 hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div className="p-2 border-b border-white/10 bg-white/5 space-y-1">
                <div className="flex justify-between">
                    <span>Speaking: {audioState.speaking ? 'YES' : 'NO'}</span>
                    <span>Paused: {audioState.paused ? 'YES' : 'NO'}</span>
                </div>
                <div>Voices Loaded: {audioState.voices}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {logs.map((log) => (
                    <div key={log.timestamp} className={`${log.level === 'error' ? 'text-red-400 font-bold' :
                            log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                        <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                        {log.message}
                        {log.details && (
                            <pre className="text-[10px] opacity-70 ml-4 mt-0.5 whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
