"use client";

import { ExcalidrawContext } from "../components/context/ExcalidrawContext.tsx";
import { canvasToolInstructions } from "../lib/ai/prompts.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useContext, useMemo } from "react";
import { z } from "zod";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const excalidraw = useContext(ExcalidrawContext);

    console.log("Excalidraw", excalidraw);

    const schema = z.object({
        instructions: z.string().describe(
            "Natural language description of what should be drawn on the canvas."
        ),
    });

    return useMemo(
        () =>
            tool({
                name: "update-canvas",
                description: canvasToolInstructions,
                parameters: schema,
                execute: async ({ instructions }: z.infer<typeof schema>) => {
                    if (!excalidraw?.api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }

                    const openai = new OpenAI({
                        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
                        dangerouslyAllowBrowser: true,
                    });

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4.1",
                        messages: [
                            { role: "system", content: canvasToolInstructions + " Respond with JSON: { format: 'excalidraw' | 'mermaid', elements: string }." },
                            { role: "user", content: instructions },
                        ],
                        response_format: { type: "json_object" },
                    });

                    const { elements, format } = JSON.parse(
                        completion.choices[0].message.content
                    );

                    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
                    const { parseMermaidToExcalidraw } = await import("@excalidraw/mermaid-to-excalidraw");

                    let skeleton;
                    if (format === "excalidraw") {
                        skeleton = JSON.parse(elements);
                    } else {
                        skeleton = (await parseMermaidToExcalidraw(elements)).elements;
                    }

                    const converted = convertToExcalidrawElements(skeleton);
                    excalidraw.api.updateScene({ elements: converted });
                    return "ok";
                },
            }),
        [excalidraw, schema], // recreated whenever the api reference changes
    );
}
