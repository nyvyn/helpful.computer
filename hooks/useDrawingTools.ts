"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useMemo, useRef } from "react";
import { z } from "zod";

const schema = z.object({
    instructions: z.string().describe(
        "Natural language description of what should be drawn on the drawing canvas."
    ),
});

/**
 * Creates OpenAI agent tools bound to the current Excalidraw instance.
 *
 * The returned array contains a draw and read tool that operate on the canvas.
 */
export default function useDrawingTools() {
    const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

    const drawCanvasTool = useMemo(() => tool({
        name: "Update Canvas",
        description:
            "Draw on the Excalidraw canvas using natural language instructions.\n" +
            "The provided instructions will be sent to a language model which will return either Excalidraw elements or a Mermaid diagram.\n" +
            "The resulting elements always replace the current scene.",
        parameters: schema,
        strict: true,
        execute: async ({ instructions }: z.infer<typeof schema>) => {
            try {
                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }
                const openai = new OpenAI({
                    apiKey: apiKey!,
                    dangerouslyAllowBrowser: true,
                });
                if (!openai) {
                    return "OpenAI client not initialized";
                }
                const completion = await openai.chat.completions.create({
                    model: "gpt-4.1",
                    messages: [
                        {
                            role: "system",
                            content:
                                "Excalidraw Elements Guidelines\n----------\n" +
                                "* Every element must have a 'strokeColor' and 'backgroundColor'.\n" +
                                "* The `type` of an element can only be one of: " +
                                "'rectangle', 'ellipse', 'diamond', 'arrow', 'line', 'freedraw', or 'text'.\n" +
                                " Do not use 'polygon' or 'triangle'.\n" +
                                "* Use absolute x, y only.\n" +
                                "Store the element’s top-left (for lines/arrows: start point) in x and y.\n" +
                                "Do **not** encode absolute coordinates inside points.\n" +
                                "Normalize the points array.\n" +
                                "For every linear element (line, arrow, draw), set `points[0] = [0, 0]`.\n" +
                                "All other points must be offsets from that origin: `points[i] = [absX_i - x, absY_i - y]`.\n" +
                                "Respond with JSON: { format: 'excalidraw' | 'mermaid', elements: string }.",
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
                        ? typeof elements === "string" ? JSON.parse(elements) : elements
                        : (await parseMermaidToExcalidraw(elements)).elements;

                const converted = convertToExcalidrawElements(skeleton);
                apiRef.current?.updateScene({ elements: converted });

                return "ok";
            } catch (err) {
                console.error("update-canvas tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    
    const readCanvasTool = useMemo(() => tool({
        name: "Read Canvas",
        description:
            "Returns the current elements on the drawing canvas as JSON (Excalidraw format).",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                const elements = apiRef.current?.getSceneElements(); // Excalidraw API
                return JSON.stringify(elements);
            } catch (err) {
                console.error("read-canvas tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [apiRef]);

    const setExcalidrawApi = (api: ExcalidrawImperativeAPI | null) => {
        console.log("Setting Excalidraw API in drawing tools:", api);
        apiRef.current = api;
    };

    return { tools: [drawCanvasTool, readCanvasTool] as const, setExcalidrawApi };
}