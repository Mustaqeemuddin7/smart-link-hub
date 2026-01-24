"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Register service worker on mount
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then(() => {
                    // Service worker registered successfully
                })
                .catch(() => {
                    // Service worker registration failed - fail silently
                });
        }
    }, []);

    // This component doesn't render anything
    return null;
}

