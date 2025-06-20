import { useContext, useMemo } from "react";
import { tool } from "@openai/agents-realtime";
import { z } from "zod";
import { ExcalidrawContext } from "@/components/context/ExcalidrawContext";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
  const { api } = useContext(ExcalidrawContext)!;

  return useMemo(
    () =>
      tool({
        name: "canvas",
        description:
          "Execute JavaScript commands using the Excalidraw API. Provide code that receives an `api` argument.",
        parameters: z.object({ script: z.string() }),
        execute: async ({ script }) => {
          if (!api) throw new Error("Canvas was not correctly initialized.");
          new Function("api", script)(api);
          return "ok";
        },
      }),
    [api],           // recreated whenever the api reference changes
  );
}
