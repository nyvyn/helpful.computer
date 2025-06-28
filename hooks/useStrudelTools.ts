"use client";

import { StrudelContext, StrudelEditor } from "../components/strudel/StrudelContext.tsx";
import { tool } from "@openai/agents-realtime";
import { useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

const schema = z.object({
  code: z.string().describe("Strudel code to evaluate"),
});

export default function useStrudelTools() {
  const ctx = useContext(StrudelContext);
  const editorRef = useRef<StrudelEditor | null>(null);

  useEffect(() => {
    editorRef.current = ctx?.editor ?? null;
  }, [ctx, ctx?.editor]);

  const runCode = useMemo(
    () =>
      tool({
        name: "Strudel Execute",
        description: "Execute code in the Strudel music editor.",
        parameters: schema,
        strict: true,
        execute: async ({ code }: z.infer<typeof schema>) => {
          if (!editorRef.current) return "Editor not ready";
          try {
            // @ts-ignore
            editorRef.current.editor?.evaluate(code);
            return "ok";
          } catch (err) {
            console.error("strudel tool error:", err);
            return err instanceof Error ? err.message : String(err);
          }
        },
      }),
    [editorRef]
  );

  return [runCode];
}
