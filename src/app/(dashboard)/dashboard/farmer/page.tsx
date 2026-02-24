import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tractor, TrendingUp, Handshake, MessageSquare, ArrowUpRight, Clock, Leaf } from "lucide-react";

import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { getMonthlyRevenue, getRecentCommercialActivity } from "@/data-access/analytics.dal";
import { RevenueChart } from "@/components/dashboard/farmer/revenue-chart";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default async function FarmerDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const [requests, partners, revenueData, activity] = await Promise.all([
        getIncomingRequests(profile.id, "FARMER"),
        getAcceptedPartners(profile.id, "FARMER"),
        getMonthlyRevenue(profile.id),
        getRecentCommercialActivity(profile.id, 5),
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE PRODUCTEUR — EXPLOITANT AGRICOLE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.farmName || "Mon Domaine"}</span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[8px] font-black px-2 py-0.5 rounded uppercase border-transparent">CERTIFIÉ</Badge>
                </div>
            </div>

            {/* Welcome Banner */}
            <Card className="rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm mb-8 mt-4 bg-white">
                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <Leaf className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">Vue d'ensemble</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Tableau de bord de <span className="capitalize">{profile?.fullName?.toLowerCase()}</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
                    Gérez vos stocks, répondez aux offres commerciales et analysez vos revenus. <strong className="text-slate-700">{requests.length} nouvelles entreprises</strong> attendent votre validation pour consulter votre catalogue.
                </p>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Demandes en attente", value: requests.length.toString(), icon: Clock },
                    { label: "Catalogues Partagés", value: partners.length.toString(), icon: Handshake },
                    { label: "Ventes (6 mois)", value: totalRevenue.toLocaleString() + " MAD", icon: TrendingUp },
                    { label: "Transactions", value: activity.length.toString(), icon: MessageSquare },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[1.5px] leading-relaxed w-24">{stat.label}</p>
                            <div className="p-2 rounded-xl border border-slate-100 bg-emerald-50/50">
                                <stat.icon className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 rounded-2xl p-8 border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[2px]">Évolution des revenus</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">MAD</span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <RevenueChart data={revenueData} />
                    </div>
                </Card>

                {/* Recent Activity Mini-feed */}
                <Card className="rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[2px]">Activité Récente</h3>
                        <span className="text-[10px] font-medium text-slate-400">{activity.length} actions</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {activity.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aucun devis</p>
                            </div>
                        ) : (
                            activity.map((item) => (
                                <div key={item.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-900 uppercase truncate pr-4">{item.productName}</p>
                                        <Badge variant="outline" className={cn(
                                            "rounded text-[8px] font-bold uppercase tracking-widest shrink-0 whitespace-nowrap border-none",
                                            item.status === 'ACCEPTED' ? "bg-emerald-100 text-emerald-700" :
                                                item.status === 'DECLINED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-[10px] text-slate-500 font-bold">{item.totalAmount} MAD</p>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <Button variant="secondary" className="w-full mt-4 rounded-xl text-[10px] font-bold uppercase tracking-widest h-11 text-slate-600">
                        Voir tout l'historique
                    </Button>
                </Card>
            </div>

            {/* Decorative Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="bg-white rounded-2xl p-8 relative overflow-hidden group border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                                <Tractor className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">Gestion du Catalogue</h3>
                            <p className="text-slate-500 text-xs font-medium mb-8 max-w-[250px] leading-relaxed">
                                Mettez à jour vos stocks pour que les entreprises puissent passer commande.
                            </p>
                        </div>
                        <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-[1.5px] shadow-sm h-11 px-6 w-max">
                            <Link href="/dashboard/farmer/products">Voir mes produits</Link>
                        </Button>
                    </div>
                </Card>

                <Card className="bg-white rounded-2xl p-8 relative overflow-hidden group border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                                <Handshake className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">Nouvelles Connexions</h3>
                            <p className="text-slate-500 text-xs font-medium mb-8 max-w-[250px] leading-relaxed">
                                Découvrez les <strong className="text-emerald-600">{requests.length} requêtes</strong> d'accès à votre profil en attente.
                            </p>
                        </div>
                        <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-[1.5px] shadow-sm h-11 px-6 w-max">
                            <Link href="/dashboard/farmer/requests">Autoriser l'accès</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
