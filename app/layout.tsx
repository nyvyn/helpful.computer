import { ExcalidrawProvider } from "@/components/excalidraw/ExcalidrawContext.tsx";
import { StrudelProvider } from "@/components/strudel/StrudelContext.tsx";
import { ReactNode } from "react";
import { Toaster } from "sonner";

import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <ExcalidrawProvider>
        <StrudelProvider>
            {children}
        </StrudelProvider>
        </ExcalidrawProvider>
        <Toaster position="top-left"/>
        </body>
        </html>
    );
}
