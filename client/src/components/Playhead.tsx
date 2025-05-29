import React from 'react';

interface PlayheadProps {
    playheadTime: number;
    timeToPixel: (time: number) => number;
    onMouseDown: (e: React.MouseEvent) => void;
}

export function Playhead({ playheadTime, timeToPixel, onMouseDown }: PlayheadProps) {
    return (
        <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
            style={{ left: `${timeToPixel(playheadTime)}px` }}
        >
            <div
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                           w-3 h-3 bg-red-500 rotate-45 cursor-grab active:cursor-grabbing
                           hover:scale-110 transition-transform pointer-events-auto"
                onMouseDown={onMouseDown}
                title={`Playhead: ${playheadTime.toFixed(1)}s`}
            />
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-red-500" />
        </div>
    );
}