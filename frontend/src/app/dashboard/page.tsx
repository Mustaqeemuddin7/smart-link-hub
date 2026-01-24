"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Link2,
    Plus,
    BarChart3,
    ExternalLink,
    Eye,
    MousePointerClick,
    Loader2,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHubs } from "@/hooks/useHubs";
import { formatNumber, getPublicHubUrl } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
    const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
    const { hubs, loading: hubsLoading, error } = useHubs();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-xl z-50">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Link2 className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold gradient-text">Smart Link Hub</span>
                    </Link>
                </div>

                <nav className="px-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-foreground"
                    >
                        <Link2 className="w-5 h-5" />
                        My Hubs
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">My Hubs</h1>
                            <p className="text-gray-400 mt-1">Manage your link hubs</p>
                        </div>
                        <Link
                            href="/dashboard/hubs/new"
                            className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Hub
                        </Link>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {hubsLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!hubsLoading && hubs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-12 text-center"
                        >
                            <Link2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No hubs yet</h2>
                            <p className="text-gray-400 mb-6">
                                Create your first hub to start sharing your links
                            </p>
                            <Link
                                href="/dashboard/hubs/new"
                                className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-green-400 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Hub
                            </Link>
                        </motion.div>
                    )}

                    {/* Hubs Grid */}
                    {!hubsLoading && hubs.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hubs.map((hub, index) => (
                                <motion.div
                                    key={hub.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/dashboard/hubs/${hub.id}`}
                                        className="block glass-card p-6 hover:border-green-500/40 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold group-hover:text-green-400 transition-colors">
                                                    {hub.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">/{hub.slug}</p>
                                            </div>
                                            <div
                                                className={`w-3 h-3 rounded-full ${hub.is_active ? "bg-green-500" : "bg-gray-500"
                                                    }`}
                                            />
                                        </div>

                                        {hub.description && (
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                                {hub.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Link2 className="w-4 h-4" />
                                                {hub.link_count || 0} links
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {formatNumber(hub.total_visits || 0)}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <a
                                                href={getPublicHubUrl(hub.slug)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Public
                                            </a>
                                            <span className="text-xs text-gray-600">
                                                {hub.link_count || 0} links
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
