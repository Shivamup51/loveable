'use client'

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";


const page = () => {

  const [value, setValue] = useState<string>("");
  const trpc = useTRPC();

  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background job invoked");
    }
  }));

  return (
   <div className="p-4 max-w-7xl mx-auto">
    <Input value={value} onChange={(e)=>setValue(e.target.value)} />
    <Button disabled={invoke.isPending} onClick={()=>invoke.mutate({value:value})}>Invoke background job</Button>
   </div>
  )
}

export default page;