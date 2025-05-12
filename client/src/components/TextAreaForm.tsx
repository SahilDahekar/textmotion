import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SendHorizontal } from "lucide-react"

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
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Handle form submission
        console.log("Form submitted:", data)
        toast("Success", {
            description: "Your animation is being created",
        })
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
                <Button type="submit">Create Animation <SendHorizontal /></Button>
            </form>
        </Form>
    )
}
