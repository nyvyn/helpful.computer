"use client";

import { useEffect, useState } from "react";
import { getOpenAiKey, setOpenAiKey } from "@/lib/openAiKey.ts";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function OpenAiKeyDialog({ open, onClose }: Props) {
    const [key, setKey] = useState("");
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) {
            getOpenAiKey().then((k) => k && setKey(k));
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
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
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 text-gray-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            onClick={async () => {
                                await setOpenAiKey(key);
                                onClose();
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
