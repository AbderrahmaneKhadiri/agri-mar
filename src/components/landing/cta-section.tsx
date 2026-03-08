"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
    return (
        <section className="relative py-24 bg-zinc-50 overflow-hidden">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 md:p-12 lg:p-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side: Content & Buttons */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
                                Prêt à passer<br />à <span className="text-green-600">l'action ?</span>
                            </h2>
                            <p className="text-zinc-500 text-lg mb-8 max-w-md">
                                Rejoignez la première plateforme agritech du Maroc.
                                Développez votre réseau, vendez vos produits ou trouvez
                                les meilleurs partenaires agricoles.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="h-12 px-8 bg-green-600 text-white hover:bg-green-700 rounded-lg font-semibold text-sm gap-2 shadow-lg shadow-green-100"
                                    >
                                        Démarrer gratuitement
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-12 px-8 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-semibold text-sm"
                                    >
                                        Contacter les ventes
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Side: Option Cards */}
                        <div className="flex flex-col gap-4">
                            {/* Card 1: Documentation / For Farmers */}
                            <Link
                                href="/register?type=farmer"
                                className="group flex items-center justify-between p-6 bg-white border border-zinc-200 rounded-2xl hover:border-green-500 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="flex items-center justify-center transition-colors">
                                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 text-lg mb-1 group-hover:text-green-700 transition-colors">Espace Agriculteur</h3>
                                        <p className="text-zinc-500 text-sm">Créez votre profil, proposez vos récoltes et analysez vos terres par satellite.</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-green-500 transition-colors ml-4 flex-shrink-0" />
                            </Link>

                            {/* Card 2: Getting Started / For Companies */}
                            <Link
                                href="/register?type=company"
                                className="group flex items-center justify-between p-6 bg-white border border-zinc-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="flex items-center justify-center transition-colors">
                                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 text-lg mb-1 group-hover:text-emerald-700 transition-colors">Espace Entreprise</h3>
                                        <p className="text-zinc-500 text-sm">Trouvez les meilleurs fournisseurs, proposez des contrats et gérez vos achats.</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-500 transition-colors ml-4 flex-shrink-0" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
