import React from "react";

export default function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="7" cy="15" r="4" />
            <path d="M14 11a4 4 0 1 0-4-4v8" />
            <path d="M10 15h4l4 4" />
            <path d="M10 11h4" />
        </svg>
    );
}
