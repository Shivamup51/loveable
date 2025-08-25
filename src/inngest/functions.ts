import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event , step}) => {
    const sandboxId  = await step.run('get-sandbox-id', async ()=>{
      const sandbox = await Sandbox.create('loveable-app');
      return sandbox.sandboxId;
    });

    const CodeAgent = createAgent({
      name: "CodeAgent",
      system: "You are an expert next.js developer. you write readable , maintainable , and efficient code. your write simple next.js & react snippets",
      model: openai({ model: "gpt-4o"}),
    });

    const { output } = await CodeAgent.run(
      `write code for the following snippets :${event.data.value}`,
    );


    const sandboxUrl = await step.run('get-sandbox-url', async ()=>{
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output , sandboxUrl };
  },
);