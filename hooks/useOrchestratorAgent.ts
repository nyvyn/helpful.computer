import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import useDrawingTools from "@/hooks/useDrawingTools.ts";
import useWritingTools from "@/hooks/useWritingTools.ts";
import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { MODELS } from "@/lib/models.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Create a GPT-5 powered orchestration tool that can use all available tools.
 *
 * The orchestrator can coordinate complex tasks across drawing, writing, and browsing surfaces.
 */
export default function useOrchestratorAgent() {
    const { tools: drawingTools } = useDrawingTools();
    const { tools: writingTools } = useWritingTools();
    const { tools: browserTools } = useBrowsingTools();

    const orchestrateTool = useMemo(() => tool({
        name: "orchestrate",
        description: "Coordinate complex tasks across multiple surfaces (drawing, writing, browsing). " +
            "Provide detailed instructions for what should be accomplished.",
        parameters: z.object({
            task: z.string().describe("Detailed description of the complex task to orchestrate across multiple surfaces"),
            surfaces: z.array(z.enum(["drawing", "writing", "browsing"])).describe("Which surfaces should be involved in this task")
        }).strict(),
        strict: true,
        execute: async ({task, surfaces}) => {
            try {
                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }

                const openai = new OpenAI({
                    apiKey: apiKey!,
                    dangerouslyAllowBrowser: true,
                });

                // Get available tools based on requested surfaces
                const availableTools = [];
                if (surfaces.includes("drawing")) availableTools.push(...drawingTools);
                if (surfaces.includes("writing")) availableTools.push(...writingTools);
                if (surfaces.includes("browsing")) availableTools.push(...browserTools);

                // Create tool descriptions for GPT-5
                const toolDescriptions = availableTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }));

                const completion = await openai.chat.completions.create({
                    model: MODELS.CAPABLE,
                    messages: [
                        {
                            role: "system",
                            content: `You are an orchestration agent that can coordinate tasks across multiple surfaces. 
                            You have access to these tools: ${JSON.stringify(toolDescriptions, null, 2)}
                            
                            Break down the user's task into a sequence of tool calls and execute them in order.
                            Return a summary of what was accomplished.`
                        },
                        {
                            role: "user",
                            content: `Please orchestrate this task: ${task}`
                        },
                    ],
                    tools: toolDescriptions.map(tool => ({
                        type: "function" as const,
                        function: {
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.parameters
                        }
                    })),
                    tool_choice: "auto"
                });

                // Execute any tool calls from the response
                if (completion.choices[0].message.tool_calls) {
                    const results = [];
                    for (const toolCall of completion.choices[0].message.tool_calls) {
                        const toolName = toolCall.function.name;
                        const toolArgs = JSON.parse(toolCall.function.arguments);

                        // Find and execute the corresponding tool
                        const tool = availableTools.find(t => t.name === toolName);
                        if (tool && 'execute' in tool) {
                            try {
                                toast.info(`Orchestrating: ${toolName}`);
                                const executableTool = tool as { execute: (args: unknown) => Promise<string> };
                                const result = await executableTool.execute(toolArgs);
                                toast.success(`Completed: ${toolName}`);
                                results.push(`${toolName}: ${result}`);
                            } catch (error) {
                                toast.error(`Failed: ${toolName}`);
                                results.push(`${toolName}: Error - ${error}`);
                            }
                        }
                    }
                    return `Orchestration complete. Results:\n${results.join('\n')}`;
                }

                return completion.choices[0].message.content || "Orchestration completed";
            } catch (err) {
                console.error("orchestrate tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [drawingTools, writingTools, browserTools]);

    const tools = useMemo(() => [orchestrateTool] as const, [orchestrateTool]);

    return {tools};
}
