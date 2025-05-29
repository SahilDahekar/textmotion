import React from 'react';
import type { Clip } from '@/lib/types';

interface TimelineClipProps {
    clip: Clip;
    index: number;
    isBeingDragged: boolean;
    timeToPixel: (time: number) => number;
    onMouseDown: (e: React.MouseEvent, clipId: string) => void;
}

export function TimelineClip({ 
    clip, 
    index, 
    isBeingDragged, 
    timeToPixel, 
    onMouseDown 
}: TimelineClipProps) {
    const left = timeToPixel(clip.startTime);
    const width = timeToPixel(clip.duration);
    const trackHeight = 32;
    const trackY = 20 + (index * (trackHeight + 8));

    return (
        <div
            className={`absolute ${clip.color} rounded-md shadow-sm border border-white/20 
                       hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
                       flex items-center px-2 text-white text-sm font-medium select-none
                       ${isBeingDragged ? 'shadow-lg scale-105 z-20' : 'z-10'}`}
            style={{
                left: `${left}px`,
                width: `${width}px`,
                height: `${trackHeight}px`,
                top: `${trackY}px`,
            }}
            title={`${clip.label}: ${clip.startTime.toFixed(1)}s - ${(clip.startTime + clip.duration).toFixed(1)}s`}
            onMouseDown={(e) => onMouseDown(e, clip.id)}
        >
            <span className="truncate pointer-events-none">{clip.label}</span>
            
            
            {isBeingDragged && (
                <div className="absolute inset-0 bg-white/10 rounded-md pointer-events-none" />
            )}
            
            
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 hover:opacity-100 cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 hover:opacity-100 cursor-ew-resize" />
        </div>
    );
}