"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <WifiOff className="w-10 h-10 text-primary" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">You're Offline</h1>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                    It looks like you've lost your internet connection.
                    Please check your network and try again.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Help text */}
                <p className="text-sm text-muted-foreground mt-8">
                    Some features may still be available from cache.
                </p>

                {/* Branding */}
                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Smart Link Hub
                    </p>
                </div>
            </div>
        </div>
    );
}
