"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Link2, Loader2, Sparkles } from "lucide-react";
import { useHubs } from "@/hooks/useHubs";
import { hubsApi } from "@/lib/api";
import { generateSlug } from "@/lib/utils";

export default function NewHubPage() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [checkingSlug, setCheckingSlug] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { createHub } = useHubs();

    const handleTitleChange = (value: string) => {
        setTitle(value);
        const generatedSlug = generateSlug(value);
        setSlug(generatedSlug);
        if (generatedSlug) {
            checkSlugAvailability(generatedSlug);
        }
    };

    const handleSlugChange = async (value: string) => {
        const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setSlug(cleanSlug);
        if (cleanSlug) {
            await checkSlugAvailability(cleanSlug);
        } else {
            setSlugAvailable(null);
        }
    };

    const checkSlugAvailability = async (slugToCheck: string) => {
        setCheckingSlug(true);
        try {
            const result = await hubsApi.checkSlug(slugToCheck);
            setSlugAvailable(result.available);
        } catch {
            setSlugAvailable(null);
        } finally {
            setCheckingSlug(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!slugAvailable) {
            setError("Please choose an available slug");
            return;
        }

        setLoading(true);
        try {
            const hub = await createHub({
                title,
                slug,
                description: description || undefined,
            });
            if (hub) {
                router.push(`/dashboard/hubs/${hub.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create hub");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Hub</h1>
                            <p className="text-gray-400">Set up your link hub</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-300">
                                Hub Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="My Awesome Links"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-medium text-gray-300">
                                URL Slug *
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    yourdomain.com/
                                </div>
                                <input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="my-links"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-36 pr-10 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    required
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {checkingSlug && <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />}
                                    {!checkingSlug && slugAvailable === true && (
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                    {!checkingSlug && slugAvailable === false && (
                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {slugAvailable === false && (
                                <p className="text-sm text-red-400">This slug is already taken</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-300">
                                Description (optional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief description of your hub..."
                                rows={3}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !slugAvailable}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5" />
                                    Create Hub
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
