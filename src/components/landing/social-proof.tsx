"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Star } from "lucide-react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const people = [
    {
        id: 1,
        name: "Ahmed O.",
        designation: "Agriculteur",
        image:
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
    },
    {
        id: 2,
        name: "Yassine M.",
        designation: "Coopérative agricole",
        image:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 3,
        name: "Salma F.",
        designation: "Grossiste",
        image:
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80",
    },
    {
        id: 4,
        name: "Kenza B.",
        designation: "Acheteur d'entreprise",
        image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    {
        id: 5,
        name: "Omar T.",
        designation: "Propriétaire terrien",
        image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
    },
    {
        id: 6,
        name: "Fatima E.",
        designation: "Investisseur agricole",
        image:
            "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
    },
];

const partners = [
    { name: "OCP Group" },
    { name: "Agrisouss" },
    { name: "COPAG" },
    { name: "Azura" },
    { name: "Delassus" },
    { name: "Lesieur Cristal" },
    { name: "Saham" },
    { name: "Zalar" },
];

export function SocialProof() {
    return (
        <section className="py-16 border-b bg-white overflow-hidden">
            <div className="container mx-auto px-4 text-center mb-10">
                {/* Avatars */}
                <div className="flex flex-row items-center justify-center mb-4 w-full">
                    <AnimatedTooltip items={people} />
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
                    ))}
                </div>
                <p className="text-sm font-medium text-zinc-400">
                    <span className="text-black font-semibold">4.9/5</span> — Noté par plus de 200 agriculteurs et entreprises
                </p>
            </div>

            {/* Separator label */}
            <p className="text-xs font-semibold tracking-widest text-zinc-300 uppercase text-center mb-8">
                Ils nous font confiance
            </p>

            {/* Infinite scrolling logos */}
            <InfiniteMovingCards
                items={partners}
                direction="left"
                speed="normal"
                pauseOnHover
            />
        </section>
    );
}
