"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalyticsSummary, LinkPerformance, DailyStats } from "@/types";
import { analyticsApi } from "@/lib/api";

interface UseAnalyticsReturn {
    summary: AnalyticsSummary | null;
    linkPerformance: LinkPerformance[];
    dailyStats: DailyStats[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useAnalytics(hubId: string, days = 30): UseAnalyticsReturn {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [linkPerformance, setLinkPerformance] = useState<LinkPerformance[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!hubId) return;

        setLoading(true);
        setError(null);

        try {
            const [summaryData, performanceData, statsData] = await Promise.all([
                analyticsApi.getSummary(hubId, days),
                analyticsApi.getLinkPerformance(hubId, days),
                analyticsApi.getDailyStats(hubId, days),
            ]);

            setSummary(summaryData);
            setLinkPerformance(performanceData.links);
            setDailyStats(statsData.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    }, [hubId, days]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        summary,
        linkPerformance,
        dailyStats,
        loading,
        error,
        refresh: fetchAnalytics,
    };
}
