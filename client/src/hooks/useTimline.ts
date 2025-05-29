import { useRef, useState, useCallback, useEffect } from "react";
import type { Clip } from "../lib/types";
import type { TimelineHook } from "../lib/types";

export function useTimeline(totalDuration: number = 60 , videoRef?: React.RefObject<HTMLVideoElement | null>): TimelineHook {
    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [playheadTime, setPlayheadTime] = useState(0);
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    // Clip dragging state
    const [isDraggingClip, setIsDraggingClip] = useState(false);
    const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    
    const [clips, setClips] = useState<Clip[]>([]);

    const handleVideoMetadataLoaded = useCallback(() => {
        if (videoRef?.current) {
            const videoDuration = videoRef.current.duration;
            console.log("🔥 Video metadata loaded, duration:", videoDuration);
            
            const videoClips = [
                {
                    id: 'main-video',
                    startTime: 0,
                    duration: videoDuration,
                    color: 'bg-slate-600',
                    label: 'Video Track'
                }
            ];
            
            setClips(videoClips);
        }
    }, [videoRef]);


    
    const timeToPixel = useCallback((time: number) => {
        if (!timelineRef.current) return 0;
        const timelineWidth = timelineRef.current.clientWidth;
        return (time / totalDuration) * timelineWidth;
    }, [totalDuration]);

    
    const pixelToTime = useCallback((pixel: number) => {
        if (!timelineRef.current) return 0;
        const timelineWidth = timelineRef.current.clientWidth;
        return (pixel / timelineWidth) * totalDuration;
    }, [totalDuration]);

    
    const snapToGrid = useCallback((time: number) => {
        const snapInterval = 1; 
        return Math.round(time / snapInterval) * snapInterval;
    }, []);

    
    const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPlayhead(true);
    }, []);

    
    const handleClipMouseDown = useCallback((e: React.MouseEvent, clipId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!timelineRef.current) return;
        
        const timelineRect = timelineRef.current.getBoundingClientRect();
        const clip = clips.find(c => c.id === clipId);
        if (!clip) return;
        
        const clipLeft = timeToPixel(clip.startTime);
        const mouseX = e.clientX - timelineRect.left;
        const offset = mouseX - clipLeft;
        
        setIsDraggingClip(true);
        setDraggedClipId(clipId);
        setDragOffset(offset);
    }, [clips, timeToPixel]);


    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!timelineRef.current) return;
        
        const timelineRect = timelineRef.current.getBoundingClientRect();
        const relativeX = Math.min(Math.max(e.clientX - timelineRect.left, 0), timelineRect.width);
        
        if (isDraggingPlayhead) {
            const newTime = pixelToTime(relativeX);
            setPlayheadTime(Math.min(Math.max(newTime, 0), totalDuration));
        }
        
        if (isDraggingClip && draggedClipId) {
            const adjustedX = relativeX - dragOffset;
            const newStartTime = pixelToTime(adjustedX);
            const snappedTime = snapToGrid(newStartTime);
            
            const draggedClip = clips.find(c => c.id === draggedClipId);
            if (!draggedClip) return;
            
            const clampedStartTime = Math.min(
                Math.max(snappedTime, 0), 
                totalDuration - draggedClip.duration
            );
            
            // Check for collisions with other clips
            const otherClips = clips.filter(c => c.id !== draggedClipId);
            let finalStartTime = clampedStartTime;
            
            for (const otherClip of otherClips) {
                const otherStart = otherClip.startTime;
                const otherEnd = otherClip.startTime + otherClip.duration;
                const draggedEnd = finalStartTime + draggedClip.duration;
                
                if (!(finalStartTime >= otherEnd || draggedEnd <= otherStart)) {
                    if (finalStartTime < otherStart) {
                        finalStartTime = Math.max(0, otherStart - draggedClip.duration);
                    } else {
                        finalStartTime = Math.min(totalDuration - draggedClip.duration, otherEnd);
                    }
                }
            }
            
            setClips(prevClips => 
                prevClips.map(clip => 
                    clip.id === draggedClipId 
                        ? { ...clip, startTime: finalStartTime }
                        : clip
                )
            );
        }
    }, [isDraggingPlayhead, isDraggingClip, draggedClipId, dragOffset, pixelToTime, totalDuration, clips, snapToGrid]);

    const handleMouseUp = useCallback(() => {
        setIsDraggingPlayhead(false);
        setIsDraggingClip(false);
        setDraggedClipId(null);
        setDragOffset(0);
    }, []);


    
    const handleTimelineClick = useCallback((e: React.MouseEvent) => {
        if (!timelineRef.current || isDraggingPlayhead || isDraggingClip) return;
        
        const timelineRect = timelineRef.current.getBoundingClientRect();
        const relativeX = e.clientX - timelineRect.left;
        const clickedTime = pixelToTime(relativeX);
        const clampedTime = Math.min(Math.max(clickedTime, 0), totalDuration);
        
        setPlayheadTime(clampedTime);
        
        if (videoRef?.current) {
            videoRef.current.currentTime = clampedTime;
        }
    }, [pixelToTime, totalDuration, isDraggingPlayhead, isDraggingClip, videoRef]);

    

    const handlePlay = useCallback(() => {
        if (playheadTime >= totalDuration) {
            setPlayheadTime(0);
        }
        setIsPlaying(true);
        
        if (videoRef?.current) {
            videoRef.current.play().catch(console.error);
        }
    }, [playheadTime, totalDuration, videoRef]);
    
    const handlePause = useCallback(() => {
        setIsPlaying(false);
        
        if (videoRef?.current) {
            videoRef.current.pause();
        }
    }, [videoRef]);



    useEffect(() => {
        let animationFrameId: number;
        if(isPlaying){
            const animate = () => {
                setPlayheadTime(prevTime => {
                    const newTime = prevTime + 0.016; // ~60fps (16ms)
                    if (newTime >= totalDuration) {
                        setIsPlaying(false);
                        setPlayheadTime(0);
                        return totalDuration;
                    }
                    return newTime;
                });
                animationFrameId = requestAnimationFrame(animate);
            };
            animationFrameId = requestAnimationFrame(animate);
        }
        if (isDraggingPlayhead || isDraggingClip) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = isDraggingClip ? 'grabbing' : 'grabbing';
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
        
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
        };
    }, [isPlaying , isDraggingPlayhead, isDraggingClip, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (videoRef?.current) {
            videoRef.current.currentTime = playheadTime;
        }
    }, [playheadTime, videoRef]);

    return {
        playheadTime,
        isDraggingPlayhead,
        isDraggingClip,
        draggedClipId,
        clips,
        timelineRef,
        isPlaying,
        handlePlay,
        handlePause,
        timeToPixel,
        pixelToTime,
        handlePlayheadMouseDown,
        handleClipMouseDown,
        handleTimelineClick,
        handleVideoMetadataLoaded,
        setClips
    };
}