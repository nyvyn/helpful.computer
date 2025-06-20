"use client";

import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";

const Excalidraw = dynamic(
    async () => (await import("@/components/excalidraw/ExcalidrawWrapper")).default,
    {ssr: false},
);

export default function InteractiveCanvas() {
  const excalRef = useRef<ExcalidrawImperativeAPI>(null);
  const ctx = useContext(ExcalidrawContext);

  useEffect(() => {
    ctx?.setApi(excalRef.current);
    return () => ctx?.setApi(null);
  }, [ctx]);

  return (
      <div className="w-full h-full border border-gray-700">
          <Excalidraw ref={excalRef}/>
      </div>
  );
}
