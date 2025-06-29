"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { LexicalEditor, $getRoot, $createTextNode } from "lexical";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

const schema = z.object({
  instructions: z.string().describe("Description of the desired text content"),
});

export default function useLexicalTools() {
  const ctx = useContext(ToolContext);
  const editorRef = useRef<LexicalEditor | null>(null);

  useEffect(() => { editorRef.current = ctx ? ctx.lexicalEditor : null; }, [ctx, ctx?.lexicalEditor]);

  const updateDocument = useMemo(() => tool({
    name: "Update Document",
    description: "Update the text editor using natural language instructions.",
    parameters: schema,
    strict: true,
    execute: async ({ instructions }: z.infer<typeof schema>) => {
      try {
        const openai = new OpenAI({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true,
        });
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            { role: "system", content: "Provide plain text only." },
            { role: "user", content: instructions },
          ],
        });
        const text = completion.choices[0].message.content ?? "";
        editorRef.current?.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createTextNode(text));
        });
        return "ok";
      } catch (err) {
        console.error("update-document tool error:", err);
        return err instanceof Error ? err.message : String(err);
      }
    },
  }), [editorRef]);

  const readDocument = useMemo(() => tool({
    name: "Read Document",
    description: "Returns the current document text.",
    parameters: z.object({}).strict(),
    strict: true,
    execute: async () => {
      let result = "";
      editorRef.current?.update(() => {
        result = $getRoot().getTextContent();
      });
      return result;
    },
  }), [editorRef]);

  return [updateDocument, readDocument];
}
