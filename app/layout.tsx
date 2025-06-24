import { ExcalidrawProvider } from "../components/context/ExcalidrawContext.tsx";
import { ReactNode } from "react";
import { Toaster } from "sonner";

import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en"><body>
        <ExcalidrawProvider>{children}</ExcalidrawProvider>
        <Toaster position="top-left"/>
        </body></html>
    );
}
