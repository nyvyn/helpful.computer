import { tool } from "@openai/agents-realtime";
import { z } from "zod";

const canvasTool = tool({
  name: "canvas",
  description:
    "Execute JavaScript commands using the Excalidraw API. Provide code that receives an `api` argument.",
  parameters: z.object({
    script: z.string(),
  }),
  execute: async ({ script }) => {
    const api = (globalThis as any).__excalidrawAPI as any;
    if (!api) throw new Error("Canvas not ready");
    new Function("api", script)(api);
    return "ok";
  },
});

export default canvasTool;