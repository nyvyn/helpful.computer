"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

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

export default function LexicalCanvas() {
  const initialConfig = {
    namespace: "editor",
    onError(error: Error) {
      console.error(error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorCapture />
      <div className="w-full h-full border border-gray-700 p-2 overflow-auto text-black bg-white">
        <ContentEditable className="outline-none w-full h-full" />
      </div>
      <HistoryPlugin />
    </LexicalComposer>
  );
}
