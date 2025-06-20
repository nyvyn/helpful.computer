import { ExcalidrawContext } from "@/components/context/ExcalidrawContext";
import { tool } from "@openai/agents-realtime";
import { useContext, useMemo } from "react";
import { z } from "zod";

/* Returns a Tool instance bound to the current Excalidraw API */
export default function useCanvasTool() {
    const {api} = useContext(ExcalidrawContext)!;

    console.log(api);

    return useMemo(
        () =>
            tool({
                name: "canvas",
                description:
                    "Execute JavaScript commands using the Excalidraw API. Provide code that receives an `api` argument.",
                parameters: z.object({script: z.string()}),
                execute: async ({script}) => {
                    if (!api) {
                        console.log("The canvas was not correctly initialized.");
                        throw new Error("Canvas was not correctly initialized.");
                    }
                    new Function("api", script)(api);
                    return "ok";
                },
            }),
        [api],           // recreated whenever the api reference changes
    );
}
