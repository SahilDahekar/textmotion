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

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        // Handle form submission
        console.log("Form submitted:", data);
        setIsLoading(true);

        // Make an API call to your server
        try {
            const response = await axios.post("http://localhost:5000/api/generate", { text: data.desc });
            console.log("Response from server:", response.data);
            // Add 2 sec delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Handle the response from the server
            toast("Success", {
                description: "Your animation is being created",
            })
        } catch (error) {
            console.error("Error:", error);
            // Handle any errors
            toast("Error", {
                description: "There was an error creating your animation",
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 mx-auto space-y-4">
                <FormField
                    control={form.control}
                    name="desc"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel></FormLabel> */}
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
    )
}
