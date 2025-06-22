"use client";

import { ExcalidrawContext } from "../components/context/ExcalidrawContext.tsx";
import { canvasToolInstructions } from "../lib/ai/prompts.ts";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const excalidraw = useContext(ExcalidrawContext);

    console.log("Excalidraw", excalidraw);

    const schema = z.object({
        elements: z.string().describe(`
            If "excalidraw": an array of Excalidraw element objects as a JSON-encoded string (in Excalidraw export format).  
            If "mermaid": a Mermaid diagram as a string; only "flowchart-v2", "sequence", and "classDiagram" are supported.
        `),
        format: z.enum(["excalidraw", "mermaid"]).describe(`
            "excalidraw" should be used for general drawing, and "mermaid" should be used for diagrams.
        `),
    });

    return useMemo(
        () =>
            tool({
                name: "update-canvas",
                description: canvasToolInstructions,
                parameters: schema,
                execute: async ({elements, format}: z.infer<typeof schema>) => {
                    console.log("Drawing elements", elements);

                    if (!excalidraw?.api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }

                    const {convertToExcalidrawElements} = await import("@excalidraw/excalidraw");
                    const {parseMermaidToExcalidraw} = await import("@excalidraw/mermaid-to-excalidraw");

                    let skeleton;
                    if (format === "excalidraw") {
                        skeleton = JSON.parse(elements);
                    } else { // format === 'mermaid'
                        skeleton = (await parseMermaidToExcalidraw(elements)).elements;
                    }

                    const converted = convertToExcalidrawElements(skeleton);
                    excalidraw.api.updateScene({elements: converted});
                    return "ok";
                },
            }),
        [excalidraw, schema], // recreated whenever the api reference changes
    );
}
