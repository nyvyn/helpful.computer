"use client";
import React, { useEffect, useRef } from "react";
import { Excalidraw, type ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";

export default function InteractiveCanvas() {
    const excalRef = useRef<ExcalidrawImperativeAPI>(null);

    useEffect(() => {
        const api = excalRef.current;
        if (api) (globalThis as any).__excalidrawAPI = api;
        return () => {
            if ((globalThis as any).__excalidrawAPI === api) delete (globalThis as any).__excalidrawAPI;
        };
    }, []);

    return (
        <div className="w-full h-full border border-gray-700">
            <Excalidraw ref={excalRef} />
        </div>
    );
}
