"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/50 transition-all group"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-300 ${resolvedTheme === "dark"
                            ? "opacity-0 rotate-90 scale-0"
                            : "opacity-100 rotate-0 scale-100"
                        }`}
                />
                {/* Moon icon */}
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-green-400 transition-all duration-300 ${resolvedTheme === "dark"
                            ? "opacity-100 rotate-0 scale-100"
                            : "opacity-0 -rotate-90 scale-0"
                        }`}
                />
            </div>
        </button>
    );
}

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    const options: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    return (
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            {options.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${theme === value
                            ? "bg-green-500 text-black font-medium"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}
