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
import { useNavigate } from "@tanstack/react-router";

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
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });    
      async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true);
        try {
            // Generate a unique ID for the conversation
            const id = Math.random().toString(36).substring(2);
            await navigate({ 
                to: '/generate/$id', 
                params: { id },
                search: { text: data.desc }
            });
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error", {
                description: "There was an error navigating to the generation page",
            });
        } finally {
            setIsLoading(false);
        }
    }    return (
        <div className="space-y-12">            <Form {...form}>
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
        </div>
    )
}