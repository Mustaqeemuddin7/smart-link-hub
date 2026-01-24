import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
    title: "Smart Link Hub - Your Smart Link-in-Bio Platform",
    description:
        "Create smart link hubs with dynamic rules, track analytics, and share your links with a single URL.",
    keywords: ["link in bio", "linktree alternative", "smart links", "analytics"],
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
                {/* Prevent flash of wrong theme */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('theme');
                                    if (theme === 'light') {
                                        document.documentElement.setAttribute('data-theme', 'light');
                                    } else if (theme === 'dark') {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                                        document.documentElement.setAttribute('data-theme', 'light');
                                    } else {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
