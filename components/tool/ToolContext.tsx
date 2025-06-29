"use client";
import React, { createContext, ReactNode, useState } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { LexicalEditor } from "lexical";

type ToolCtx = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  setExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
  lexicalEditor: LexicalEditor | null;
  setLexicalEditor: (editor: LexicalEditor | null) => void;
};

export const ToolContext = createContext<ToolCtx | null>(null);

export function ToolProvider({ children }: { children: ReactNode }) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [lexicalEditor, setLexicalEditor] = useState<LexicalEditor | null>(null);
  return (
    <ToolContext.Provider value={{ excalidrawApi, setExcalidrawApi, lexicalEditor, setLexicalEditor }}>
      {children}
    </ToolContext.Provider>
  );
}
