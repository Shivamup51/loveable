import { inngest } from "./client";
import { openai, createAgent, createTool, createNetwork,  type Tool } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { object, z } from "zod"; // Add this import that was missing
import { PROMPT } from "@/prompt";
import prisma from "@/lib/db";

interface AgentState {
  summary :string;
  files: {[path : string]: string};
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('loveable-app');
      return sandbox.sandboxId;
    });

    const CodeAgent = createAgent<AgentState>({
      name: "CodeAgent",
      description: 'An Expert coding agent',
      system: PROMPT,
      model: openai({
        model: "gpt-4o",
        defaultParameters:
         {
          temperature: 0.1,
        }
      }),
      tools: [
        createTool({
          name: "Terminal",
          description: "Use the terminal to run commands.",
          // Use `input` for simple, single-string arguments.
          input: z.string().describe("The command to run in the terminal."),
          handler: async (command, { step }) => {
            return await step?.run('terminal', async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => { buffers.stdout += data; },
                  onStderr: (data: string) => { buffers.stderr += data; },
                });
                return result.stdout;
              } catch (error) {
                console.error(`command failed : ${error} \nstdout: ${buffers.stdout} \nstderror: ${buffers.stderr}`);
                return `command failed : ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update one or more files in the sandbox.",
          // Use `parameters` for structured, object-based arguments.
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string().describe("The full path of the file to write."),
                content: z.string().describe("The content to write into the file."),
              }),
            ).describe("An array of files to create or update."),
          }),
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const result = await step?.run('create-or-update-files', async () => {
              try {
                const currentState = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  currentState[file.path] = file.content;
                }
                return { success: true, files: currentState };
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error("Error writing files:", message);
                return { success: false, error: message };
              }
            });

            if (result.success) {
              network.state.data.files = result.files;
              return `Successfully wrote ${files.length} file(s).`;
            }
            return `Error writing files: ${result.error}`;
          },
        }),
        createTool({
          name: "readFile",
          description: "Read the contents of one or more files from the sandbox.",
          parameters: z.object({
            files: z.array(z.string()).describe("An array of file paths to read."),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run('readFiles', async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error reading files: " + (error instanceof Error ? error.message : String(error));
              }
            });
          }
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "CodeAgentNetwork",
      agents: [CodeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return CodeAgent;
      }
    });

    const result = await network.run(event.data.value);

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {

      if(isError){
        return await prisma.message.create({
          data: {
            content: "something went worng , please try again",
            role: "ASSISTANT",
            type: "ERROR",
          }
        });
      }

      return await prisma.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragement: {
            create: {
              sandboxUrl: sandboxUrl,
              title: 'Fragement',
              files: result.state.data.files,
            },
          },
        }
      });
    });

    return {
      url: sandboxUrl,
      title: 'Fragement',
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);