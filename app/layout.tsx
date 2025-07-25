import { ToolProvider } from "@/components/tool/ToolContext.tsx";
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
        <ToolProvider>{children}</ToolProvider>
        <Toaster position="top-left" style={{ maxWidth: "24px" }}/>
        </body>
        </html>
    );
}
