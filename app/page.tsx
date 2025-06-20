"use client";

import { ExcalidrawProvider } from "@/components/context/ExcalidrawContext.tsx";
import { useEffect } from "react";

import { checkMicrophonePermission, requestMicrophonePermission } from "tauri-plugin-macos-permissions-api";
import Dashboard from "./components/Dashboard.tsx";

export default function HomePage() {
    useEffect(() => {
        checkMicrophonePermission().then(checkMicrophonePermission => {
            if (!checkMicrophonePermission) {
                requestMicrophonePermission().then(requestMicrophonePermission => {
                    if (!requestMicrophonePermission) {
                        alert("Microphone permission denied");
                    }
                });
            }
        });
    }, []);

    return (
        <ExcalidrawProvider>
            <Dashboard/>
        </ExcalidrawProvider>
    );
}
