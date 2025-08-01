"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { tool } from "@openai/agents-realtime";
import { invoke } from "@tauri-apps/api/core";
import OpenAI from "openai";
import { useCallback, useContext, useMemo } from "react";
import { z } from "zod";

type DesktopAction = 
    | { type: "click"; x: number; y: number; button?: "left" | "right" | "middle" }
    | { type: "scroll"; x: number; y: number; scrollX: number; scrollY: number }
    | { type: "keypress"; keys: string[] }
    | { type: "type"; text: string }
    | { type: "wait" };

export default function useComputingTools() {
    const ctx = useContext(ToolContext);
    const openai = useMemo(() => new OpenAI(), []);

    /** Low-level desktop actions for the CUA agent. */
    const runDesktopAction = useCallback(async (action: DesktopAction) => {
        switch (action.type) {
            case "click":
                await invoke("click_at", { x: action.x, y: action.y, button: action.button ?? "left" });
                break;
            case "scroll":
                await invoke("scroll_at", { x: action.x, y: action.y, scrollX: action.scrollX, scrollY: action.scrollY });
                break;
            case "keypress":
                for (const k of action.keys) await invoke("press_key", { key: k === "ENTER" ? "Return" : k });
                break;
            case "type":
                await invoke("type_text", { text: action.text });
                break;
            case "wait":
                await new Promise(r => setTimeout(r, 2_000));
                break;
        }
    }, []);

    /** Full CUA loop – used only by Interact Computer. */
    const runCUA = useCallback(
        async (instruction: string): Promise<string> => {
            let resp = await openai.responses.create({
                model: "computer-use-preview",
                tools: [{ type: "computer-preview", display_width: 1920, display_height: 1080, environment: "mac" }],
                input: [{ type: "message", text: instruction }],
                truncation: "auto",
            });

            while (true) {
                const call = resp.output.find((o: any) => o.type === "computer_call");
                if (!call)
                    return resp.output.filter((o: any) => o.type === "message").map((o: any) => o.text).join("\n");

                await runDesktopAction(call.action);

                const shot = await invoke<string>("capture_screenshot");
                ctx?.setScreenshot(shot);

                const response = await openai.responses.create({
                    model: "computer-use-preview",
                    previous_response_id: response.id,
                    tools: [{ type: "computer-preview", display_width: 1920, display_height: 1080, environment: "mac" }],
                    input: [{
                        call_id: call.call_id,
                        type: "computer_call_output",
                        output: { type: "computer_screenshot", image_url: `data:image/png;base64,${shot}` },
                    }],
                    truncation: "auto",
                });

                return response;
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
                execute: ({ instruction }: { instruction: string }) => runCUA(instruction),
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
                execute: ({ query }: { query: string }) => evaluateDesktop(query),
            }),
        [evaluateDesktop],
    );

    return [interactComputerTool, describeComputerTool] as const;
}