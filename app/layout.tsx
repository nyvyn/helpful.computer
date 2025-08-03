import { AppProvider } from "@/components/context/AppContext.tsx";
import { ReactNode } from "react";
import { Toaster } from "sonner";

import "./globals.css";

/**
 * Application layout used by Next.js pages.
 */

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <AppProvider>{children}</AppProvider>
        <Toaster position="top-left" style={{ maxWidth: "24px" }}/>
        </body>
        </html>
    );
}