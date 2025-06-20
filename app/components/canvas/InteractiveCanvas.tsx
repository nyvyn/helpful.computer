"use client";

import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import React, { useContext, useCallback } from "react";

const Excalidraw = dynamic(
    async () => (await import("@/components/excalidraw/ExcalidrawWrapper")).default,
    {ssr: false},
);

export default function InteractiveCanvas() {
    const ctx = useContext(ExcalidrawContext);

    /* keep the context in sync whenever Excalidraw mounts/unmounts */
    const handleRef = useCallback(
        (api: ExcalidrawImperativeAPI | null) => {
            console.log("Setting Excalidraw API:", api);
            ctx?.setApi(api);
        },
        [ctx],
    );

    return (
        <div className="w-full h-full border border-gray-700">
            <Excalidraw ref={handleRef} />
        </div>
    );
}
