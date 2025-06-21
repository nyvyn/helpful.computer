'use client';
import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import { canvasStateToolInstructions } from "@/lib/prompts.ts";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";

export default function useCanvasStateTool() {
    const excalidraw = useContext(ExcalidrawContext);

    return useMemo(
        () =>
            tool({
                name: "canvas_state",
                description: canvasStateToolInstructions,
                parameters: z.object({}),
                execute: async () => {
                    if (!excalidraw?.api) {
                        throw new Error("Canvas was not correctly initialized.");
                    }
                    const elements = excalidraw.api.getSceneElements();
                    return JSON.stringify(elements);
                },
            }),
        [excalidraw]
    );
}
