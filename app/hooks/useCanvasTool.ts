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

    // ⬇️ place anywhere above the useMemo call (e.g. right after the console.log)
    const parametersSchema = z
      .object({
        elements: z.string().nullish(),
        mermaid: z.string().nullish(),
      })
      .superRefine((data, ctx) => {
        if (!data.elements && !data.mermaid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "elements or mermaid required",
          });
        }
      });

    return useMemo(
      () =>
        tool({
          name: "canvas",
          description: canvasToolInstructions,
          parameters: parametersSchema, // ← replace old inline schema
          execute: async ({ elements, mermaid }: z.infer<typeof parametersSchema>) => {
            if (!elements && !mermaid) {
              throw new Error("elements or mermaid required");
            }
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
