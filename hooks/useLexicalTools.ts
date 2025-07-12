"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS, } from "@lexical/markdown";
import { tool } from "@openai/agents-realtime";
import { $getRoot, LexicalEditor } from "lexical";
import { useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import OpenAI from "openai";

const schema = z.object({
    instructions: z.string().describe(
        "Natural-language description of what should be written in the document."
    ),
});

export default function useLexicalTools() {
    const ctx = useContext(ToolContext);
    const editorRef = useRef<LexicalEditor | null>(null);

    useEffect(() => {
        editorRef.current = ctx ? ctx.lexicalEditor : null;
    }, [ctx, ctx?.lexicalEditor]);

    const getDocumentMarkdown = useMemo(() => tool({
        name: "Get Document Markdown",
        description: "Returns the current document as a markdown string.",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                let markdown = "";
                editorRef.current?.getEditorState().read(() => {
                    markdown = $convertToMarkdownString(TRANSFORMERS);
                });
                console.log(markdown);
                return markdown;
            } catch (err) {
                console.error("read-document-markdown tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [editorRef]);

    const setDocumentMarkdown = useMemo(() => tool({
        name: "Set Document Markdown",
        description:
            "Write content inside the document using natural-language `instructions` (Markdown format).",
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
                        {
                            role: "system",
                            content:
                                "You are a writing assistant. " +
                                "Return ONLY the final Markdown document with no explanations.",
                        },
                        { role: "user", content: instructions },
                    ],
                });

                const markdown = completion.choices[0].message.content as string;

                editorRef.current?.update(() => {
                    const root = $getRoot();
                    root.clear();
                    $convertFromMarkdownString(markdown, TRANSFORMERS);
                });

                return "ok";
            } catch (err) {
                console.error("set-document-markdown tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [editorRef]);

    return [getDocumentMarkdown, setDocumentMarkdown];
}
