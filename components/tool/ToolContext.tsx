"use client";
import React, { createContext, ReactNode, useState } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { LexicalEditor } from "lexical";

type ToolCtx = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  setExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
  lexicalEditor: LexicalEditor | null;
  setLexicalEditor: (editor: LexicalEditor | null) => void;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;
};

export const ToolContext = createContext<ToolCtx | null>(null);

/**
 * Provider exposing Excalidraw and Lexical references to children.
 */

export function ToolProvider({ children }: { children: ReactNode }) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [lexicalEditor, setLexicalEditor] = useState<LexicalEditor | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  return (
    <ToolContext.Provider value={{ excalidrawApi, setExcalidrawApi, lexicalEditor, setLexicalEditor, screenshot, setScreenshot }}>
      {children}
    </ToolContext.Provider>
  );
}
