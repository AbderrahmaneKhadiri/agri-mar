import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, TrendingUp, Handshake, MessageSquare } from "lucide-react";

import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";

export default async function FarmerDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const [requests, partners] = await Promise.all([
        getIncomingRequests(profile.id, "FARMER"),
        getAcceptedPartners(profile.id, "FARMER"),
    ]);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Bonjour, <span className="text-green-600">{profile?.fullName}</span>
                </h1>
                <p className="text-slate-500 mt-2">
                    Gérez votre exploitation et vos relations commerciales.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Mes Demandes", value: requests.length.toString(), icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Mes Partenaires", value: partners.length.toString(), icon: Handshake, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Alertes", value: "0", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Messages", value: "0", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
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

            {/* Placeholder for content */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800">Suivi des récoltes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <Tractor className="w-12 h-12 mb-3 opacity-20" />
                        <p>Ajoutez vos premiers produits pour commencer le suivi.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
