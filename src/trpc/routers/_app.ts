import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  invoke: baseProcedure
  .input(
    z.object({
      value: z.string(),
    })
  )
  .mutation(async({input})=>{
    await inngest.send({
      name: "test/hello.world",
      data: {
        value: input.value, // Fixed: changed from email to value
      },
    });
  }),
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  getResults: baseProcedure
    .query(async () => {
      // This is a placeholder - you'd need to implement actual result storage
      return { message: "Check your server logs for the summarization result" };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;