"use client";

import React, { useEffect, useState } from "react";
import { getOpenAiKey, setOpenAiKey } from "@/lib/openAiKey.ts";

export default function SettingsView() {
    const [key, setKey] = useState("");
    const [show, setShow] = useState(false);

    useEffect(() => {
        getOpenAiKey().then((k) => k && setKey(k));
    }, []);

    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded w-96 text-sm">
                <h2 className="text-white mb-2">OpenAI API Key</h2>
                <input
                    type={show ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full p-2 bg-black text-white rounded border border-gray-700"
                />
                <div className="mt-2 flex justify-between items-center">
                    <label className="flex items-center gap-1 text-gray-300">
                        <input
                            type="checkbox"
                            checked={show}
                            onChange={() => setShow((s) => !s)}
                        />
                        Show key
                    </label>
                    <button
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={async () => {
                            await setOpenAiKey(key);
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
