"use client";

import React, { createContext, useState, ReactNode } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type Ctx = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  setExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
};

export const ExcalidrawContext = createContext<Ctx | null>(null);

export function ExcalidrawProvider({ children }: { children: ReactNode }) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  return (
    <ExcalidrawContext.Provider value={{ excalidrawApi, setExcalidrawApi }}>
      {children}
    </ExcalidrawContext.Provider>
  );
}
