"use client";

import { ToolContext } from "../tool/ToolContext.tsx";
import ExcalidrawWrapper from "components/excalidraw/ExcalidrawWrapper.tsx";

/**
 * Canvas surface using Excalidraw and exposing its API via context.
 */
import React, { useContext } from "react";

export default function ExcalidrawView() {
    const ctx = useContext(ToolContext);

    return (
        <div className="w-full h-full border border-gray-700">
            <ExcalidrawWrapper excalidrawAPI={(api) => ctx?.setExcalidrawApi(api)}/>
        </div>
    );
}