"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    Settings,
    Clock,
    Smartphone,
    Globe,
    TrendingUp,
    Trash2,
    Loader2,
    Power,
    Sparkles,
} from "lucide-react";
import { rulesApi, linksApi } from "@/lib/api";
import type { Rule, RuleCreate, Link as LinkType } from "@/types";

const RULE_TYPES = [
    { id: "time", name: "Time-Based", icon: Clock, description: "Show links during specific hours" },
    { id: "device", name: "Device-Based", icon: Smartphone, description: "Target mobile, tablet, or desktop" },
    { id: "location", name: "Location-Based", icon: Globe, description: "Show links for specific countries" },
    { id: "performance", name: "Performance-Based", icon: TrendingUp, description: "Boost high-performing links" },
];

const DEVICE_OPTIONS = ["mobile", "tablet", "desktop"];
const COUNTRY_OPTIONS = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
];

export default function RulesPage() {
    const params = useParams();
    const hubId = params.hubId as string;

    const [rules, setRules] = useState<Rule[]>([]);
    const [links, setLinks] = useState<LinkType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [ruleName, setRuleName] = useState("");
    const [ruleType, setRuleType] = useState<string>("time");
    const [startHour, setStartHour] = useState(9);
    const [endHour, setEndHour] = useState(18);
    const [devices, setDevices] = useState<string[]>(["mobile"]);
    const [countries, setCountries] = useState<string[]>(["IN"]);
    const [minCtr, setMinCtr] = useState(5);
    const [priorityBoost, setPriorityBoost] = useState(10);
    const [highlight, setHighlight] = useState(false);
    const [targetLinkIds, setTargetLinkIds] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [rulesData, linksData] = await Promise.all([
                rulesApi.list(hubId),
                linksApi.list(hubId),
            ]);
            setRules(rulesData.rules);
            setLinks(linksData.links);
        } catch (err) {
            console.error("Failed to load rules:", err);
        } finally {
            setLoading(false);
        }
    }, [hubId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateRule = async () => {
        setSaving(true);
        try {
            let condition: Record<string, any> = {};
            if (ruleType === "time") {
                condition = { start_hour: startHour, end_hour: endHour };
            } else if (ruleType === "device") {
                condition = { devices };
            } else if (ruleType === "location") {
                condition = { countries };
            } else if (ruleType === "performance") {
                condition = { min_ctr: minCtr };
            }

            const ruleData: RuleCreate = {
                name: ruleName,
                rule_type: ruleType as any,
                condition,
                action: {
                    action: "show",
                    priority_boost: priorityBoost,
                    highlight,
                },
                priority: 10,
                is_active: true,
                target_link_ids: targetLinkIds.length > 0 ? targetLinkIds : undefined,
            };

            const newRule = await rulesApi.create(hubId, ruleData);
            setRules([newRule, ...rules]);
            setShowForm(false);
            resetForm();
        } catch (err) {
            console.error("Failed to create rule:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm("Delete this rule?")) return;
        try {
            await rulesApi.delete(ruleId);
            setRules(rules.filter((r) => r.id !== ruleId));
        } catch (err) {
            console.error("Failed to delete rule:", err);
        }
    };

    const handleToggleRule = async (rule: Rule) => {
        try {
            const updated = await rulesApi.update(rule.id, { is_active: !rule.is_active });
            setRules(rules.map((r) => (r.id === rule.id ? updated : r)));
        } catch (err) {
            console.error("Failed to toggle rule:", err);
        }
    };

    const resetForm = () => {
        setRuleName("");
        setRuleType("time");
        setStartHour(9);
        setEndHour(18);
        setDevices(["mobile"]);
        setCountries(["IN"]);
        setMinCtr(5);
        setPriorityBoost(10);
        setHighlight(false);
        setTargetLinkIds([]);
    };

    const getRuleIcon = (type: string) => {
        const ruleTypeDef = RULE_TYPES.find((t) => t.id === type);
        return ruleTypeDef ? ruleTypeDef.icon : Settings;
    };

    const getRuleDescription = (rule: Rule) => {
        if (rule.rule_type === "time") {
            return `Active from ${rule.condition.start_hour}:00 to ${rule.condition.end_hour}:00`;
        } else if (rule.rule_type === "device") {
            return `Targets: ${rule.condition.devices?.join(", ") || "all"}`;
        } else if (rule.rule_type === "location") {
            return `Countries: ${rule.condition.countries?.join(", ") || "all"}`;
        } else if (rule.rule_type === "performance") {
            return `Min CTR: ${rule.condition.min_ctr}%`;
        }
        return "";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <Link
                    href={`/dashboard/hubs/${hubId}`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hub
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Settings className="w-6 h-6 text-green-500" />
                            Smart Rules
                        </h1>
                        <p className="text-gray-400 mt-1">Configure when and how links appear</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Rule
                    </button>
                </div>

                {/* Rule Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 mb-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">Create New Rule</h3>

                        <div className="space-y-4">
                            {/* Rule Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1 block">Rule Name</label>
                                <input
                                    type="text"
                                    value={ruleName}
                                    onChange={(e) => setRuleName(e.target.value)}
                                    placeholder="e.g., Business Hours Only"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>

                            {/* Rule Type */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Rule Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {RULE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setRuleType(type.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${ruleType === type.id
                                                    ? "border-green-500 bg-green-500/10"
                                                    : "border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <type.icon className="w-4 h-4 text-green-500" />
                                                <span className="font-medium">{type.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Condition Fields */}
                            {ruleType === "time" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Start Hour</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={startHour}
                                            onChange={(e) => setStartHour(Number(e.target.value))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">End Hour</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={endHour}
                                            onChange={(e) => setEndHour(Number(e.target.value))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {ruleType === "device" && (
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Target Devices</label>
                                    <div className="flex gap-2">
                                        {DEVICE_OPTIONS.map((device) => (
                                            <button
                                                key={device}
                                                onClick={() =>
                                                    setDevices(
                                                        devices.includes(device)
                                                            ? devices.filter((d) => d !== device)
                                                            : [...devices, device]
                                                    )
                                                }
                                                className={`px-4 py-2 rounded-lg capitalize ${devices.includes(device)
                                                        ? "bg-green-500 text-black"
                                                        : "bg-white/5 text-gray-400"
                                                    }`}
                                            >
                                                {device}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ruleType === "location" && (
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Target Countries</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COUNTRY_OPTIONS.map((country) => (
                                            <button
                                                key={country.code}
                                                onClick={() =>
                                                    setCountries(
                                                        countries.includes(country.code)
                                                            ? countries.filter((c) => c !== country.code)
                                                            : [...countries, country.code]
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-sm ${countries.includes(country.code)
                                                        ? "bg-green-500 text-black"
                                                        : "bg-white/5 text-gray-400"
                                                    }`}
                                            >
                                                {country.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ruleType === "performance" && (
                                <div>
                                    <label className="text-sm text-gray-400">Minimum CTR (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={minCtr}
                                        onChange={(e) => setMinCtr(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            )}

                            {/* Action Settings */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <label className="text-sm text-gray-400">Priority Boost</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={priorityBoost}
                                        onChange={(e) => setPriorityBoost(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="highlight"
                                        checked={highlight}
                                        onChange={(e) => setHighlight(e.target.checked)}
                                        className="w-4 h-4 accent-green-500"
                                    />
                                    <label htmlFor="highlight" className="text-sm text-gray-400">
                                        Highlight matching links
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRule}
                                    disabled={saving || !ruleName}
                                    className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Rule
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Rules List */}
                {rules.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No rules yet. Add rules to control when links appear.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rules.map((rule, index) => {
                            const IconComponent = getRuleIcon(rule.rule_type);
                            return (
                                <motion.div
                                    key={rule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`glass-card p-4 ${!rule.is_active && "opacity-50"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                            <IconComponent className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{rule.name}</h3>
                                                {rule.action.highlight && (
                                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{getRuleDescription(rule)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">+{rule.action.priority_boost || 0}</span>
                                            <button
                                                onClick={() => handleToggleRule(rule)}
                                                className={`p-2 rounded-lg transition-colors ${rule.is_active
                                                        ? "text-green-400 hover:bg-green-500/10"
                                                        : "text-gray-500 hover:bg-white/5"
                                                    }`}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
