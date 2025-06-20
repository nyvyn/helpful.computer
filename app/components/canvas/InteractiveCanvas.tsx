"use client";

import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import { setExcalidrawApi } from "@/lib/excalidrawStore";

const Excalidraw = dynamic(
    async () => (await import("../excalidraw/ExcalidrawWrapper")).default,
    {ssr: false},
);

export default function InteractiveCanvas() {
    const excalRef = useRef<ExcalidrawImperativeAPI>(null);

    useEffect(() => {
      setExcalidrawApi(excalRef.current);
      return () => setExcalidrawApi(null);
    }, []);

    return (
        <div className="w-full h-full border border-gray-700">
            <Excalidraw ref={excalRef}/>
        </div>
    );
}
