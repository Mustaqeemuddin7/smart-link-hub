"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    Link2,
    ExternalLink,
    Edit,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Loader2,
    BarChart3,
    Settings,
    Copy,
    Check,
    QrCode,
    Download,
    LinkIcon,
} from "lucide-react";
import { hubsApi, linksApi } from "@/lib/api";
import type { Hub, Link as LinkType, LinkCreate } from "@/types";
import { getPublicHubUrl, copyToClipboard, formatNumber } from "@/lib/utils";

export default function HubDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hubId = params.hubId as string;

    const [hub, setHub] = useState<Hub | null>(null);
    const [links, setLinks] = useState<LinkType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // QR Code state
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    // Short URL state
    const [shortUrl, setShortUrl] = useState<{ code: string; url: string } | null>(null);
    const [shortUrlLoading, setShortUrlLoading] = useState(false);
    const [shortUrlCopied, setShortUrlCopied] = useState(false);

    // New link form
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [newLinkIcon, setNewLinkIcon] = useState("");
    const [addingLink, setAddingLink] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [hubData, linksData] = await Promise.all([
                hubsApi.get(hubId),
                linksApi.list(hubId),
            ]);
            setHub(hubData);
            setLinks(linksData.links);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load hub");
        } finally {
            setLoading(false);
        }
    }, [hubId]);

    // Fetch QR code
    const fetchQRCode = async () => {
        setQrLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/hubs/${hubId}/qrcode/base64`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setQrCode(data.qr_code);
            }
        } catch (err) {
            console.error("Failed to fetch QR code:", err);
        } finally {
            setQrLoading(false);
        }
    };

    // Fetch existing short URL
    const fetchShortUrl = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/hubs/${hubId}/shorten`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setShortUrl({ code: data.short_code, url: data.full_short_url });
            }
        } catch (err) {
            // No short URL exists, that's OK
        }
    };

    // Create short URL
    const createShortUrl = async () => {
        setShortUrlLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/hubs/${hubId}/shorten`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setShortUrl({ code: data.short_code, url: data.full_short_url });
            }
        } catch (err) {
            console.error("Failed to create short URL:", err);
        } finally {
            setShortUrlLoading(false);
        }
    };

    // Copy short URL
    const handleCopyShortUrl = async () => {
        if (shortUrl) {
            const success = await copyToClipboard(shortUrl.url);
            if (success) {
                setShortUrlCopied(true);
                setTimeout(() => setShortUrlCopied(false), 2000);
            }
        }
    };

    // Download QR code
    const downloadQRCode = () => {
        if (!qrCode) return;
        const link = document.createElement("a");
        link.href = qrCode;
        link.download = `${hub?.slug || "qrcode"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (hubId) {
            fetchQRCode();
            fetchShortUrl();
        }
    }, [hubId]);

    const handleCopyUrl = async () => {
        if (hub) {
            const success = await copyToClipboard(getPublicHubUrl(hub.slug));
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };


    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingLink(true);

        try {
            const link = await linksApi.create(hubId, {
                title: newLinkTitle,
                url: newLinkUrl,
                icon: newLinkIcon || undefined,
            });
            setLinks((prev) => [...prev, link]);
            setNewLinkTitle("");
            setNewLinkUrl("");
            setNewLinkIcon("");
            setShowAddLink(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add link");
        } finally {
            setAddingLink(false);
        }
    };

    const handleToggleLink = async (link: LinkType) => {
        try {
            const updated = await linksApi.update(link.id, {
                is_enabled: !link.is_enabled,
            });
            setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update link");
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        if (!confirm("Delete this link?")) return;

        try {
            await linksApi.delete(linkId);
            setLinks((prev) => prev.filter((l) => l.id !== linkId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete link");
        }
    };

    const handleDeleteHub = async () => {
        if (!confirm("Delete this hub and all its links? This cannot be undone.")) return;

        try {
            await hubsApi.delete(hubId);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete hub");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    if (error || !hub) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Hub not found"}</p>
                    <Link href="/dashboard" className="text-green-400 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Hub Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 mb-6"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold">{hub.title}</h1>
                                <div
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${hub.is_active
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-gray-500/20 text-gray-400"
                                        }`}
                                >
                                    {hub.is_active ? "Active" : "Inactive"}
                                </div>
                            </div>
                            {hub.description && (
                                <p className="text-gray-400 mb-4">{hub.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Link2 className="w-4 h-4" />
                                    /{hub.slug}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Eye className="w-4 h-4" />
                                    {formatNumber(hub.total_visits || 0)} visits
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyUrl}
                                className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                <span className="text-sm">{copied ? "Copied!" : "Copy URL"}</span>
                            </button>
                            <a
                                href={getPublicHubUrl(hub.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm">View Public</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                        <Link
                            href={`/dashboard/hubs/${hubId}/rules`}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Rules
                        </Link>
                        <Link
                            href={`/dashboard/hubs/${hubId}/analytics`}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </Link>
                        <button
                            onClick={handleDeleteHub}
                            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Hub
                        </button>
                    </div>
                </motion.div>

                {/* QR Code and Short URL Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* QR Code Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <QrCode className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold">QR Code</h3>
                        </div>

                        {qrLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                            </div>
                        ) : qrCode ? (
                            <div className="flex flex-col items-center">
                                <img
                                    src={qrCode}
                                    alt="Hub QR Code"
                                    className="w-40 h-40 mb-4 rounded-lg bg-white p-2"
                                />
                                <button
                                    onClick={downloadQRCode}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download QR
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Failed to load QR code
                            </div>
                        )}
                    </motion.div>

                    {/* Short URL Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <LinkIcon className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold">Short URL</h3>
                        </div>

                        {shortUrl ? (
                            <div className="space-y-4">
                                <div className="bg-black/50 border border-white/10 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 mb-1">Your short URL</p>
                                    <p className="text-lg font-mono text-green-400 break-all">
                                        {shortUrl.url}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyShortUrl}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors w-full justify-center"
                                >
                                    {shortUrlCopied ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Short URL
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">
                                    Create a short URL for easy sharing
                                </p>
                                <button
                                    onClick={createShortUrl}
                                    disabled={shortUrlLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors mx-auto disabled:opacity-50"
                                >
                                    {shortUrlLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LinkIcon className="w-4 h-4" />
                                    )}
                                    Create Short URL
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Links Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Links ({links.length})</h2>
                    <button
                        onClick={() => setShowAddLink(true)}
                        className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Link
                    </button>
                </div>

                {/* Add Link Form */}
                {showAddLink && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 mb-6"
                    >
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Title</label>
                                    <input
                                        type="text"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                        placeholder="My Website"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Icon (emoji)</label>
                                    <input
                                        type="text"
                                        value={newLinkIcon}
                                        onChange={(e) => setNewLinkIcon(e.target.value)}
                                        placeholder="🔗"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">URL</label>
                                <input
                                    type="url"
                                    value={newLinkUrl}
                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddLink(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingLink}
                                    className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors disabled:opacity-50"
                                >
                                    {addingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Link
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Links List */}
                {links.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No links yet. Add your first link above.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {links.map((link, index) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card p-4 ${!link.is_enabled && "opacity-50"}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="cursor-grab text-gray-600 hover:text-gray-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    {link.icon && <span className="text-2xl">{link.icon}</span>}

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{link.title}</h3>
                                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{formatNumber(link.click_count)} clicks</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleLink(link)}
                                            className={`p-2 rounded-lg transition-colors ${link.is_enabled
                                                ? "text-green-400 hover:bg-green-500/10"
                                                : "text-gray-500 hover:bg-white/5"
                                                }`}
                                            title={link.is_enabled ? "Disable" : "Enable"}
                                        >
                                            {link.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLink(link.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
