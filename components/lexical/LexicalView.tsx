"use client";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode, } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ParagraphNode, TabNode, TextNode } from "lexical";

/**
 * Rich text editor surface backed by Lexical.
 *
 * Exposes the editor instance via context so tools can read and write markdown.
 */

import React, { useContext, useEffect } from "react";
import { ToolContext } from "../tool/ToolContext.tsx";

function EditorCapture() {
    const [editor] = useLexicalComposerContext();
    const ctx = useContext(ToolContext);
    useEffect(() => {
        ctx?.setLexicalEditor(editor);
    }, [ctx, editor]);
    return null;
}

function Placeholder() {
    return (
        <div className="pointer-events-none absolute top-4 left-4 text-gray-400">
            Write something...
        </div>
    );
}

/**
 * Top-level editor component housing all Lexical plugins.
 */
export default function LexicalView() {
    const initialConfig = {
        namespace: "editor",
        theme: {
            /* block nodes */
            paragraph: "mb-2",
            heading: {
                h1: "text-4xl font-bold mb-4",
                h2: "text-3xl font-semibold mb-3",
                h3: "text-2xl font-semibold mb-2",
                h4: "text-xl  font-semibold mb-1",
                h5: "text-lg  font-semibold",
                h6: "text-base font-semibold",
            },
            quote: "border-l-4 pl-4 italic text-gray-500 my-3",
            list: {
                ul: "list-disc pl-6 mb-2",
                ol: "list-decimal pl-6 mb-2",
            },
            listitem: "mb-1",
            code: "font-mono bg-gray-800 text-green-300 p-3 rounded mb-2 text-sm whitespace-pre-wrap",

            /* inline text */
            text: {
                bold: "font-bold",
                italic: "italic",
                underline: "underline",
                strikethrough: "line-through",
                underlineStrikethrough: "underline line-through",
                code: "font-mono bg-gray-800 text-green-300 px-1 rounded",
            },

            /* tables */
            table: "table-auto border-collapse w-full my-4",
            tablerow: "",
            tablecell: "border px-3 py-1",
        },
        nodes: [
            CodeNode,
            HeadingNode,
            HorizontalRuleNode,
            LinkNode,
            ListItemNode,
            ListNode,
            ParagraphNode,
            QuoteNode,
            TabNode,
            TableCellNode,
            TableNode,
            TableRowNode,
            TextNode,
        ],
        onError: (error: Error) => {
            console.error(error);
        }
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <EditorCapture/>
            <div className="relative w-full h-full border p-4 overflow-auto text-black bg-white">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className="outline-none w-full h-full"/>
                    }
                    placeholder={<Placeholder/>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <CheckListPlugin/>
            <HistoryPlugin/>
            <LinkPlugin/>
            <ListPlugin/>
            <MarkdownShortcutPlugin/>
            <TabIndentationPlugin/>
            <TablePlugin/>
        </LexicalComposer>
    );
}
