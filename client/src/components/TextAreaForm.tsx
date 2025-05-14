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
            
            setGeneratedCode(genResponse.data.generatedText);
            toast("Code Generated", {
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
            
            toast("Success", {
                description: "Your animation is ready!",
            });
        } catch (error) {
            console.error("Error:", error);
            toast("Error", {
                description: "There was an error creating your animation",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 mx-auto space-y-4">
                    <FormField
                        control={form.control}
                        name="desc"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us about your requirements here..."
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                    Describe how you want your animation to be and let use handle how to generate it.
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <Button disabled={isLoading} type="submit">
                        {isLoading ? (
                            <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Creating...
                            </>
                        ) : (
                            <>
                            Create Animation <SendHorizontal className="ml-2" />
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            <GeneratedContent 
                generatedCode={generatedCode}
                videoUrl={videoUrl}
            />
        </div>
    )
}
