import React from 'react';

interface TimelineHeaderProps {
    totalDuration: number;
    playheadTime: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
}

export function TimelineHeader({ totalDuration, playheadTime , isPlaying , onPlay , onPause }: TimelineHeaderProps) {
     return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
                <button
                    onClick={isPlaying ? onPause : onPlay}
                    className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        // Pause icon
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                    ) : (
                        // Play icon
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Duration: {totalDuration}s</span>
                <span>|</span>
                <span>Current: {playheadTime.toFixed(1)}s</span>
            </div>
        </div>
    );
}