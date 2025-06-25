"use client";

import Dashboard from "@/components/Dashboard.tsx";
import { useEffect } from "react";

import { checkMicrophonePermission, requestMicrophonePermission } from "tauri-plugin-macos-permissions-api";

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
        <Dashboard/>
    );
}
