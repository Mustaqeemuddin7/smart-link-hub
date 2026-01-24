/**
 * Smart Link Hub - API Client
 */
import type {
    User,
    AuthTokens,
    Hub,
    HubCreate,
    HubUpdate,
    HubListResponse,
    Link,
    LinkCreate,
    LinkUpdate,
    LinkListResponse,
    Rule,
    RuleCreate,
    RuleUpdate,
    RuleListResponse,
    AnalyticsSummary,
    LinkPerformance,
    DailyStats,
    PublicHub,
} from "@/types";

// API base URL - uses environment variable with development fallback
const API_BASE = process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:8000/api"
        : "/api");

// ============ Token Management ============
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
        localStorage.setItem("access_token", token);
    } else {
        localStorage.removeItem("access_token");
    }
}

export function getAccessToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== "undefined") {
        return localStorage.getItem("access_token");
    }
    return null;
}

export function setRefreshToken(token: string | null) {
    if (token) {
        localStorage.setItem("refresh_token", token);
    } else {
        localStorage.removeItem("refresh_token");
    }
}

export function getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("refresh_token");
    }
    return null;
}

export function clearTokens() {
    accessToken = null;
    if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
}

// ============ Base Fetch ============
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// ============ Auth API ============
export const authApi = {
    async register(email: string, password: string, name: string): Promise<User> {
        return apiFetch<User>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
        });
    },

    async login(email: string, password: string): Promise<AuthTokens> {
        const tokens = await apiFetch<AuthTokens>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        return tokens;
    },

    async refresh(): Promise<AuthTokens> {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error("No refresh token");
        }
        const tokens = await apiFetch<AuthTokens>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify(refreshToken),
        });
        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        return tokens;
    },

    async me(): Promise<User> {
        return apiFetch<User>("/auth/me");
    },

    logout() {
        clearTokens();
    },
};

// ============ Hubs API ============
export const hubsApi = {
    async list(skip = 0, limit = 20): Promise<HubListResponse> {
        return apiFetch<HubListResponse>(`/hubs?skip=${skip}&limit=${limit}`);
    },

    async get(hubId: string): Promise<Hub> {
        return apiFetch<Hub>(`/hubs/${hubId}`);
    },

    async create(data: HubCreate): Promise<Hub> {
        return apiFetch<Hub>("/hubs", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async update(hubId: string, data: HubUpdate): Promise<Hub> {
        return apiFetch<Hub>(`/hubs/${hubId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async delete(hubId: string): Promise<void> {
        return apiFetch<void>(`/hubs/${hubId}`, {
            method: "DELETE",
        });
    },

    async checkSlug(slug: string): Promise<{ available: boolean; slug: string }> {
        return apiFetch<{ available: boolean; slug: string }>(
            `/hubs/check-slug/${slug}`
        );
    },
};

// ============ Links API ============
export const linksApi = {
    async list(hubId: string): Promise<LinkListResponse> {
        return apiFetch<LinkListResponse>(`/hubs/${hubId}/links`);
    },

    async create(hubId: string, data: LinkCreate): Promise<Link> {
        return apiFetch<Link>(`/hubs/${hubId}/links`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async update(linkId: string, data: LinkUpdate): Promise<Link> {
        return apiFetch<Link>(`/links/${linkId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async delete(linkId: string): Promise<void> {
        return apiFetch<void>(`/links/${linkId}`, {
            method: "DELETE",
        });
    },

    async reorder(hubId: string, linkIds: string[]): Promise<void> {
        return apiFetch<void>(`/hubs/${hubId}/links/reorder`, {
            method: "PUT",
            body: JSON.stringify({ link_ids: linkIds }),
        });
    },
};

// ============ Rules API ============
export const rulesApi = {
    async list(hubId: string): Promise<RuleListResponse> {
        return apiFetch<RuleListResponse>(`/hubs/${hubId}/rules`);
    },

    async create(hubId: string, data: RuleCreate): Promise<Rule> {
        return apiFetch<Rule>(`/hubs/${hubId}/rules`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async update(ruleId: string, data: RuleUpdate): Promise<Rule> {
        return apiFetch<Rule>(`/rules/${ruleId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async delete(ruleId: string): Promise<void> {
        return apiFetch<void>(`/rules/${ruleId}`, {
            method: "DELETE",
        });
    },

    async getPresets(): Promise<{ presets: Array<{ id: string; name: string; description: string; rule_type: string; condition: Record<string, unknown>; action: Record<string, unknown> }> }> {
        return apiFetch<{ presets: Array<{ id: string; name: string; description: string; rule_type: string; condition: Record<string, unknown>; action: Record<string, unknown> }> }>("/rules/presets");
    },
};

// ============ Analytics API ============
export const analyticsApi = {
    async getSummary(hubId: string, days = 30): Promise<AnalyticsSummary> {
        return apiFetch<AnalyticsSummary>(`/analytics/hubs/${hubId}?days=${days}`);
    },

    async getLinkPerformance(
        hubId: string,
        days = 30
    ): Promise<{ links: LinkPerformance[]; hub_total_visits: number }> {
        return apiFetch<{ links: LinkPerformance[]; hub_total_visits: number }>(
            `/analytics/hubs/${hubId}/links?days=${days}`
        );
    },

    async getDailyStats(
        hubId: string,
        days = 30
    ): Promise<{ stats: DailyStats[]; period_days: number }> {
        return apiFetch<{ stats: DailyStats[]; period_days: number }>(
            `/analytics/hubs/${hubId}/daily?days=${days}`
        );
    },

    async getTopLinks(
        hubId: string,
        days = 30,
        limit = 5
    ): Promise<{ top_links: LinkPerformance[]; bottom_links: LinkPerformance[] }> {
        return apiFetch<{ top_links: LinkPerformance[]; bottom_links: LinkPerformance[] }>(
            `/analytics/hubs/${hubId}/top-links?days=${days}&limit=${limit}`
        );
    },
};

// ============ Public API ============
export const publicApi = {
    async getHub(slug: string): Promise<PublicHub> {
        return apiFetch<PublicHub>(`/public/${slug}`);
    },

    async trackVisit(slug: string): Promise<{ recorded: boolean; message: string }> {
        return apiFetch<{ recorded: boolean; message: string }>(`/track/visit/${slug}`, {
            method: "POST",
        });
    },

    async trackClick(linkId: string): Promise<{ recorded: boolean; message: string }> {
        return apiFetch<{ recorded: boolean; message: string }>(`/track/click/${linkId}`, {
            method: "POST",
        });
    },
};
