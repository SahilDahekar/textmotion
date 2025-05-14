import { Button } from "@/components/ui/button"
import { Download } from "lucide-react";

interface GeneratedContentProps {
    generatedCode: string | null;
    videoUrl: string | null;
}

export function GeneratedContent({ generatedCode, videoUrl }: GeneratedContentProps) {    return (
        <div className="space-y-8">
            {generatedCode && (
                <div className="border rounded-lg shadow-sm overflow-hidden">
                    <div className="border-b bg-muted/50 px-4 py-3">
                        <h3 className="font-medium">Generated Python Code</h3>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto bg-muted/10">
                        {generatedCode}
                    </pre>
                </div>
            )}

            {videoUrl && (
                <div className="border rounded-lg shadow-sm overflow-hidden">
                    <div className="border-b bg-muted/50 px-4 py-3">
                        <h3 className="font-medium">Generated Animation</h3>
                    </div>
                    <div className="p-4">
                        <div className="rounded-lg overflow-hidden bg-black">
                            <video
                                controls
                                className="w-full aspect-video"
                                src={videoUrl}
                                onError={(e) => console.error("Video error:", e)}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button 
                                size="lg"
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = videoUrl;
                                    a.download = 'animation.mp4';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download Video
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
