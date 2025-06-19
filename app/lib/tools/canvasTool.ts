import { tool } from "@openai/agents-realtime";
import { z } from "zod";

const canvasTool = tool({
  name: "canvas",
  description:
    "Execute JavaScript drawing commands on the shared canvas. Provide code that uses a CanvasRenderingContext2D named `ctx`.",
  parameters: z.object({
    script: z.string(),
  }),
  execute: async ({ script }) => {
    const ctx = (globalThis as any).__aiCanvasCtx as
      | CanvasRenderingContext2D
      | undefined;
    if (!ctx) throw new Error("Canvas not ready");
    new Function("ctx", script)(ctx);
    return "ok";
  },
});

export default canvasTool;