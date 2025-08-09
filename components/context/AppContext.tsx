"use client";
import React, { createContext, ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";

type AppCtx = {
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
                screenshot,
                setScreenshot,
                errored,
                setErrored
            }}>
            {children}
        </AppContext.Provider>
    );
}
