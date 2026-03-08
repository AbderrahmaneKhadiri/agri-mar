"use client";

import { Badge } from "@/components/ui/badge";
import {
    Globe as GlobeIcon,
    FileSignature,
    Sprout,
    BarChart3,
    MessageSquare,
    ShieldCheck,
    MapPin,
    Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";

const features = [
    {
        icon: GlobeIcon,
        tag: "Marketplace",
        title: "Votre marché agricole en ligne",
        description:
            "Publiez vos offres et connectez-vous à des centaines d'acheteurs qualifiés. Recevez des propositions directement sur votre tableau de bord.",
        stat: "+300% de visibilité",
        preview: "bg-gradient-to-br from-green-50 to-emerald-100",
        iconBg: "bg-green-100",
        iconColor: "text-green-700",
    },
    {
        icon: FileSignature,
        tag: "Contrats",
        title: "Contrats intelligents automatisés",
        description:
            "Signatures électroniques, suivi des étapes, alertes automatiques. Divisez par 2 le temps de gestion de vos contrats.",
        stat: "50% de gain de temps",
        preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-700",
    },
    {
        icon: Sprout,
        tag: "Satellite",
        title: "Suivi satellite de vos cultures",
        description:
            "Indice NDVI, humidité du sol, météo intégrée. Prenez de meilleures décisions grâce aux données en temps réel.",
        stat: "NDVI & NDWI live",
        preview: "bg-gradient-to-br from-emerald-50 to-teal-100",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-700",
    },
    {
        icon: BarChart3,
        tag: "Analytique",
        title: "Tableau de bord analytique",
        description:
            "Visualisez revenus, dépenses et performance de vos champs en un seul endroit. Exportez vos rapports en un clic.",
        stat: "Vision 360°",
        preview: "bg-gradient-to-br from-amber-50 to-orange-100",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-700",
    },
    {
        icon: MessageSquare,
        tag: "Messagerie",
        title: "Communication directe & sécurisée",
        description:
            "Discutez directement avec vos partenaires et clients. Zéro intermédiaire, 100% traçable.",
        stat: "Réponse < 2 min",
        preview: "bg-gradient-to-br from-violet-50 to-purple-100",
        iconBg: "bg-violet-100",
        iconColor: "text-violet-700",
    },
    {
        icon: ShieldCheck,
        tag: "Confiance",
        title: "Réseau de partenaires vérifiés",
        description:
            "Chaque profil est vérifié. Consultez les évaluations, l'historique et le bilan de collaboration.",
        stat: "100% vérifié",
        preview: "bg-gradient-to-br from-zinc-50 to-slate-100",
        iconBg: "bg-zinc-100",
        iconColor: "text-zinc-700",
    },
];

export function Features() {
    return (
        <section id="features" className="py-28 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-20">
                    <p className="text-green-600 font-semibold text-sm tracking-widest uppercase mb-4">
                        Fonctionnalités
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
                        Des milliers de fonctionnalités
                        <br />
                        <span className="text-zinc-300">pour votre agriculture.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                        Des outils pensés pour le terrain. Simples à utiliser, puissants dans les résultats.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isSatellite = index === 2;
                        const isLarge = index === 0 || isSatellite;

                        return (
                            <div
                                key={feature.title}
                                className={`group rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isLarge ? "lg:col-span-2" : ""
                                    }`}
                            >
                                {/* Visual preview area */}
                                <div className={`relative h-64 overflow-hidden ${isSatellite ? "bg-zinc-50" : feature.preview} flex items-center justify-center`}>
                                    {isSatellite ? (
                                        <div className="w-full h-full">
                                            <SkeletonSatellite />
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center shadow-sm`}>
                                                <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                                            </div>
                                            <div className={`absolute top-4 right-4 w-20 h-20 rounded-full ${feature.iconBg} opacity-40`} />
                                            <div className={`absolute bottom-4 left-8 w-10 h-10 rounded-full ${feature.iconBg} opacity-30`} />
                                        </>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 bg-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="secondary" className="text-xs rounded-full px-3">
                                            {feature.tag}
                                        </Badge>
                                        <span className="text-sm font-semibold text-green-600">{feature.stat}</span>
                                    </div>
                                    <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function SkeletonSatellite() {
    return (
        <div className="relative h-full w-full flex items-center justify-center bg-zinc-50/50 p-4">
            {/* Background soft glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-100/40 rounded-full blur-3xl -z-10 animate-pulse" />

            <div className="relative flex flex-row items-center justify-center gap-4 w-full h-full max-w-2xl">
                {/* Globe Part */}
                <div className="relative hidden lg:flex flex-col items-center justify-center w-1/3">
                    <Globe className="opacity-80 scale-75" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-green-500/10 rounded-full animate-ping pointer-events-none" />
                </div>

                {/* Map Part */}
                <div className="relative w-full lg:w-2/3 max-w-[320px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white bg-white">
                    <img
                        src="/landing/satellite-map-v2.png"
                        alt="Satellite analysis"
                        className="w-full h-full object-cover"
                    />

                    {/* Polygon Overlay */}
                    <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 400 300">
                        <motion.path
                            d="M242,194 L290,194 L284,300 L234,300 Z"
                            stroke="#22c55e"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="rgba(34,197,94,0.2)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                        />
                        {/* Pulsing corner markers */}
                        {[[242, 194], [290, 194], [284, 300], [234, 300]].map(([x, y], i) => (
                            <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="5"
                                fill="white"
                                stroke="#22c55e"
                                strokeWidth="2.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        ))}
                    </svg>

                    {/* Data Overlays */}
                    <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1.5 transform scale-75 origin-bottom-left">
                        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white p-2 flex items-center gap-2 min-w-[120px]">
                            <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center border border-green-100">
                                <MapPin className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-900 leading-none">1.84 Ha</span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white p-2 flex items-center gap-2 min-w-[120px]">
                            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Zap className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black text-green-600 leading-none">0.86 NDVI</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Globe({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 400 * 2,
            height: 400 * 2,
            phi: 0,
            theta: 0.2,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 8000,
            mapBrightness: 6,
            baseColor: [0.95, 0.98, 0.95],
            markerColor: [0.1, 0.65, 0.3],
            glowColor: [0.8, 1, 0.85],
            markers: [
                { location: [31.7917, -7.0926], size: 0.07 },
                { location: [33.5731, -7.5898], size: 0.05 },
                { location: [30.4278, -9.5981], size: 0.04 },
                { location: [33.8935, -5.5547], size: 0.04 },
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            },
        });

        return () => { globe.destroy(); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 280, height: 280, maxWidth: "100%", aspectRatio: 1 }}
            className={className}
        />
    );
}
