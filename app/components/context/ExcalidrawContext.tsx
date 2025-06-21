"use client";

import React, { createContext, useState, ReactNode } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type Ctx = {
  api: ExcalidrawImperativeAPI | null;
  setApi: (api: ExcalidrawImperativeAPI | null) => void;
};

export const ExcalidrawContext = createContext<Ctx | null>(null);

export function ExcalidrawProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  return (
    <ExcalidrawContext.Provider value={{ api, setApi }}>
      {children}
    </ExcalidrawContext.Provider>
  );
}
