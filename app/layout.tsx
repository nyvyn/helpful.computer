import { ExcalidrawProvider } from "@/components/context/ExcalidrawContext.tsx";
import { ReactNode } from "react";

import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en"><body>
        <ExcalidrawProvider>{children}</ExcalidrawProvider>
        </body></html>
    );
}
