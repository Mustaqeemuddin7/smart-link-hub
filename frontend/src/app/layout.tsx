import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
    title: "Smart Link Hub - Your Smart Link-in-Bio Platform",
    description:
        "Create smart link hubs with dynamic rules, track analytics, and share your links with a single URL.",
    keywords: ["link in bio", "linktree alternative", "smart links", "analytics"],
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#22C55E",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ServiceWorkerRegistration />
                {children}
            </body>
        </html>
    );
}

