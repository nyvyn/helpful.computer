"use client";
import React, { createContext, useState, ReactNode } from "react";

export type StrudelEditor = HTMLElement & { editor?: { evaluate: (code: string) => void } };

interface Ctx {
  editor: StrudelEditor | null;
  setEditor: (editor: StrudelEditor | null) => void;
}

export const StrudelContext = createContext<Ctx | null>(null);

export function StrudelProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<StrudelEditor | null>(null);
  return (
    <StrudelContext.Provider value={{ editor, setEditor }}>
      {children}
    </StrudelContext.Provider>
  );
}
