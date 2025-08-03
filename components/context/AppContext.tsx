"use client";
import React, { createContext, ReactNode, useState, useCallback } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { LexicalEditor } from "lexical";
import { toast } from "sonner";

type AppCtx = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  setExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
  lexicalEditor: LexicalEditor | null;
  setLexicalEditor: (editor: LexicalEditor | null) => void;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;
  errored: boolean | string;
  setErrored: (errored: boolean | string) => void;
};

export const AppContext = createContext<AppCtx | null>(null);

/**
 * Provider exposing Excalidraw, Lexical references, and app state to children.
 */

export function AppProvider({ children }: { children: ReactNode }) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [lexicalEditor, setLexicalEditor] = useState<LexicalEditor | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [errored, setErroredState] = useState<boolean | string>(false);

  const setErrored = useCallback((error: boolean | string) => {
    setErroredState(error);
    if (error && typeof error === "string") {
      toast.error(error);
    }
  }, []);

  return (
    <AppContext.Provider value={{ excalidrawApi, setExcalidrawApi, lexicalEditor, setLexicalEditor, screenshot, setScreenshot, errored, setErrored }}>
      {children}
    </AppContext.Provider>
  );
}
