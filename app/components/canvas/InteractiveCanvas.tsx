"use client";

import { ExcalidrawContext } from "@/components/context/ExcalidrawContext";
import ExcalidrawWrapper from "@/components/excalidraw/ExcalidrawWrapper.tsx";
import React, { useContext } from "react";

export default function InteractiveCanvas() {
    const ctx = useContext(ExcalidrawContext);

    return (
        <div className="w-full h-full border border-gray-700">
            <ExcalidrawWrapper excalidrawAPI={(api) => ctx?.setApi(api)}/>
        </div>
    );
}