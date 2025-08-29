import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageFrom } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";

interface Props{
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
}



export const MessagesContainer = ({projectId , activeFragment , setActiveFragment}:Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const trpc = useTRPC();
    const {data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    },{
        //TODO: Temporary light message update 
        refetchInterval: 5000,
    }));

    //TODO: Temporary causing issues 
    // useEffect(()=>{
    //     const lastAssistantMessageWithFragment = messages.findLast((message)=>message.role === "ASSISTANT" && message.fragment);
    //     if(lastAssistantMessageWithFragment){
    //         setActiveFragment(lastAssistantMessageWithFragment.fragment);   
    //     }
    // },[messages, setActiveFragment]);

    useEffect(()=>{
        bottomRef.current?.scrollIntoView();
    },[messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map((message)=>(
                        <MessageCard key={message.id} 
                        content = {message.content} 
                        role={message.role} 
                        fragment={message.fragment?.id ? message.fragment as any : null} 
                        createdAt={new Date(message.createdAt)}
                        isActive={activeFragment?.id === message.fragment?.id}
                        onFragmentClick={() => {
                            setActiveFragment(
                                message.fragment && message.fragment.id
                                    ? {
                                        id: message.fragment.id,
                                        messageId: message.fragment.messageId!,
                                        sandboxUrl: message.fragment.sandboxUrl!,
                                        title: message.fragment.title!,
                                        files: message.fragment.files!,
                                        createdAt: new Date(message.fragment.createdAt!),
                                        updatedAt: new Date(message.fragment.updatedAt!),
                                    }
                                    : null
                            );
                        }}
                        type={message.type}
                        />
                    ))}
                    {isLastMessageUser && <MessageLoading />}
                    <div ref={bottomRef}/>
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none"/>
                <MessageFrom projectId={projectId}/>
            </div>
        </div>
    )}