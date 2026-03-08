"use client";

import { TrendingUp, Users, FileCheck, Leaf } from "lucide-react";

const stats = [
    { icon: Users, value: "200+", label: "Agriculteurs & entreprises actifs" },
    { icon: FileCheck, value: "1 200+", label: "Contrats conclus en ligne" },
    { icon: TrendingUp, value: "50%", label: "Gain de temps sur la gestion" },
    { icon: Leaf, value: "98%", label: "Taux de satisfaction client" },
];

export function Stats() {
    return (
        <section className="py-16 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 rounded-2xl overflow-hidden">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center justify-center gap-2 bg-zinc-950 px-6 py-10 text-center hover:bg-zinc-900 transition-colors"
                            >
                                <Icon className="w-5 h-5 text-green-500 mb-1" />
                                <span className="text-4xl font-bold text-white">{stat.value}</span>
                                <span className="text-sm text-zinc-500 leading-snug max-w-[120px]">
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
