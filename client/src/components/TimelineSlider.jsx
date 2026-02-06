import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

export default function TimelineSlider({ phaseHistory, currentIndex, onSeek }) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            if (currentIndex < phaseHistory.length - 1) {
                onSeek(currentIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }, 2000); // 2 seconds per phase

        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, phaseHistory.length, onSeek]);

    const formatTime = (index) => {
        const minutesAgo = (phaseHistory.length - 1 - index) * 2;
        if (minutesAgo === 0) return 'NOW';
        return `-${minutesAgo}m`;
    };

    if (phaseHistory.length <= 1) return null;

    return (
        <div className="glass-panel p-3 rounded-xl absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 min-w-[400px]">
            <div className="flex items-center mb-2">
                <Clock size={14} className="text-crisis-accent mr-2" />
                <h3 className="text-xs font-mono font-bold text-white">THREAT EVOLUTION</h3>
            </div>

            {/* Timeline Slider */}
            <div className="flex items-center space-x-3">
                {/* Skip to Start */}
                <button
                    onClick={() => onSeek(0)}
                    disabled={currentIndex === 0}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <SkipBack size={14} className="text-gray-400" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentIndex === phaseHistory.length - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    {isPlaying ? (
                        <Pause size={14} className="text-crisis-accent" />
                    ) : (
                        <Play size={14} className="text-crisis-accent" />
                    )}
                </button>

                {/* Slider */}
                <div className="flex-1 relative">
                    <input
                        type="range"
                        min="0"
                        max={phaseHistory.length - 1}
                        value={currentIndex}
                        onChange={(e) => {
                            setIsPlaying(false);
                            onSeek(parseInt(e.target.value));
                        }}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                            background: `linear-gradient(to right, #00d4ff ${(currentIndex / (phaseHistory.length - 1)) * 100}%, #374151 ${(currentIndex / (phaseHistory.length - 1)) * 100}%)`
                        }}
                    />
                    {/* Time markers */}
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-gray-500 font-mono">
                            {formatTime(0)}
                        </span>
                        <span className="text-[9px] text-crisis-accent font-mono font-bold">
                            {formatTime(currentIndex)}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono">
                            NOW
                        </span>
                    </div>
                </div>

                {/* Skip to End */}
                <button
                    onClick={() => onSeek(phaseHistory.length - 1)}
                    disabled={currentIndex === phaseHistory.length - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <SkipForward size={14} className="text-gray-400" />
                </button>
            </div>

            {/* Current Phase Info */}
            <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400 font-mono">
                    {phaseHistory[currentIndex]?.phase || 'Loading...'}
                </p>
            </div>
        </div>
    );
}
