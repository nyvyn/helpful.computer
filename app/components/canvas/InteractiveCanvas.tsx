"use client";

import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useRef } from "react";

const Excalidraw = dynamic(
    async () => (await import("@/components/excalidraw/ExcalidrawWrapper")).default,
    {ssr: false},
);

export default function InteractiveCanvas() {
    const excalRef = useRef<ExcalidrawImperativeAPI>(null);
    const ctx = useContext(ExcalidrawContext);

    useEffect(() => {
        console.log("Setting excalidraw api", excalRef.current);
        ctx?.setApi(excalRef.current);
        return () => ctx?.setApi(null);
    }, [ctx, excalRef.current]);

    return (
        <div className="w-full h-full border border-gray-700">
            <Excalidraw ref={excalRef}/>
        </div>
    );
}
