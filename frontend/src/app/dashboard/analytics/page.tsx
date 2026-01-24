"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Link2,
    BarChart3,
    LogOut,
    Eye,
    MousePointerClick,
    TrendingUp,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHubs } from "@/hooks/useHubs";
import { formatNumber } from "@/lib/utils";

export default function GlobalAnalyticsPage() {
    const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
    const { hubs, loading: hubsLoading } = useHubs();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    // Calculate totals
    const totalVisits = hubs.reduce((sum, hub) => sum + (hub.total_visits || 0), 0);
    const totalLinks = hubs.reduce((sum, hub) => sum + (hub.link_count || 0), 0);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl z-50">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Link2 className="w-8 h-8 text-green-500" />
                        <span className="text-xl font-bold gradient-text">Smart Link Hub</span>
                    </Link>
                </div>

                <nav className="px-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Link2 className="w-5 h-5" />
                        My Hubs
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white"
                    >
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <span className="text-green-500 font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Analytics Overview</h1>
                        <p className="text-gray-400 mt-1">Track performance across all your hubs</p>
                    </div>

                    {/* Global Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Link2 className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-400">Total Hubs</span>
                            </div>
                            <p className="text-3xl font-bold">{hubs.length}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Eye className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-400">Total Visits</span>
                            </div>
                            <p className="text-3xl font-bold">{formatNumber(totalVisits)}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Link2 className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-400">Total Links</span>
                            </div>
                            <p className="text-3xl font-bold">{totalLinks}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-400">Active Hubs</span>
                            </div>
                            <p className="text-3xl font-bold">{hubs.filter((h) => h.is_active).length}</p>
                        </motion.div>
                    </div>

                    {/* Hub Performance Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold mb-4">Hub Performance</h2>
                        {hubs.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b border-white/10">
                                        <th className="pb-3 font-medium">Hub</th>
                                        <th className="pb-3 font-medium">Links</th>
                                        <th className="pb-3 font-medium">Visits</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hubs.map((hub) => (
                                        <tr key={hub.id} className="border-b border-white/5">
                                            <td className="py-4">
                                                <div>
                                                    <p className="font-medium">{hub.title}</p>
                                                    <p className="text-xs text-gray-500">/{hub.slug}</p>
                                                </div>
                                            </td>
                                            <td className="py-4">{hub.link_count || 0}</td>
                                            <td className="py-4">{formatNumber(hub.total_visits || 0)}</td>
                                            <td className="py-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-medium ${hub.is_active
                                                            ? "bg-green-500/20 text-green-400"
                                                            : "bg-gray-500/20 text-gray-400"
                                                        }`}
                                                >
                                                    {hub.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <Link
                                                    href={`/dashboard/hubs/${hub.id}/analytics`}
                                                    className="text-green-400 hover:text-green-300 text-sm"
                                                >
                                                    View Details →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No hubs yet. Create your first hub to see analytics.
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
