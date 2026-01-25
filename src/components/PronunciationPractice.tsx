import { useState } from 'react';
import { speakText } from '../services/geminiService';

interface PronunciationPracticeProps {
    word: string;
    ipa?: string;
}

export function PronunciationPractice({ word, ipa }: PronunciationPracticeProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = async () => {
        if (isPlaying) return;

        setIsPlaying(true);
        try {
            await speakText(word);
        } catch (error) {
            console.error('TTS error:', error);
        }
        setIsPlaying(false);
    };

    return (
        <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
        transition-all duration-200
        ${isPlaying
                    ? 'bg-accent/30 text-accent'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }
      `}
        >
            <svg
                className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <span className="font-medium">{word}</span>
            {ipa && <span className="text-white/50 text-sm">{ipa}</span>}
        </button>
    );
}
