"use client";

import {
    Globe,
    Pencil,
    BadgeCheck,
    Cloud,
    ArrowLeftRight,
    HeadphonesIcon,
    RotateCcw,
    Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    {
        icon: Globe,
        title: "Marketplace ouverte",
        description:
            "Accessible à tous les agriculteurs et entreprises du Maroc. Sans frais cachés, sans intermédiaire.",
    },
    {
        icon: Pencil,
        title: "Facilité d'utilisation",
        description:
            "Aussi simple qu'une application mobile. Créez votre profil et publiez votre première offre en 5 minutes.",
    },
    {
        icon: BadgeCheck,
        title: "Prix transparents",
        description:
            "Nos tarifs sont parmi les meilleurs du marché. Sans plafond, sans engagement, sans carte bancaire.",
    },
    {
        icon: Cloud,
        title: "Disponibilité 100%",
        description:
            "Infrastructure cloud robuste. Vos données et vos contrats sont accessibles à tout moment, partout.",
    },
    {
        icon: ArrowLeftRight,
        title: "Multi-profils",
        description:
            "Gérez plusieurs exploitations ou entreprises depuis un seul compte. Partagez l'accès avec votre équipe.",
    },
    {
        icon: HeadphonesIcon,
        title: "Support 24/7",
        description:
            "Une équipe dédiée disponible à tout moment. Nos agents agricoles répondent en moins de 2 heures.",
    },
    {
        icon: RotateCcw,
        title: "Satisfaction garantie",
        description:
            "Si Agri-Mar ne vous convient pas dans les 30 premiers jours, nous vous remboursons intégralement.",
    },
    {
        icon: Leaf,
        title: "Et bien plus encore",
        description:
            "Nouvelles fonctionnalités chaque mois. Nous construisons la plateforme avec nos utilisateurs.",
    },
];

function GridItem({ item, className }: { item: typeof items[0]; className?: string }) {
    return (
        <div
            className={cn(
                "p-8 group relative flex flex-col gap-4 hover:bg-zinc-50/60 transition-colors duration-200",
                className
            )}
        >
            {/* Left accent bar on hover */}
            <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <item.icon className="w-5 h-5 text-zinc-400 stroke-[1.5]" />
            <div>
                <h3 className="text-sm font-bold text-black mb-2 tracking-tight">
                    {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                </p>
            </div>
        </div>
    );
}

export function FeaturesGrid() {
    return (
        <section id="features-grid" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="max-w-2xl mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4 text-black">
                        Tout ce qu'il vous faut pour transformer
                        votre exploitation agricole.
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Une suite complète d'outils digitaux conçus spécifiquement pour les
                        besoins du marché{" "}
                        <span className="text-green-600 font-medium">agricole marocain.</span>
                    </p>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-zinc-100">
                    {items.slice(0, 4).map((item, index) => (
                        <GridItem
                            key={index}
                            item={item}
                            className={cn(
                                index < 3 && "lg:border-r border-zinc-100",
                                index < 3 && "border-b lg:border-b-0"
                            )}
                        />
                    ))}
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-r border-b border-zinc-100">
                    {items.slice(4, 8).map((item, index) => (
                        <GridItem
                            key={index + 4}
                            item={item}
                            className={cn(
                                index < 3 && "lg:border-r border-zinc-100",
                                index < 3 && "border-b lg:border-b-0"
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
