"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, BarChart3, Sparkles, Zap, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-green-500" />
                            <span className="text-xl font-bold gradient-text">Smart Link Hub</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Next-Gen Link Platform</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        Your Links,{" "}
                        <span className="gradient-text">Smarter</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Create smart link hubs with dynamic rules. Show the right links to the right audience at the right time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 bg-green-500 text-black px-8 py-4 rounded-xl font-semibold hover:bg-green-400 transition-all glow-green-hover"
                        >
                            Create Your Hub
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="flex items-center gap-2 border border-white/20 px-8 py-4 rounded-xl font-medium hover:bg-white/5 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Smart Features</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            More than just a link-in-bio. A complete platform for managing and optimizing your online presence.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        {[
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Rule-Based Display",
                                description: "Show links based on time, device, location, or performance. No code needed.",
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8" />,
                                title: "Real-Time Analytics",
                                description: "Track visits, clicks, and CTR. See what's working and optimize.",
                            },
                            {
                                icon: <Sparkles className="w-8 h-8" />,
                                title: "Smart Prioritization",
                                description: "Auto-boost high-performing links. Let the algorithm do the work.",
                            },
                            {
                                icon: <Link2 className="w-8 h-8" />,
                                title: "Custom Themes",
                                description: "Make your hub match your brand with customizable themes.",
                            },
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Device Detection",
                                description: "Show mobile users your app, desktop users your portfolio.",
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8" />,
                                title: "Geo-Targeting",
                                description: "Different payment links for different countries. Smart and seamless.",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 hover:border-green-500/40 transition-colors"
                            >
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 glow-green"
                    >
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Smart?</h2>
                        <p className="text-gray-400 mb-8">
                            Join thousands of creators using Smart Link Hub to optimize their online presence.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-green-500 text-black px-8 py-4 rounded-xl font-semibold hover:bg-green-400 transition-all"
                        >
                            Start for Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <p>© 2024 Smart Link Hub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
