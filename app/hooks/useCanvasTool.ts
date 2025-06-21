"use client";

import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import { canvasToolInstructions } from "@/lib/prompts.ts";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const excalidraw = useContext(ExcalidrawContext);

    console.log("Excalidraw", excalidraw);

    const schema = z.object({
        elements: z.string(),
        format: z.enum(["excalidraw", "mermaid"]),
    });

    return useMemo(
        () =>
            tool({
                name: "canvas",
                description: canvasToolInstructions,
                parameters: schema,
                execute: async ({elements, format}: z.infer<typeof schema>) => {
                    console.log("Drawing elements", elements);

                    if (!excalidraw?.api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }
                    const {convertToExcalidrawElements} = await import("@excalidraw/excalidraw");

                    let skeleton;
                    if (format === "excalidraw") {
                        skeleton = JSON.parse(elements);
                    } else { // format === 'mermaid'
                        const {parseMermaidToExcalidraw} = await import("@excalidraw/mermaid-to-excalidraw");
                        const result = await parseMermaidToExcalidraw(elements);
                        skeleton = result.elements;
                    }

                    const converted = convertToExcalidrawElements(skeleton);
                    excalidraw.api.updateScene({elements: converted});
                    return "ok";
                },
            }),
        [excalidraw, schema], // recreated whenever the api reference changes
    );
}
