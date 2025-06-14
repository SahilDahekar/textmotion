import { useCallback } from 'react';
import { useTimeline } from '@/hooks/useTimline';
import { TimelineHeader } from '@/components/TimelineHeader';
import { TimeRuler } from '@/components/TimeRuler';
import { GridLines } from '@/components/GridLines';
import { TimelineClips } from '@/components/TimelineClips';
import { Playhead } from '@/components/Playhead';

interface TimelineProps {
    totalDuration?: number;
    timeline: ReturnType<typeof useTimeline>;
}

export function Timeline({ totalDuration = 60 , timeline}: TimelineProps) {

    const generateTimeMarkers = useCallback(() => {
        const markers = [];
        const interval = totalDuration <= 60 ? 5 : totalDuration <= 300 ? 15 : 30;
        
        for (let i = 0; i <= totalDuration; i += interval) {
            markers.push(i);
        }
        return markers;
    }, [totalDuration]);

    const timeMarkers = generateTimeMarkers();

    return (
        <div className="h-1/3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col mx-4 p-4 shadow-sm">
            <TimelineHeader 
                totalDuration={totalDuration}
                playheadTime={timeline.playheadTime}
                isPlaying={timeline.isPlaying}
                onPlay={timeline.handlePlay}
                onPause={timeline.handlePause}
            />

            <div className="flex-1 flex flex-col">
                <TimeRuler 
                    timeMarkers={timeMarkers}
                    timeToPixel={timeline.timeToPixel}
                />

                <div 
                    className="relative flex-1 bg-white border border-gray-200 rounded-md cursor-pointer min-h-[120px]"
                    ref={timeline.timelineRef}
                    onClick={timeline.handleTimelineClick}
                >
                    <GridLines 
                        timeMarkers={timeMarkers}
                        timeToPixel={timeline.timeToPixel}
                    />

                    <TimelineClips 
                        clips={timeline.clips}
                        draggedClipId={timeline.draggedClipId}
                        timeToPixel={timeline.timeToPixel}
                        onClipMouseDown={timeline.handleClipMouseDown}
                    />

                    <Playhead 
                        playheadTime={timeline.playheadTime}
                        timeToPixel={timeline.timeToPixel}
                        onMouseDown={timeline.handlePlayheadMouseDown}
                    />
                </div>
            </div>
        </div>
    );
}