/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import { canvasToolInstructions } from "@/lib/prompts.ts";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const excalidraw = useContext(ExcalidrawContext);

    console.log("Excalidraw", excalidraw);

    return useMemo(
        () =>
            tool({
                name: "canvas",
                description: canvasToolInstructions,
                parameters: z.object({
                    elements: z.string().optional(),
                    mermaid: z.string().optional(),
                }).refine((args) => args.elements || args.mermaid, {
                    message: "elements or mermaid required",
                }),
                execute: async ({ elements, mermaid }) => {
                    console.log("Drawing elements", elements ?? mermaid);
                    if (!excalidraw?.api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }
                    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");

                    let skeleton;
                    if (elements) {
                        skeleton = JSON.parse(elements);
                    } else {
                        const { parseMermaidToExcalidraw } = await import("@excalidraw/mermaid-to-excalidraw");
                        const result = await parseMermaidToExcalidraw(mermaid!);
                        skeleton = result.elements;
                    }

                    const converted = convertToExcalidrawElements(skeleton);
                    excalidraw.api.updateScene({ elements: converted });
                    return "ok";
                },
            }),
        [excalidraw], // recreated whenever the api reference changes
    );
}
