"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = {
    Produit: ["Marketplace", "Contrats", "Suivi Satellite", "Analytique", "Messagerie"],
    Entreprise: ["À propos", "Blog", "Carrières", "Presse", "Contact"],
    Légal: ["Confidentialité", "Conditions", "Cookies"],
};

export function Footer() {
    return (
        <footer className="relative bg-white text-gray-600 pb-8 z-10 overflow-hidden mt-16 border-t border-gray-100">
            <div className="container mx-auto px-4 pt-16 relative z-10">
                {/* Top links */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                    <div className="flex flex-col gap-4">
                        <img src="/logo.png" alt="Agri-Mar" className="max-w-[160px] h-auto" />
                        <p className="text-sm leading-relaxed max-w-xs text-gray-500">
                            La plateforme qui connecte l'agriculture marocaine à l'intelligence moderne.
                        </p>
                    </div>
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-gray-900 font-semibold text-sm mb-4">{category}</h4>
                            <ul className="flex flex-col gap-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors duration-200">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="bg-gray-100 mb-8" />

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 mb-12">
                    <p>© 2025 Agri-Mar. Tous droits réservés.</p>
                    <p>Fait avec ♥ au Maroc 🇲🇦</p>
                </div>
            </div>
        </footer>
    );
}
