import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { eq, sql, and, desc } from "drizzle-orm";
import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { getFarmerProducts } from "@/data-access/products.dal";
import { FarmerDashboardTabs } from "./farmer-dashboard-tabs";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    CardAction
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Package,
    Users,
    ClipboardList,
    TrendingUp,
    ArrowUpRightIcon,
    MessageSquare,
    Calendar,
    Filter,
    Clock,
    CheckCircle2,
    ChevronDown,
    Plus,
    Search
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default async function FarmerDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    // Fetch farmer-specific metrics using DALs
    const [myProducts, acceptedPartners, incomingRequests] = await Promise.all([
        getFarmerProducts(profile.id),
        getAcceptedPartners(profile.id, "FARMER"),
        getIncomingRequests(profile.id, "FARMER")
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE PRODUCTEUR — CENTRE DE PILOTAGE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.farmName || "Mon Domaine"}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">CERTIFIÉ</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">VOTRE ACTIVITÉ</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bienvenue, {profile.fullName.split(' ')[0]}</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Que vous soyez en phase de <strong className="text-slate-700 font-bold underline decoration-emerald-200/50">négociation contractuelle</strong> avec de grandes industries ou en vente <strong className="text-slate-700 font-bold underline decoration-emerald-200/50">directe aux acheteurs locaux</strong> (hôtels, restaurants, marchés), pilotez l&apos;ensemble de votre exploitation ici.
                </p>
            </div>

            {/* Contextual Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Dashboard</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Vue d&apos;ensemble</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid - Exact "Documents" Block Style */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Mes Produits</CardDescription>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {myProducts.length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 gap-1 font-bold rounded-md px-1.5 py-0 text-[10px]">
                                <TrendingUp className="size-2.5" />
                                +12.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                            Trending up this month <TrendingUp className="size-3 text-slate-900" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Vues catalogue cumulées
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Collaborateurs</CardDescription>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {acceptedPartners.length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 gap-1 font-bold rounded-md px-1.5 py-0 text-[10px]">
                                <TrendingUp className="size-2.5" />
                                -20%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                            Down 20% this period <TrendingUp className="size-3 text-slate-900" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Acquisition needs attention
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Demandes</CardDescription>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {incomingRequests.filter(r => r.status === "PENDING").length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 gap-1 font-bold rounded-md px-1.5 py-0 text-[10px]">
                                <Clock className="size-2.5" />
                                En cours
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                            Demandes de catalogue <TrendingUp className="size-3 text-slate-400" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            À valider prochainement
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Score Réseau</CardDescription>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            84%
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 gap-1 font-bold rounded-md px-1.5 py-0 text-[10px]">
                                <TrendingUp className="size-2.5" />
                                +4.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                            Steady performance increase <TrendingUp className="size-3 text-slate-900" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Meets growth projections
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Segmentation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-0 mt-2" />

            <FarmerDashboardTabs
                initialRequests={incomingRequests}
                initialPartners={acceptedPartners}
                initialProducts={myProducts}
            />
        </main>
    );
}
