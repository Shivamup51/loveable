'use client'

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery,  } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";


const page = () => {

  const [value, setValue] = useState<string>("");
  const trpc = useTRPC();

  const {data:messages} = useQuery(trpc.messages.getMany.queryOptions());

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess:()=>{
      toast.success("message created");
    }
  }));

  return (
   <div className="p-4 max-w-7xl mx-auto">
    <Input value={value} onChange={(e)=>setValue(e.target.value)} />
    <Button disabled={createMessage.isPending} onClick={()=>createMessage.mutate({value:value})}>Invoke background job</Button>
    {JSON.stringify(messages , null , 2)}
   </div>

  )
}

export default page;