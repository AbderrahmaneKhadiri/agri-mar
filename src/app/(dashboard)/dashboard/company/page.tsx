import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { eq, and, desc } from "drizzle-orm";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    CardAction
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    ChevronDown,
    ArrowUpRight
} from "lucide-react";

import { getAcceptedPartners, getOutgoingRequests } from "@/data-access/connections.dal";
import { getMarketplaceProducts } from "@/data-access/products.dal";
import { CompanyDashboardClient } from "./company-dashboard-client";

export default async function CompanyDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    // Parallel data fetching for performance
    const [suppliers, marketOffers, requests] = await Promise.all([
        getAcceptedPartners(profile.id, "COMPANY"),
        getMarketplaceProducts(),
        getOutgoingRequests(profile.id, "COMPANY")
    ]);

    const stats = [
        {
            title: "Mes Fournisseurs",
            value: suppliers.length,
            trend: "+0%",
            desc: "Partenariats actifs",
            trendText: "Actuellement stable"
        },
        {
            title: "Demandes",
            value: requests.length,
            trend: "+5%",
            desc: "En attente de réponse",
            trendText: "En cours de négociation"
        },
        {
            title: "Marché Ouvert",
            value: marketOffers.length,
            trend: "+12%",
            desc: "Offres disponibles",
            trendText: "Nouveaux arrivages"
        },
        {
            title: "Budget Projeté",
            value: "--",
            trend: "0%",
            desc: "Analyse en cours",
            trendText: "Données à venir"
        },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE ACHETEUR — CENTRE DE PILOTAGE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile.companyName}</span>
                    <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">ENTREPRISE</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">VOTRE ACTIVITÉ</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bienvenue, {profile.companyName}</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Pilotez vos <strong className="text-slate-700 font-bold underline decoration-blue-200/50">approvisionnements stratégiques</strong> et gérez vos relations avec les producteurs locaux. Analysez vos performances d&apos;achat et trouvez les meilleures opportunités du <strong className="text-slate-700 font-bold underline decoration-blue-200/50">marché agricole</strong>.
                </p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Dashboard</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Vue d'ensemble</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="@container/card bg-white shadow-sm border-slate-100">
                        <CardHeader>
                            <CardDescription className="text-[13px] font-medium text-slate-500">{stat.title}</CardDescription>
                            <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 gap-1 font-bold rounded-md px-1.5 py-0 text-[10px]">
                                    <TrendingUp className="size-2.5" />
                                    {stat.trend}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 pb-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                                {stat.trendText} <TrendingUp className="size-3 text-emerald-500" />
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                                {stat.desc}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <CompanyDashboardClient
                initialSuppliers={suppliers}
                initialMarketOffers={marketOffers as any}
                initialRequests={requests}
            />
        </main>
    );
}
