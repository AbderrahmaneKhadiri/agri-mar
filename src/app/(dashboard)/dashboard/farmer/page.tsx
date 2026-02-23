import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, TrendingUp, Handshake, MessageSquare, ArrowUpRight, Clock } from "lucide-react";

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
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Bonjour, <span className="text-green-600">{profile?.fullName}</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Voici un aperçu de la performance commerciale de votre exploitation.
                    </p>
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4">
                    <div className="bg-green-50 p-2.5 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Revenu Total</p>
                        <p className="text-lg font-black text-slate-900 leading-none">{totalRevenue.toLocaleString()} MAD</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Demandes", value: requests.length.toString(), icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Partenaires", value: partners.length.toString(), icon: Handshake, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Ventes (6m)", value: totalRevenue.toLocaleString(), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Activité", value: activity.length.toString(), icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={cn("p-3 rounded-2xl transition-all group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black text-slate-900 tracking-tight uppercase">ÉVOLUTION DES REVENUS (MAD)</CardTitle>
                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                Performance Commerciale
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <RevenueChart data={revenueData} />
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-sm font-black text-slate-900 tracking-tight uppercase">ACTIVITÉ RÉCENTE</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {activity.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                                    <Clock className="h-10 w-10 text-slate-200" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aucun devis récent</p>
                                </div>
                            ) : (
                                activity.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-xl",
                                            item.status === 'ACCEPTED' ? "bg-green-50" :
                                                item.status === 'DECLINED' ? "bg-red-50" : "bg-blue-50"
                                        )}>
                                            <ArrowUpRight className={cn(
                                                "w-4 h-4",
                                                item.status === 'ACCEPTED' ? "text-green-600" :
                                                    item.status === 'DECLINED' ? "text-red-600" : "text-blue-600"
                                            )} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-black text-slate-900 uppercase truncate tracking-tight">{item.productName}</p>
                                                <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase">
                                                    {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                                                {item.quantity} - {item.totalAmount} MAD
                                            </p>
                                            <div className="mt-2 text-[10px]">
                                                <span className={cn(
                                                    "font-black px-2 py-1 rounded-lg uppercase tracking-[0.1em] text-[8px]",
                                                    item.status === 'ACCEPTED' ? "bg-green-100 text-green-700" :
                                                        item.status === 'DECLINED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Future Feature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-2xl bg-green-600 text-white rounded-[2rem] relative overflow-hidden group">
                    <CardContent className="p-10 relative z-10">
                        <Tractor className="w-14 h-14 mb-6 opacity-40 group-hover:scale-110 transition-transform duration-500 ease-out" />
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Catalogue de Produits</h3>
                        <p className="text-green-100 text-sm font-bold mb-8 max-w-xs leading-relaxed opacity-90">
                            Mettez à jour vos stocks pour attirer plus de partenaires commerciaux.
                        </p>
                        <button className="bg-white text-green-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-green-50 hover:-translate-y-1 transition-all active:scale-95">
                            Gérer mon stock
                        </button>
                    </CardContent>
                    {/* Decorative background circle */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                </Card>

                <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[2rem] relative overflow-hidden group">
                    <CardContent className="p-10 relative z-10">
                        <Handshake className="w-14 h-14 mb-6 opacity-40 group-hover:scale-110 transition-transform duration-500 ease-out" />
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Opportunités Export</h3>
                        <p className="text-slate-400 text-sm font-bold mb-8 max-w-xs leading-relaxed opacity-90">
                            Découvrez les besoins des grands groupes et les nouveaux appels d'offres.
                        </p>
                        <button className="bg-green-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-green-500 hover:-translate-y-1 transition-all active:scale-95">
                            Voir le marché
                        </button>
                    </CardContent>
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-700" />
                </Card>
            </div>
        </div>
    );
}
