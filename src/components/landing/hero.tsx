"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight } from "lucide-react";

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

            <div className="container mx-auto px-4 relative">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                    <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1.5 text-sm font-medium border-green-200 bg-green-50 text-green-700 gap-2"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        La plateforme AgriTech #1 au Maroc
                    </Badge>
                </div>

                {/* Headline */}
                <div className="text-center max-w-4xl mx-auto mb-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5">
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
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                        Marketplace agricole, contrats intelligents, suivi satellite en temps
                        réel. Tout ce dont vous avez besoin pour faire prospérer votre
                        activité agricole.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white text-base rounded-full shadow-lg shadow-green-200"
                        >
                            Commencer gratuitement
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="#demo">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 px-8 border-zinc-200 text-base rounded-full gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Voir la démo
                        </Button>
                    </Link>
                </div>

                {/* Dashboard screenshot / Video placeholder */}
                <div className="relative max-w-6xl mx-auto" id="demo">
                    {/* Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-green-100/60 via-green-50/30 to-transparent rounded-3xl blur-2xl pointer-events-none" />

                    {/* Screenshot Frame */}
                    <div className="relative rounded-t-2xl border border-b-0 border-zinc-200 bg-white shadow-2xl overflow-hidden">
                        {/* Browser chrome bar */}
                        <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-zinc-50">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="flex-1 mx-4">
                                <div className="bg-white border border-zinc-200 rounded-full h-6 w-full max-w-xs mx-auto flex items-center px-3">
                                    <span className="text-xs text-zinc-400">agri-mar.ma/dashboard</span>
                                </div>
                            </div>
                        </div>

                        {/* Video placeholder */}
                        <div className="relative aspect-[16/9] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 group cursor-pointer">
                            {/* Dashboard mockup overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20 backdrop-blur-sm"
                                        style={{ background: "rgba(22,163,74,0.8)" }}
                                    >
                                        <Play className="w-8 h-8 fill-white text-white translate-x-0.5" />
                                    </div>
                                    <p className="text-sm text-white/60 font-medium">
                                        Insérez votre vidéo de présentation ici
                                    </p>
                                    <p className="text-xs text-white/40 mt-1">
                                        Remplacez ce placeholder par votre URL vidéo dans{" "}
                                        <code className="text-green-400">hero.tsx</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
