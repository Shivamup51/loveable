import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./clinet";



const page = async () => {

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({text:"hello"}))


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  )
}

export default page;