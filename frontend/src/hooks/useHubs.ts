"use client";

import { useState, useEffect, useCallback } from "react";
import type { Hub, HubCreate, HubUpdate } from "@/types";
import { hubsApi } from "@/lib/api";

interface UseHubsReturn {
    hubs: Hub[];
    loading: boolean;
    error: string | null;
    total: number;
    fetchHubs: () => Promise<void>;
    createHub: (data: HubCreate) => Promise<Hub | null>;
    updateHub: (hubId: string, data: HubUpdate) => Promise<Hub | null>;
    deleteHub: (hubId: string) => Promise<boolean>;
}

export function useHubs(): UseHubsReturn {
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchHubs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await hubsApi.list();
            setHubs(response.hubs);
            setTotal(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch hubs");
        } finally {
            setLoading(false);
        }
    }, []);

    const createHub = useCallback(async (data: HubCreate): Promise<Hub | null> => {
        setError(null);

        try {
            const hub = await hubsApi.create(data);
            setHubs((prev) => [hub, ...prev]);
            setTotal((prev) => prev + 1);
            return hub;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create hub");
            return null;
        }
    }, []);

    const updateHub = useCallback(async (hubId: string, data: HubUpdate): Promise<Hub | null> => {
        setError(null);

        try {
            const hub = await hubsApi.update(hubId, data);
            setHubs((prev) =>
                prev.map((h) => (h.id === hubId ? hub : h))
            );
            return hub;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update hub");
            return null;
        }
    }, []);

    const deleteHub = useCallback(async (hubId: string): Promise<boolean> => {
        setError(null);

        try {
            await hubsApi.delete(hubId);
            setHubs((prev) => prev.filter((h) => h.id !== hubId));
            setTotal((prev) => prev - 1);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete hub");
            return false;
        }
    }, []);

    useEffect(() => {
        fetchHubs();
    }, [fetchHubs]);

    return {
        hubs,
        loading,
        error,
        total,
        fetchHubs,
        createHub,
        updateHub,
        deleteHub,
    };
}
