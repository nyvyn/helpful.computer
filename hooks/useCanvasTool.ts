"use client";

import { ExcalidrawContext } from "../components/context/ExcalidrawContext.tsx";
import { canvasToolInstructions } from "../lib/ai/prompts.ts";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";
import OpenAI from "openai";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const excalidraw = useContext(ExcalidrawContext);

    console.log("Excalidraw", excalidraw);

    const schema = z.object({
        instructions: z.string().describe(
            "Instructions describing what should appear on the canvas."
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
                    });

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4.1",
                        messages: [
                            {
                                role: "system",
                                content:
                                    "Return JSON { format: 'excalidraw'|'mermaid', elements: string } representing the drawing.",
                            },
                            { role: "user", content: instructions },
                        ],
                    });

                    const message = completion.choices[0].message.content || "";
                    const { format, elements } = JSON.parse(message);

                    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
                    const { parseMermaidToExcalidraw } = await import("@excalidraw/mermaid-to-excalidraw");

                    let skeleton;
                    if (format === "excalidraw") {
                        skeleton = JSON.parse(elements);
                    } else {
                        skeleton = (
                            await parseMermaidToExcalidraw(elements)
                        ).elements;
                    }

                    const converted = convertToExcalidrawElements(skeleton);
                    excalidraw.api.updateScene({ elements: converted });
                    return "ok";
                },
            }),
        [excalidraw, schema], // recreated whenever the api reference changes
    );
}
