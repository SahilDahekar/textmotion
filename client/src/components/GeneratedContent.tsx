import { Button } from "@/components/ui/button"
import { Download } from "lucide-react";
import { useRef } from "react";
import { Timeline } from '@/components/Timeline';
import { useTimeline } from "@/hooks/useTimline";

interface GeneratedContentProps {
    videoUrl: string | null;
}

export function GeneratedContent({ videoUrl }: GeneratedContentProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const timeline = useTimeline(60,videoRef); 
    return (
        <>
            {/* {generatedCode && (
                <div className="h-1/2 border-b p-4 overflow-auto">
                    <h3 className="font-medium mb-2">Generated Python Code</h3>
                    <pre className="p-4 bg-muted/10 rounded-lg overflow-x-auto">
                    {generatedCode}
                    </pre>
                </div>
            )} */}
            {/* Generated Animation */}
            {videoUrl && (
                <div className="h-1/2 p-4 flex flex-col">
                    <h3 className="font-medium mb-2">Generated Animation</h3>
                    <div className="flex-1 bg-black rounded-lg overflow-hidden">
                        <video
                            preload="metadata"
                            onLoadedMetadata={timeline.handleVideoMetadataLoaded}
                            className="w-full h-full object-contain"
                            src={videoUrl}
                            ref={videoRef}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}

            {/* Timeline Section */}
            <Timeline totalDuration={60} timeline={timeline}/>
            <Button className="bottom-2 right-2 hover:bg-gray-700 rounded-md aspect-square fixed z-50 m-4">
                Download
                <Download/>
            </Button>
        </>
    );
}