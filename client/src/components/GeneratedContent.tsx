import { Button } from "@/components/ui/button"
import { Download } from "lucide-react";

interface GeneratedContentProps {
    generatedCode: string | null;
    videoUrl: string | null;
}

export function GeneratedContent({ generatedCode, videoUrl }: GeneratedContentProps) {    return (
        <>
            {/* Generated Code */}
            {generatedCode && (
            <div className="h-1/2 border-b p-4 overflow-auto">
                <h3 className="font-medium mb-2">Generated Python Code</h3>
                <pre className="p-4 bg-muted/10 rounded-lg overflow-x-auto">
                {generatedCode}
                </pre>
            </div>
            )}

            {/* Generated Animation */}
            {videoUrl && (
            <div className="h-1/2 p-4 flex flex-col">
                <h3 className="font-medium mb-2">Generated Animation</h3>
                <div className="flex-1 bg-black rounded-lg overflow-hidden">
                <video
                    controls
                    className="w-full h-full object-contain"
                    src={videoUrl}
                >
                    Your browser does not support the video tag.
                </video>
                </div>
                <Button 
                className="mt-4 self-end"
                onClick={() => {
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    a.download = 'animation.mp4';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }}
                >
                Download <Download className="ml-2" />
                </Button>
            </div>
            )}
        </>
    )
}
