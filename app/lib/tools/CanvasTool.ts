/*
// Este archivo ya no se usa. La herramienta canvas ahora se crea dinámicamente con useCanvasTool.
import { tool } from "@openai/agents-realtime";
import { z } from "zod";

const CanvasTool = tool({
  name: "canvas",
  description:
    "Execute JavaScript commands using the Excalidraw API. Provide code that receives an `api` argument.",
  parameters: z.object({
    script: z.string(),
  }),
  execute: async ({ script }) => {

    if (!api) throw new Error("Canvas was not correctly initialized.");
    new Function("api", script)(api);
    return "ok";
  },
});

export default CanvasTool;
*/
