"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
    return (
        <section className="relative pt-28 pb-0 overflow-hidden bg-white">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/4 -left-20 w-80 h-80 bg-green-200 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-[120px]"
                />
            </div>

            <div className="container mx-auto px-4 relative">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center mb-6"
                >
                    <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1.5 text-sm font-medium border-green-200 bg-green-50 text-green-700 gap-2 shadow-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        La plateforme AgriTech #1 au Maroc
                    </Badge>
                </motion.div>

                {/* Headline */}
                <div className="text-center max-w-4xl mx-auto mb-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5"
                    >
                        Connectez Agriculteurs
                        <br />
                        <span
                            className="text-transparent bg-clip-text"
                            style={{
                                backgroundImage: "linear-gradient(135deg, #16a34a, #15803d, #166534)",
                            }}
                        >
                            et Entreprises.
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        Marketplace agricole, contrats intelligents, suivi satellite en temps
                        réel. Tout ce dont vous avez besoin pour faire prospérer votre
                        activité agricole.
                    </motion.p>
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
                >
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="group h-12 px-8 bg-green-600 hover:bg-green-700 text-white text-base rounded-full shadow-lg shadow-green-200 transition-all active:scale-95"
                        >
                            Commencer gratuitement
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="#demo-booking">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 px-8 border-zinc-200 text-base rounded-full gap-2 transition-all hover:bg-zinc-50 active:scale-95"
                        >
                            <Calendar className="w-4 h-4" />
                            Session de Feedback
                        </Button>
                    </Link>
                </motion.div>

                {/* Dashboard screenshot / Video integration */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="relative max-w-6xl mx-auto"
                    id="demo"
                >
                    {/* Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-green-100/60 via-green-50/30 to-transparent rounded-3xl blur-2xl pointer-events-none" />

                    {/* Screenshot Frame */}
                    <div className="relative rounded-t-2xl border border-b-0 border-zinc-200 bg-white shadow-2xl overflow-hidden min-h-[400px]">
                        {/* Browser chrome bar */}
                        <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-zinc-50">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="flex-1 mx-4">
                                <div className="bg-white border border-zinc-200 rounded-full h-6 w-full max-w-xs mx-auto flex items-center px-3">
                                    <span className="text-xs text-zinc-400 font-medium">agri-mar.ma/platform</span>
                                </div>
                            </div>
                        </div>

                        {/* Direct Video Embed */}
                        <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
                            <iframe
                                src="https://www.loom.com/embed/55f7b15ce0bb4c05961d5eaeff891ef0?hide_owner=true&hide_share=true&hide_title=true&hide_embed_status=true"
                                className="w-full h-full border-0"
                                allowFullScreen
                                allow="autoplay; fullscreen"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
