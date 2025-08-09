"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS, } from "@lexical/markdown";
import { tool } from "@openai/agents-realtime";
import { $getRoot, LexicalEditor } from "lexical";
import OpenAI from "openai";
import { useMemo, useRef } from "react";
import { z } from "zod";

/**
 * Bind Lexical editor operations to OpenAI agent tools.
 *
 * Provides "Read Markdown" and "Write Markdown" tools for the current editor.
 */

const schema = z.object({
    instructions: z.string().describe(
        "Natural-language description of what should be written in the document."
    ),
});

/**
 * Provide OpenAI tools for reading and writing Markdown via Lexical.
 */
export default function useWritingTools() {
    const editorRef = useRef<LexicalEditor | null>(null);

    const readMarkdownTool = useMemo(() => tool({
        name: "Read Markdown",
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
                console.error("read-markdown tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [editorRef]);

    const writeMarkdownTool = useMemo(() => tool({
        name: "Write Markdown",
        description:
            "Write content inside the document using natural-language `instructions` (Markdown format).",
        parameters: schema,
        strict: true,
        execute: async ({ instructions }: z.infer<typeof schema>) => {
            try {
                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }
                const openai = new OpenAI({
                    apiKey: apiKey!,
                    dangerouslyAllowBrowser: true,
                });
                if (!openai) {
                    return "OpenAI client not initialized";
                }

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
                console.error("write-markdown tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), [editorRef]);

    const setLexicalEditor = (editor: LexicalEditor | null) => {
        console.log("Setting Lexical editor in writing tools:", editor);
        editorRef.current = editor;
    };

    const tools = useMemo(() => [readMarkdownTool, writeMarkdownTool] as const, [readMarkdownTool, writeMarkdownTool]);
    
    return { tools, setLexicalEditor };
}
