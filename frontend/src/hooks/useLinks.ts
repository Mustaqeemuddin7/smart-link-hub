"use client";

import { useState, useEffect, useCallback } from "react";
import type { Link } from "@/types";
import { linksApi } from "@/lib/api";

interface UseLinksReturn {
    links: Link[];
    loading: boolean;
    error: string | null;
    addLink: (hubId: string, title: string, url: string, icon?: string) => Promise<Link | null>;
    updateLink: (linkId: string, data: Partial<Link>) => Promise<Link | null>;
    deleteLink: (linkId: string) => Promise<boolean>;
    toggleLink: (link: Link) => Promise<Link | null>;
    reorderLinks: (hubId: string, linkIds: string[]) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function useLinks(hubId: string): UseLinksReturn {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        if (!hubId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await linksApi.list(hubId);
            setLinks(response.links);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch links");
        } finally {
            setLoading(false);
        }
    }, [hubId]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const addLink = useCallback(
        async (hubId: string, title: string, url: string, icon?: string): Promise<Link | null> => {
            setError(null);
            try {
                const link = await linksApi.create(hubId, { title, url, icon });
                setLinks((prev) => [...prev, link]);
                return link;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to add link");
                return null;
            }
        },
        []
    );

    const updateLink = useCallback(
        async (linkId: string, data: Partial<Link>): Promise<Link | null> => {
            setError(null);
            try {
                const updated = await linksApi.update(linkId, data);
                setLinks((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
                return updated;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update link");
                return null;
            }
        },
        []
    );

    const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
        setError(null);
        try {
            await linksApi.delete(linkId);
            setLinks((prev) => prev.filter((l) => l.id !== linkId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete link");
            return false;
        }
    }, []);

    const toggleLink = useCallback(
        async (link: Link): Promise<Link | null> => {
            return updateLink(link.id, { is_enabled: !link.is_enabled });
        },
        [updateLink]
    );

    const reorderLinks = useCallback(
        async (hubId: string, linkIds: string[]): Promise<boolean> => {
            setError(null);
            try {
                await linksApi.reorder(hubId, linkIds);
                // Update local state with new order
                const reorderedLinks = linkIds
                    .map((id) => links.find((l) => l.id === id))
                    .filter((l): l is Link => l !== undefined);
                setLinks(reorderedLinks);
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reorder links");
                return false;
            }
        },
        [links]
    );

    return {
        links,
        loading,
        error,
        addLink,
        updateLink,
        deleteLink,
        toggleLink,
        reorderLinks,
        refresh: fetchLinks,
    };
}
