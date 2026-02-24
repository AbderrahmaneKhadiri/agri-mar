import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, Users, ClipboardList, TrendingUp, Building2, Search } from "lucide-react";

import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { cn } from "@/lib/utils";

export default async function CompanyDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const [requests, partners] = await Promise.all([
        getIncomingRequests(profile.id, "COMPANY"),
        getAcceptedPartners(profile.id, "COMPANY"),
    ]);

    return (
        <div className="space-y-6 pb-12">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE ACHETEUR — ENTREPRISE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.companyName || "Mon Entreprise"}</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[8px] font-black px-2 py-0.5 rounded uppercase border-transparent">VÉRIFIÉ</Badge>
                </div>
            </div>

            {/* Welcome Banner */}
            <Card className="rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm mb-8 mt-4 bg-white">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">Vue d'ensemble</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Bienvenue, <span className="capitalize">{profile?.companyName?.toLowerCase()}</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
                    Explorez le marché agricole pour trouver vos futurs fournisseurs. Suivez vos commandes et gérez votre réseau d'agriculteurs de confiance.
                </p>
                <div className="mt-6">
                    <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[1.5px] shadow-sm h-11 px-6">
                        <Link href="/dashboard/company/marketplace">
                            <Search className="w-4 h-4 mr-2" />
                            Explorer le catalogue
                        </Link>
                    </Button>
                </div>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Mes Demandes", value: requests.length.toString(), icon: ClipboardList },
                    { label: "Fournisseurs", value: partners.length.toString(), icon: Users },
                    { label: "Marché Agricole", value: "Exploration", icon: ShoppingCart },
                    { label: "Activité", value: "Normale", icon: TrendingUp },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[1.5px] leading-relaxed w-24">{stat.label}</p>
                            <div className="p-2 rounded-xl border border-slate-100 bg-blue-50/50">
                                <stat.icon className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Card className="lg:col-span-2 rounded-2xl p-8 border border-slate-200 shadow-sm bg-white h-full">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[2px]">Activités Récentes</h3>
                    </div>
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                        <ClipboardList className="w-10 h-10 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aucune activité récente.</p>
                    </div>
                </Card>

                <Card className="rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col h-full bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[2px]">Alertes Marché</h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-xs font-bold text-slate-900 uppercase pr-4">Nouveau fournisseur</p>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent rounded text-[8px] font-bold uppercase tracking-widest">INFO</Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                Un expert en maraichage vient de s'inscrire à Agadir.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-xs font-bold text-slate-900 uppercase pr-4">Tendances des prix</p>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent rounded text-[8px] font-bold uppercase tracking-widest">HAUSSE</Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                Les prix des agrumes sont en hausse de 5% sur le marché de gros.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
