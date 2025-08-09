"use client";

import useDrawingTools from "@/hooks/useDrawingTools.ts";
import ExcalidrawWrapper from "components/excalidraw/ExcalidrawWrapper.tsx";

/**
 * Canvas surface using Excalidraw and exposing its API via drawing tools.
 */
import React from "react";

export default function ExcalidrawView() {
    const { setExcalidrawApi } = useDrawingTools();

    return (
        <div className="w-full h-full border border-gray-700">
            <ExcalidrawWrapper excalidrawAPI={setExcalidrawApi}/>
        </div>
    );
}