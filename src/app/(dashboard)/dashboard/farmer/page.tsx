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
    Layers,
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
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.farmName}</span>
                    <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded uppercase",
                        calculateFarmerScore(profile) >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>
                        {calculateFarmerScore(profile) >= 80 ? "CERTIFIÉ AGRI-MAR" : "PROFIL ESSENTIEL"}
                    </span>
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
                        <div className="flex items-center justify-between mb-2">
                            <CardDescription className="text-[13px] font-medium text-slate-500">Mes Produits</CardDescription>
                            <div className="p-1.5 rounded-lg text-slate-700 bg-slate-100 border border-slate-200/60">
                                <Layers className="size-3.5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {myProducts.length}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Total produits actifs au catalogue
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <CardDescription className="text-[13px] font-medium text-slate-500">Collaborateurs</CardDescription>
                            <div className="p-1.5 rounded-lg text-slate-700 bg-slate-100 border border-slate-200/60">
                                <Building2 className="size-3.5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {acceptedPartners.length}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Entreprises partenaires connectées
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card bg-white shadow-sm border-slate-100">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <CardDescription className="text-[13px] font-medium text-slate-500">Demandes</CardDescription>
                            <div className="p-1.5 rounded-lg text-slate-700 bg-slate-100 border border-slate-200/60">
                                <Inbox className="size-3.5" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                            {incomingRequests.filter(r => r.status === "PENDING").length}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 pb-4">
                        <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Demandes de contact à traiter
                        </div>
                    </CardFooter>
                </Card>

                <ConfidenceScoreCard
                    score={calculateFarmerScore(profile)}
                    role="FARMER"
                    className="md:col-span-2 lg:col-span-1 shadow-none border-slate-100 rounded-xl"
                />
            </div>

            {/* Segmentation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-0 mt-2" />

            <FarmerDashboardTabs
                profile={profile}
                initialRequests={incomingRequests}
                initialPartners={acceptedPartners}
                initialProducts={myProducts}
            />
        </main>
    );
}
