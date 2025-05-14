import { Button } from "@/components/ui/button"
import { Download } from "lucide-react";

interface GeneratedContentProps {
    generatedCode: string | null;
    videoUrl: string | null;
}

export function GeneratedContent({ generatedCode, videoUrl }: GeneratedContentProps) {
    return (
        <div className="w-2/3 mx-auto space-y-4">
            {generatedCode && (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Generated Python Code:</h3>
                    <pre className="text-sm overflow-x-auto">
                        {generatedCode}
                    </pre>
                </div>
            )}

            {videoUrl && (
                <div>
                    <h3 className="text-sm font-medium mb-2">Generated Animation:</h3>
                    <div className="rounded-lg overflow-hidden">
                        <video
                            controls
                            className="w-full"
                            src={videoUrl}
                            onError={(e) => console.error("Video error:", e)}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <Button 
                        className="mt-2"
                        onClick={() => {
                            const a = document.createElement('a');
                            a.href = videoUrl;
                            a.download = 'animation.mp4';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }}
                    >
                        <Download/> Download Video
                    </Button>
                </div>
            )}
        </div>
    )
}
