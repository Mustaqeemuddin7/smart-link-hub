"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerState {
    isSupported: boolean;
    isRegistered: boolean;
    isOffline: boolean;
    registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker(): ServiceWorkerState {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isRegistered: false,
        isOffline: false,
        registration: null,
    });

    useEffect(() => {
        // Check if service workers are supported
        const isSupported = "serviceWorker" in navigator;

        if (!isSupported) {
            setState(prev => ({ ...prev, isSupported: false }));
            return;
        }

        // Register service worker
        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });

                setState(prev => ({
                    ...prev,
                    isSupported: true,
                    isRegistered: true,
                    registration,
                }));

                // Handle updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                // New version available
                                console.log("New version available!");
                            }
                        });
                    }
                });
            } catch (error) {
                console.error("Service worker registration failed:", error);
                setState(prev => ({ ...prev, isSupported: true, isRegistered: false }));
            }
        };

        registerSW();

        // Listen for online/offline events
        const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
        const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Set initial offline state
        setState(prev => ({ ...prev, isOffline: !navigator.onLine }));

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return state;
}

/**
 * Component to handle service worker registration
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    const { isOffline } = useServiceWorker();

    // Could show a banner when offline
    return (
        <>
        { isOffline && (
            <div className= "fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 text-sm font-medium z-50" >
        You are currently offline.Some features may not be available.
                </div>
            )
}
{ children }
</>
    );
}
