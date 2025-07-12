"use client";

import { ToolContext } from "../tool/ToolContext.tsx";
import ExcalidrawWrapper from "components/excalidraw/ExcalidrawWrapper.tsx";
import React, { useContext } from "react";

/**
 * Container component that exposes the Excalidraw API via context.
 */
export default function ExcalidrawCanvas() {
    const ctx = useContext(ToolContext);

    return (
        <div className="w-full h-full border border-gray-700">
            <ExcalidrawWrapper excalidrawAPI={(api) => ctx?.setExcalidrawApi(api)}/>
        </div>
    );
}