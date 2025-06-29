"use client";
import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode, } from "@lexical/rich-text";
import { ParagraphNode, TextNode } from "lexical";

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
        <div className="pointer-events-none absolute top-2 left-2 text-gray-400">
            Write something...
        </div>
    );
}

export default function LexicalCanvas() {
    const initialConfig = {
        namespace: "editor",
        nodes: [
            ParagraphNode,
            TextNode,
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
        ],
        onError: (error: Error) => {
            console.error(error);
        }
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <EditorCapture/>
            <div className="relative w-full h-full border border-gray-700 p-2 overflow-auto text-black bg-white">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className="outline-none w-full h-full"/>
                    }
                    placeholder={<Placeholder/>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <HistoryPlugin/>
        </LexicalComposer>
    );
}
