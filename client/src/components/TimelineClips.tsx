import React from 'react';
import { TimelineClip } from '@/components/TimelineClip';
import type { Clip } from '@/lib/types';

interface TimelineClipsProps {
    clips: Clip[];
    draggedClipId: string | null;
    timeToPixel: (time: number) => number;
    onClipMouseDown: (e: React.MouseEvent, clipId: string) => void;
}

export function TimelineClips({ 
    clips, 
    draggedClipId, 
    timeToPixel, 
    onClipMouseDown 
}: TimelineClipsProps) {
    return (
        <div className="absolute inset-0 p-2">
            {clips.map((clip, index) => (
                <TimelineClip
                    key={clip.id}
                    clip={clip}
                    index={index}
                    isBeingDragged={draggedClipId === clip.id}
                    timeToPixel={timeToPixel}
                    onMouseDown={onClipMouseDown}
                />
            ))}
        </div>
    );
}