import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, ClipboardList, TrendingUp } from "lucide-react";

import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";

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
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Bienvenue, <span className="text-green-600">{profile?.companyName}</span>
                </h1>
                <p className="text-slate-500 mt-2">
                    Voici un aperçu de votre activité sur AgriMar.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Mes Demandes", value: requests.length.toString(), icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Fournisseurs", value: partners.length.toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Marché Agricole", value: "Exploration", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Activité", value: "Normale", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800">Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                            <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
                            <p>Aucune activité récente pour le moment.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800">Alertes Marché</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-sm text-amber-800 font-medium">Nouveau fournisseur dans votre région</p>
                            <p className="text-xs text-amber-600 mt-1">Un expert en maraichage vient de s'inscrire à Agadir.</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 font-medium">Prix des agrumes en hausse</p>
                            <p className="text-xs text-blue-600 mt-1">Tendance à la hausse de 5% sur le marché de gros.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Utility for cleaner class concat
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
