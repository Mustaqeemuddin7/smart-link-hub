/**
 * Smart Link Hub - TypeScript Type Definitions
 */

// ============ User Types ============
export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

// ============ Hub Types ============
export interface ThemeConfig {
    background: string;
    accent: string;
    font?: string;
}

export interface Hub {
    id: string;
    title: string;
    description?: string;
    slug: string;
    theme: ThemeConfig;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    link_count?: number;
    total_visits?: number;
}

export interface HubCreate {
    title: string;
    description?: string;
    slug: string;
    theme?: ThemeConfig;
}

export interface HubUpdate {
    title?: string;
    description?: string;
    slug?: string;
    theme?: ThemeConfig;
    is_active?: boolean;
}

// ============ Link Types ============
export interface Link {
    id: string;
    hub_id: string;
    title: string;
    url: string;
    icon?: string;
    position: number;
    is_enabled: boolean;
    click_count: number;
    created_at: string;
    updated_at: string;
}

export interface LinkCreate {
    title: string;
    url: string;
    icon?: string;
    position?: number;
    is_enabled?: boolean;
}

export interface LinkUpdate {
    title?: string;
    url?: string;
    icon?: string;
    position?: number;
    is_enabled?: boolean;
}

export interface ProcessedLink {
    id: string;
    title: string;
    url: string;
    icon?: string;
    is_highlighted: boolean;
}

// ============ Rule Types ============
export type RuleType = "time" | "device" | "location" | "performance";
export type ActionType = "show" | "hide" | "set_priority";

export interface TimeCondition {
    start_hour: number;
    end_hour: number;
    timezone?: string;
}

export interface DeviceCondition {
    devices: ("mobile" | "tablet" | "desktop")[];
}

export interface LocationCondition {
    countries: string[];
}

export interface PerformanceCondition {
    min_ctr?: number;
    min_clicks?: number;
}

export interface RuleAction {
    action: ActionType;
    priority_boost?: number;
    priority?: number;
    highlight?: boolean;
}

export interface Rule {
    id: string;
    hub_id: string;
    name: string;
    rule_type: RuleType;
    condition: Record<string, any>;
    action: Record<string, any>;
    priority: number;
    is_active: boolean;
    target_link_ids?: string[];
    created_at: string;
    updated_at: string;
}

export interface RuleCreate {
    name: string;
    rule_type: RuleType;
    condition: Record<string, any>;
    action: Record<string, any>;
    priority?: number;
    is_active?: boolean;
    target_link_ids?: string[];
}

export interface RuleUpdate {
    name?: string;
    rule_type?: RuleType;
    condition?: Record<string, any>;
    action?: Record<string, any>;
    priority?: number;
    is_active?: boolean;
    target_link_ids?: string[];
}

// ============ Analytics Types ============
export interface AnalyticsSummary {
    total_visits: number;
    total_clicks: number;
    ctr: number;
    device_breakdown: Record<string, number>;
    country_breakdown: Record<string, number>;
    period_days: number;
}

export interface LinkPerformance {
    link_id: string;
    title: string;
    url: string;
    total_clicks: number;
    period_clicks: number;
    ctr: number;
}

export interface DailyStats {
    date: string;
    visits: number;
    clicks: number;
}

// ============ Public Hub Types ============
export interface PublicHub {
    title: string;
    description?: string;
    theme: ThemeConfig;
    links: ProcessedLink[];
}

// ============ API Response Types ============
export interface ApiError {
    detail: string;
}

export interface ListResponse<T> {
    items: T[];
    total: number;
}

export interface HubListResponse {
    hubs: Hub[];
    total: number;
}

export interface LinkListResponse {
    links: Link[];
    total: number;
}

export interface RuleListResponse {
    rules: Rule[];
    total: number;
}
