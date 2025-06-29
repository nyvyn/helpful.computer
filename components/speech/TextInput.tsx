"use client";

import React, { FormEvent, useState } from "react";

interface Props {
    sendMessage: (text: string) => void;
}

export default function TextInput({ sendMessage }: Props) {
    const [value, setValue] = useState("");

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        sendMessage(trimmed);
        setValue("");
    };

    return (
        <form onSubmit={onSubmit} className="flex gap-2 p-2 border-t border-gray-700">
            <input
                type="text"
                className="flex-1 rounded px-2 py-1 text-black"
                placeholder="Type your request..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
                Send
            </button>
        </form>
    );
}
