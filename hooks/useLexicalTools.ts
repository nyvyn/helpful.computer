"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS, } from "@lexical/markdown";
import { tool } from "@openai/agents-realtime";
import { $getRoot, LexicalEditor } from "lexical";
import { useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

const schema = z.object({
    markdown: z.string().describe("Full markdown document to place in the editor"),
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
            "Replace the entire document with the provided `markdown` string.",
        parameters: schema,
        strict: true,
        execute: async ({markdown}: z.infer<typeof schema>) => {
            try {
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
