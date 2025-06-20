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
                parameters: z.object({elements: z.string()}),
                execute: async ({elements}) => {
                    console.log("Drawing elements", elements);
                    if (!excalidraw?.api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }
                    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
                    const converted = convertToExcalidrawElements(
                      JSON.parse(elements),
                    );
                    excalidraw.api.updateScene({elements: converted});
                    return "ok";
                },
            }),
        [excalidraw],           // recreated whenever the api reference changes
    );
}
