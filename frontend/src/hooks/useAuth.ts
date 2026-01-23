"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authApi, getAccessToken, clearTokens } from "@/lib/api";

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await authApi.me();
                setUser(userData);
            } catch (err) {
                clearTokens();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            await authApi.login(email, password);
            const userData = await authApi.me();
            setUser(userData);
            router.push("/dashboard");
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    }, [router]);

    const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            await authApi.register(email, password, name);
            // Auto-login after registration
            return await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
            return false;
        } finally {
            setLoading(false);
        }
    }, [login]);

    const logout = useCallback(() => {
        authApi.logout();
        setUser(null);
        router.push("/login");
    }, [router]);

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };
}
