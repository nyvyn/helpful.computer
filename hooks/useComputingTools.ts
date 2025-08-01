"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { tool } from "@openai/agents-realtime";
import { invoke } from "@tauri-apps/api/core";
import OpenAI from "openai";
import { ResponseComputerToolCall } from "openai/resources/responses/responses";
import { useCallback, useContext, useMemo } from "react";
import { z } from "zod";

type DesktopAction =
    | ResponseComputerToolCall.Click
    | ResponseComputerToolCall.DoubleClick
    | ResponseComputerToolCall.Drag
    | ResponseComputerToolCall.Keypress
    | ResponseComputerToolCall.Move
    | ResponseComputerToolCall.Screenshot
    | ResponseComputerToolCall.Scroll
    | ResponseComputerToolCall.Type
    | ResponseComputerToolCall.Wait;

export default function useComputingTools() {
    const ctx = useContext(ToolContext);
    const openai = useMemo(() => new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    }), []);

    /** Low-level desktop actions for the CUA agent. */
    const runDesktopAction = useCallback(async (action: DesktopAction) => {
        switch (action.type) {
            case "click":
                await invoke("click_at", { x: action.x, y: action.y, button: action.button ?? "left" });
                break;
            case "double_click":
                await invoke("double_click_at", { x: action.x, y: action.y });
                break;
            case "drag":
                await invoke("drag_from_to", { path: [...action.path.map((p) => ({ x: p.x, y: p.y }))] });
                break;
            case "keypress":
                for (const k of action.keys) await invoke("press_key", { key: k === "ENTER" ? "Return" : k });
                break;
            case "move":
                await invoke("move_mouse_to", { x: action.x, y: action.y });
                break;
            case "screenshot":
                const shot = await invoke<string>("capture_screenshot");
                ctx?.setScreenshot(shot);
                break;
            case "scroll":
                await invoke("scroll_at", { x: action.x, y: action.y, scrollX: action.scroll_x, scrollY: action.scroll_y });
                break;
            case "type":
                await invoke("type_text", { text: action.text });
                break;
            case "wait":
                await new Promise(r => setTimeout(r, 2_000));
                break;
        }
    }, [ctx]);

    /** Full CUA loop – used only by Interact Computer. */
    const runCUA = useCallback(
        async (instruction: string): Promise<string> => {
            // Get screen dimensions and OS info from Rust backend
            const screenInfo = await invoke<{width: number, height: number}>("get_screen_dimensions");
            const osInfo = await invoke<string>("get_os_info");
            const environment = osInfo as "windows" | "mac" | "linux" | "ubuntu" | "browser";

            let response = await openai.responses.create({
                model: "computer-use-preview",
                tools: [{ type: "computer-preview", display_width: screenInfo.width, display_height: screenInfo.height, environment }],
                input: [{ type: "message", role: "user", content: instruction }],
                truncation: "auto",
            });

            while (true) {
                // Break if no more calls to make
                const call = response.output.find((o) => o.type === "computer_call");
                if (!call)
                    return response.output.filter((o) => o.type === "message").map((o) => o.content).join("\n");

                await runDesktopAction(call.action);

                const shot = await invoke<string>("capture_screenshot");
                ctx?.setScreenshot(shot);

                response = await openai.responses.create({
                    model: "computer-use-preview",
                    previous_response_id: response.id,
                    tools: [{ type: "computer-preview", display_width: screenInfo.width, display_height: screenInfo.height, environment }],
                    input: [{
                        call_id: call.call_id,
                        type: "computer_call_output",
                        output: { type: "computer_screenshot", image_url: `data:image/png;base64,${shot}` },
                    }],
                    truncation: "auto",
                });
            }
        },
        [openai, ctx, runDesktopAction],
    );

    /** Evaluate Computer – screenshot + GPT-4o vision. */
    const evaluateDesktop = useCallback(
        async (query: string): Promise<string> => {
            const screenshot = await invoke<string>("capture_screenshot");
            ctx?.setScreenshot(screenshot);

            const response = await openai.responses.create({
                model: "gpt-4.1-mini",
                input: [{
                        role: "user",
                        content: [
                            { type: "input_text", text: query },
                            {
                                type: "input_image",
                                image_url: `data:image/png;base64,${screenshot}`,
                                detail: "high",
                            }
                        ],
                    },
                ],
            });

            return response.output_text;
        },
        [openai, ctx],
    );

    const interactComputerTool = useMemo(
        () =>
            tool({
                name: "Interact Computer",
                description: "Enacts a series of commands and interactions with the desktop.",
                parameters: z.object({ instruction: z.string().describe("Instructions on what to accomplish") }).strict(),
                strict: true,
                execute: async ({ instruction }: { instruction: string }) => {
                    try {
                        return await runCUA(instruction);
                    } catch (err) {
                        console.error("Interact Computer tool error:", err);
                        return err instanceof Error ? err.message : String(err);
                    }
                },
            }),
        [runCUA],
    );

    const describeComputerTool = useMemo(
        () =>
            tool({
                name: "Evaluate Computer",
                description: "Responds with a description of the current desktop state.",
                parameters: z.object({ query: z.string().describe("Instructions on what to evaluate.") }).strict(),
                strict: true,
                execute: async ({ query }: { query: string }) => {
                    try {
                        return await evaluateDesktop(query);
                    } catch (err) {
                        console.error("Evaluate Computer tool error:", err);
                        return err instanceof Error ? err.message : String(err);
                    }
                },
            }),
        [evaluateDesktop],
    );

    return [interactComputerTool, describeComputerTool] as const;
}