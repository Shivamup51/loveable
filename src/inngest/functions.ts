import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {

    const CodeAgent = createAgent({
      name: "CodeAgent",
      system: "You are an expert next.js developer. you write readable , maintainable , and efficient code. your write simple next.js & react snippets",
      model: openai({ model: "gpt-4o"}),
    });

    const { output } = await CodeAgent.run(
      `write code for the following snippets :${event.data.value}`,
    );

    return { output };
  },
);