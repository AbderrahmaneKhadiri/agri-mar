"use client";

import Link from "next/link";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Leaf, Sparkles, Star, LogIn } from "lucide-react";

const navItems = [
    {
        name: "Fonctionnalités",
        link: "#features",
        icon: <Sparkles className="w-4 h-4" />,
    },
    {
        name: "Témoignages",
        link: "#testimonials",
        icon: <Star className="w-4 h-4" />,
    },
    {
        name: "Se connecter",
        link: "/login",
        icon: <LogIn className="w-4 h-4" />,
    },
];

export function Navbar() {
    return (
        <FloatingNav
            navItems={navItems}
            className="border-zinc-200 bg-white/95 shadow-sm"
        />
    );
}
