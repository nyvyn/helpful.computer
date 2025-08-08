"use client";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { LexicalEditor } from "lexical";
import React, { createContext, ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";

type AppCtx = {
    browserView: HTMLIFrameElement | null;
    setBrowserView: (view: HTMLIFrameElement | null) => void;
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

export function AppProvider({children}: { children: ReactNode }) {
    const [browserView, setBrowserView] = useState<HTMLIFrameElement | null>(null);
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
        <AppContext.Provider
            value={{
                browserView,
                setBrowserView,
                excalidrawApi,
                setExcalidrawApi,
                lexicalEditor,
                setLexicalEditor,
                screenshot,
                setScreenshot,
                errored,
                setErrored
            }}>
            {children}
        </AppContext.Provider>
    );
}
