"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "dark" | "light";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

    // Get system preference
    const getSystemTheme = (): "dark" | "light" => {
        if (typeof window === "undefined") return "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    // Apply theme to document
    const applyTheme = (resolved: "dark" | "light") => {
        if (typeof document === "undefined") return;
        document.documentElement.setAttribute("data-theme", resolved);
        setResolvedTheme(resolved);
    };

    // Set theme and persist
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);

        if (newTheme === "system") {
            applyTheme(getSystemTheme());
        } else {
            applyTheme(newTheme);
        }
    };

    // Toggle between dark and light
    const toggleTheme = () => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    // Initialize theme on mount
    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        const initial = stored || "system";
        setThemeState(initial);

        if (initial === "system") {
            applyTheme(getSystemTheme());
        } else {
            applyTheme(initial);
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                applyTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
