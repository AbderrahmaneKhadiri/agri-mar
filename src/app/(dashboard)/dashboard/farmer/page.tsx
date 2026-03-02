import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { eq, sql, and, desc } from "drizzle-orm";
import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { getFarmerProducts } from "@/data-access/products.dal";
import { FarmerDashboardTabs } from "./farmer-dashboard-tabs";
import { calculateFarmerScore } from "@/lib/utils/profile-score";
import { ConfidenceScoreCard } from "@/components/dashboard/confidence-score-card";
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
    Search,
    Building2,
    Inbox,
    Boxes,
    Handshake,
    Bell
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
    if (!profile) redirect("/onboarding/farmer");

    // Fetch farmer-specific metrics using DALs
    const [myProducts, acceptedPartners, incomingRequests] = await Promise.all([
        getFarmerProducts(profile.id),
        getAcceptedPartners(profile.id, "FARMER"),
        getIncomingRequests(profile.id, "FARMER")
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE PRODUCTEUR — CENTRE DE PILOTAGE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.farmName || "--"}</span>
                    <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded uppercase",
                        calculateFarmerScore(profile) >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>
                        {calculateFarmerScore(profile) >= 80 ? "CERTIFIÉ AGRI-MAR" : "PROFIL ESSENTIEL"}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-border shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">VOTRE ACTIVITÉ</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bienvenue, {(profile.fullName || "Agriculteur").split(' ')[0]}</h1>
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

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Card: Mes Produits */}
                <Card className="bg-white shadow-sm border-border overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="size-8 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                <Package className="size-4 text-slate-700" />
                            </div>
                            <ArrowUpRightIcon className="size-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: 600, lineHeight: "36px", color: "lab(2.75381 0 0)" }} className="tabular-nums mb-1">
                            {myProducts.length}
                        </div>
                        <p className="text-[12px] font-medium text-slate-400">Mes Produits</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <span>Produits actifs au catalogue</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Collaborateurs */}
                <Card className="bg-white shadow-sm border-border overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="size-8 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                <Handshake className="size-4 text-slate-700" />
                            </div>
                            <ArrowUpRightIcon className="size-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: 600, lineHeight: "36px", color: "lab(2.75381 0 0)" }} className="tabular-nums mb-1">
                            {acceptedPartners.length}
                        </div>
                        <p className="text-[12px] font-medium text-slate-400">Collaborateurs</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <span>Entreprises partenaires connectées</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Demandes */}
                <Card className="bg-white shadow-sm border-border overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="relative">
                                <div className="size-8 rounded-lg bg-slate-50 border border-border flex items-center justify-center">
                                    <Inbox className="size-4 text-slate-700" />
                                </div>
                                {incomingRequests.filter(r => r.status === "PENDING").length > 0 && (
                                    <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                                )}
                            </div>
                            <ArrowUpRightIcon className="size-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: 600, lineHeight: "36px", color: "lab(2.75381 0 0)" }} className="tabular-nums mb-1">
                            {incomingRequests.filter(r => r.status === "PENDING").length}
                        </div>
                        <p className="text-[12px] font-medium text-slate-400">Demandes</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <span>Demandes en attente de traitement</span>
                        </div>
                    </CardContent>
                </Card>

                <ConfidenceScoreCard
                    score={calculateFarmerScore(profile)}
                    role="FARMER"
                    className="md:col-span-2 lg:col-span-1 shadow-sm"
                />
            </div>

            {/* Segmentation Tabs */}
            <div className="flex items-center justify-between border-b border-border pb-0 mt-2" />

            <FarmerDashboardTabs
                profile={profile}
                initialRequests={incomingRequests}
                initialPartners={acceptedPartners}
                initialProducts={myProducts}
                userImage={session.user.image}
            />
        </main>
    );
}
