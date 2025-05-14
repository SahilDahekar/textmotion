import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader, SendHorizontal } from "lucide-react"
import axios from "axios";
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";
import { GeneratedContent } from "./GeneratedContent"

const FormSchema = z.object({
    desc: z
        .string()
        .min(10, {
            message: "Description must be at least 10 characters.",
        })
        .max(160, {
            message: "Description must not be longer than 30 characters.",
        }),
})

export function TextareaForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log("Form submitted:", data);
        setIsLoading(true);
        setVideoUrl(null);

        try {
            
            const genResponse = await axios.post("http://localhost:5000/api/generate", { text: data.desc });
            console.log("Code generation response:", genResponse.data);
            const sanitizedCode = genResponse.data.generatedText.match(/```python\n([\s\S]*?)\n```/);
            setGeneratedCode(sanitizedCode[1].trim() + '\n');
            toast.info("Code Generated", {
                description: "Now creating your animation...",
            });


            const execResponse = await axios.post("http://localhost:5000/api/execute", 
                { code: genResponse.data.generatedText },
                { responseType: 'blob' }
            );

            // Create a URL for the video blob
            const videoBlob = new Blob([execResponse.data], { type: 'video/mp4' });
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);
            
            toast.success("Success", {
                description: "Your animation is ready!",
            });
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error", {
                description: "There was an error creating your animation",
            });
        } finally {
            setIsLoading(false);
        }
    }    return (
        <div className="space-y-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="border rounded-lg p-6 shadow-sm">
                        <FormField
                            control={form.control}
                            name="desc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">                                              <Textarea
                                                placeholder="Describe your animation (e.g., 'Transform a square into a rotating circle')"
                                                className="resize-none min-h-[120px] pb-16 w-full break-words whitespace-pre-wrap"
                                                {...field}
                                            />
                                            <div className="absolute bottom-4 right-4">
                                                <Button 
                                                    disabled={isLoading} 
                                                    type="submit"
                                                    size="lg"
                                                    className="px-8 shadow-sm"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Create <SendHorizontal className="" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-sm" />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>

            <GeneratedContent 
                generatedCode={generatedCode}
                videoUrl={videoUrl}
            />
        </div>
    )
}