"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    BarChart3,
    Eye,
    MousePointerClick,
    TrendingUp,
    Loader2,
    Calendar,
    Globe,
    Smartphone,
    Download,
    FileText,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#22C55E", "#10B981", "#059669", "#047857", "#065F46"];

export default function AnalyticsPage() {
    const params = useParams();
    const hubId = params.hubId as string;
    const [days, setDays] = useState(30);
    const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

    const { summary, linkPerformance, dailyStats, loading, error, refresh } = useAnalytics(hubId, days);

    const handleExport = async (format: "csv" | "pdf") => {
        setExporting(format);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(
                `http://localhost:8000/api/analytics/hubs/${hubId}/export/${format}?days=${days}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analytics-${hubId}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Transform data for charts
    const chartData = dailyStats.map((stat) => ({
        date: new Date(stat.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        visits: stat.visits,
        clicks: stat.clicks,
    }));

    const deviceData = summary
        ? Object.entries(summary.device_breakdown).map(([device, count]) => ({
            name: device.charAt(0).toUpperCase() + device.slice(1),
            value: count,
        }))
        : [];

    const countryData = summary
        ? Object.entries(summary.country_breakdown)
            .slice(0, 5)
            .map(([country, count]) => ({
                name: country,
                value: count,
            }))
        : [];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                <Link
                    href={`/dashboard/hubs/${hubId}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hub
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your hub's performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Export Buttons */}
                        <button
                            onClick={() => handleExport("csv")}
                            disabled={exporting !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm disabled:opacity-50"
                        >
                            {exporting === "csv" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport("pdf")}
                            disabled={exporting !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-sm disabled:opacity-50"
                        >
                            {exporting === "pdf" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            PDF
                        </button>

                        {/* Date Selector */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <select
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="bg-card border border-border rounded-lg px-3 py-2"
                            >
                                <option value={7}>Last 7 days</option>
                                <option value={30}>Last 30 days</option>
                                <option value={90}>Last 90 days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Eye className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-400">Total Visits</span>
                        </div>
                        <p className="text-3xl font-bold">{formatNumber(summary?.total_visits || 0)}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <MousePointerClick className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-400">Total Clicks</span>
                        </div>
                        <p className="text-3xl font-bold">{formatNumber(summary?.total_clicks || 0)}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-400">Click-Through Rate</span>
                        </div>
                        <p className="text-3xl font-bold">{summary?.ctr || 0}%</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-400">Links Tracked</span>
                        </div>
                        <p className="text-3xl font-bold">{linkPerformance.length}</p>
                    </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Visits & Clicks Over Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">Visits & Clicks Over Time</h3>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#111",
                                            border: "1px solid #333",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visits"
                                        stroke="#22C55E"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </motion.div>

                    {/* Device Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-green-500" />
                            Device Breakdown
                        </h3>
                        {deviceData.length > 0 ? (
                            <div className="flex items-center">
                                <ResponsiveContainer width="50%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {deviceData.map((entry, index) => (
                                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex-1 space-y-2">
                                    {deviceData.map((item, index) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm text-gray-400">{item.name}</span>
                                            <span className="text-sm font-medium ml-auto">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Top Countries */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 mb-8"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-500" />
                        Top Countries
                    </h3>
                    {countryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={countryData} layout="vertical">
                                <XAxis type="number" stroke="#666" fontSize={12} />
                                <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={50} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#111",
                                        border: "1px solid #333",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="value" fill="#22C55E" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </motion.div>

                {/* Link Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-semibold mb-4">Link Performance</h3>
                    {linkPerformance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b border-white/10">
                                        <th className="pb-3 font-medium">Link</th>
                                        <th className="pb-3 font-medium">Clicks</th>
                                        <th className="pb-3 font-medium">CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linkPerformance.map((link, index) => (
                                        <tr key={link.link_id} className="border-b border-white/5">
                                            <td className="py-3">
                                                <div>
                                                    <p className="font-medium">{link.title}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{link.url}</p>
                                                </div>
                                            </td>
                                            <td className="py-3">{formatNumber(link.total_clicks)}</td>
                                            <td className="py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-medium ${link.ctr > 10
                                                        ? "bg-green-500/20 text-green-400"
                                                        : link.ctr > 5
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : "bg-gray-500/20 text-gray-400"
                                                        }`}
                                                >
                                                    {link.ctr}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No link performance data yet
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
