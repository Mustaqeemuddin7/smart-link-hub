"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FieldErrors {
    name?: string;
    email?: string;
    password?: string[];
    confirmPassword?: string;
}

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { register, loading, error } = useAuth();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const validatePassword = (pwd: string): string[] => {
        const errors: string[] = [];

        if (pwd.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(pwd)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(pwd)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        if (!/\d/.test(pwd)) {
            errors.push("Password must contain at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
        }

        return errors;
    };

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};

        // Name validation
        if (!name.trim()) {
            errors.name = "Name is required";
        } else if (name.trim().length > 100) {
            errors.name = "Name must be less than 100 characters";
        }

        // Email validation
        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }

        // Password validation
        const pwdErrors = validatePassword(password);
        if (pwdErrors.length > 0) {
            errors.password = pwdErrors;
        }

        // Confirm password validation
        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field: keyof typeof touched) => {
        setTouched({ ...touched, [field]: true });

        // Validate specific field on blur
        const errors: FieldErrors = { ...fieldErrors };

        if (field === 'password') {
            const pwdErrors = validatePassword(password);
            if (pwdErrors.length > 0) {
                errors.password = pwdErrors;
            } else {
                delete errors.password;
            }

            // Also check confirm password if it's been touched
            if (touched.confirmPassword && confirmPassword) {
                if (password !== confirmPassword) {
                    errors.confirmPassword = "Passwords do not match";
                } else {
                    delete errors.confirmPassword;
                }
            }
        } else if (field === 'confirmPassword') {
            if (password !== confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            } else {
                delete errors.confirmPassword;
            }
        } else if (field === 'name') {
            if (!name.trim()) {
                errors.name = "Name is required";
            } else {
                delete errors.name;
            }
        } else if (field === 'email') {
            if (!email.trim()) {
                errors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = "Please enter a valid email address";
            } else {
                delete errors.email;
            }
        }

        setFieldErrors(errors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        if (!validateForm()) {
            return;
        }

        await register(email, password, name);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Link2 className="w-10 h-10 text-green-500" />
                        <span className="text-2xl font-bold gradient-text">Smart Link Hub</span>
                    </Link>
                </div>

                {/* Register Form */}
                <div className="glass-card p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
                    <p className="text-gray-400 text-center mb-8">
                        Get started with your smart link hub
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-300">
                                Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Your Name"
                                    className={`w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors ${touched.name && fieldErrors.name ? 'border-red-500/50' : 'border-white/10'
                                        }`}
                                    required
                                />
                            </div>
                            {touched.name && fieldErrors.name && (
                                <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="you@example.com"
                                    className={`w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors ${touched.email && fieldErrors.email ? 'border-red-500/50' : 'border-white/10'
                                        }`}
                                    required
                                />
                            </div>
                            {touched.email && fieldErrors.email && (
                                <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="••••••••"
                                    className={`w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors ${touched.password && fieldErrors.password ? 'border-red-500/50' : 'border-white/10'
                                        }`}
                                    required
                                />
                            </div>
                            {touched.password && fieldErrors.password && (
                                <div className="space-y-1 mt-1">
                                    {fieldErrors.password.map((error, index) => (
                                        <p key={index} className="text-red-400 text-xs">• {error}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    placeholder="••••••••"
                                    className={`w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors ${touched.confirmPassword && fieldErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                                        }`}
                                    required
                                />
                            </div>
                            {touched.confirmPassword && fieldErrors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-green-400 hover:text-green-300 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
