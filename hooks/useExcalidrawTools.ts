"use client";

import { ExcalidrawContext } from "@/components/excalidraw/ExcalidrawContext.tsx";
import { excalidrawToolInstructions } from "@/lib/ai/prompts.ts";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

const schema = z.object({
    instructions: z.string().describe(
        "Natural language description of what should be drawn on the drawing canvas."
    ),
});

/* Returns Tool instances bound to the current Excalidraw API */
export default function useExcalidrawTools() {
    const ctx = useContext(ExcalidrawContext);
    const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

    useEffect(() => { apiRef.current = ctx ? ctx.excalidrawApi : null; }, [ctx, ctx?.excalidrawApi]);

    const drawCanvas = useMemo(() => tool({
        name: "Draw Canvas",
        description: excalidrawToolInstructions,
        parameters: schema,
        strict: true,
        execute: async ({ instructions }: z.infer<typeof schema>) => {
            try {
                const openai = new OpenAI({
                    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
                    dangerouslyAllowBrowser: true,
                });

                const completion = await openai.chat.completions.create({
                    model: "gpt-4.1-mini",
                    messages: [
                        {
                            role: "system",
                            content:
                                excalidrawToolInstructions +
                                " Respond with JSON: { format: 'excalidraw' | 'mermaid', elements: string }.",
                        },
                        { role: "user", content: instructions },
                    ],
                    response_format: { type: "json_object" },
                });

                const { elements, format } = JSON.parse(
                    completion.choices[0].message.content as string,
                );

                const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
                const { parseMermaidToExcalidraw } = await import("@excalidraw/mermaid-to-excalidraw");

                const skeleton =
                    format === "excalidraw"
                        ? JSON.parse(elements)
                        : (await parseMermaidToExcalidraw(elements)).elements;

                const converted = convertToExcalidrawElements(skeleton);
                apiRef.current?.updateScene({ elements: converted });

                return "ok";
            } catch (err) {
                console.error("update-canvas tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [apiRef]);

    const readCanvas = useMemo(() => tool({
        name: "Read Canvas",
        description:
            "Returns the current elements on the drawing canvas as JSON (Excalidraw format).",
        parameters: z.object({}).strict(),           // no arguments
        strict: true,
        execute: async () => {
            if (!apiRef.current) return "Canvas not ready";
            const elements = apiRef.current.getSceneElements(); // Excalidraw API
            return JSON.stringify(elements);
        },
    }), [apiRef]);

    return [drawCanvas, readCanvas];
}