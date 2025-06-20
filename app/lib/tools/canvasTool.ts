import { tool } from "@openai/agents-realtime";
import { z } from "zod";
import { getExcalidrawApi } from "@/lib/excalidrawStore";

const canvasTool = tool({
  name: "canvas",
  description:
    "Execute JavaScript commands using the Excalidraw API. Provide code that receives an `api` argument.",
  parameters: z.object({
    script: z.string(),
  }),
  execute: async ({ script }) => {
    const api = getExcalidrawApi();
    if (!api) throw new Error("Canvas not ready");
    new Function("api", script)(api);
    return "ok";
  },
});

export default canvasTool;
