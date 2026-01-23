"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { publicApi } from "@/lib/api";
import type { PublicHub, ProcessedLink } from "@/types";

interface PublicHubPageProps {
    params: { slug: string };
}

export default function PublicHubPage({ params }: PublicHubPageProps) {
    const [hub, setHub] = useState<PublicHub | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHub = async () => {
            try {
                const data = await publicApi.getHub(params.slug);
                setHub(data);
                // Track visit
                await publicApi.trackVisit(params.slug);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Hub not found");
            } finally {
                setLoading(false);
            }
        };
        fetchHub();
    }, [params.slug]);

    const handleLinkClick = async (link: ProcessedLink) => {
        // Track click
        publicApi.trackClick(link.id);
        // Open link
        window.open(link.url, "_blank", "noopener,noreferrer");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    if (error || !hub) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400">Hub not found</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-12 px-4"
            style={{ backgroundColor: hub.theme?.background || "#000000" }}
        >
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px]"
                    style={{ backgroundColor: `${hub.theme?.accent || "#22C55E"}20` }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[128px]"
                    style={{ backgroundColor: `${hub.theme?.accent || "#22C55E"}10` }}
                />
            </div>

            <div className="relative max-w-md mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{
                            background: `linear-gradient(135deg, ${hub.theme?.accent || "#22C55E"} 0%, #10B981 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        {hub.title}
                    </h1>
                    {hub.description && (
                        <p className="text-gray-400 text-sm">{hub.description}</p>
                    )}
                </motion.div>

                {/* Links */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {hub.links.map((link, index) => (
                            <motion.button
                                key={link.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLinkClick(link)}
                                className={`
                  w-full p-4 rounded-xl text-left transition-all duration-300
                  backdrop-blur-xl group cursor-pointer
                  ${link.is_highlighted
                                        ? "border-2"
                                        : "border border-white/10 hover:border-white/20"
                                    }
                `}
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    borderColor: link.is_highlighted
                                        ? `${hub.theme?.accent || "#22C55E"}80`
                                        : undefined,
                                    boxShadow: link.is_highlighted
                                        ? `0 0 20px ${hub.theme?.accent || "#22C55E"}30, 0 0 40px ${hub.theme?.accent || "#22C55E"}10`
                                        : undefined,
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {link.icon && <span className="text-2xl">{link.icon}</span>}
                                        <div>
                                            <span className="text-white font-medium flex items-center gap-2">
                                                {link.title}
                                                {link.is_highlighted && (
                                                    <Sparkles
                                                        className="w-4 h-4 animate-pulse"
                                                        style={{ color: hub.theme?.accent || "#22C55E" }}
                                                    />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink
                                        className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors"
                                        style={{
                                            color: link.is_highlighted
                                                ? hub.theme?.accent || "#22C55E"
                                                : undefined,
                                        }}
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12 text-xs text-gray-600"
                >
                    Powered by{" "}
                    <span style={{ color: hub.theme?.accent || "#22C55E" }}>
                        Smart Link Hub
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
