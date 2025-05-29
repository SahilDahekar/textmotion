export interface Clip {
    id: string;
    startTime: number; // in seconds
    duration: number; // in seconds
    color: string;
    label?: string;
}


export interface TimelineHook {
    playheadTime: number;
    isDraggingPlayhead: boolean;
    isDraggingClip: boolean;
    draggedClipId: string | null;
    clips: Clip[];
    timelineRef: React.RefObject<HTMLDivElement | null>;
    timeToPixel: (time: number) => number;
    pixelToTime: (pixel: number) => number;
    handlePlayheadMouseDown: (e: React.MouseEvent) => void;
    handleClipMouseDown: (e: React.MouseEvent, clipId: string) => void;
    handleTimelineClick: (e: React.MouseEvent) => void;
    setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
    isPlaying: boolean;                    
    handlePlay: () => void;               
    handlePause: () => void;      
    handleVideoMetadataLoaded: () => void;         
}