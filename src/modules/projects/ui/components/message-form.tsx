import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutoSize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation,  useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

interface Props {
    projectId: string;
}

const formSchema = z.object({
    value: z.string().min(1, { message: "Prompt is required" }).max(10000, { message: "Prompt is too long" }),
});



export const MessageFrom = ({ projectId }: Props) => {


    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
            queryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({projectId})
            );
            // TODO: INVALIDATE Usage Status 
        },
        onError: (error) => {
            // TODO : Redirect to pricing page if user is not subscribed or specific error 
            toast.error(error.message);
        }
    }));

    const onSubmit = async (Values: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            value: Values.value,
            projectId,

        })
    }

    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || form.formState.isValid;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all', isFocused && 'shadow-xs', showUsage && 'rounded-t-none',
                )}
            >
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextareaAutoSize
                            {...field} 
                            disabled={isPending}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent "
                            placeholder="what would you like to build..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (!e.ctrlKey || !e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                            />
                    )}
                />
                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground '>
                            <span className="">&#8984;</span>Enter
                        </kbd>
                        &nbsp;to send
                    </div>
                    <Button
                    disabled={isButtonDisabled}
                    type="submit"
                    className={cn(
                        "size-8 rounded-full",isButtonDisabled &&"bg-muted-forground border"
                    )}>
                        {isPending ? <Loader2Icon className={cn(
                            "size-4 animate-spin"
                        )}/> :(
                            <ArrowUpIcon />
                        )
                        }
                        
                    </Button>
                </div>
            </form>
        </Form>
    )
}