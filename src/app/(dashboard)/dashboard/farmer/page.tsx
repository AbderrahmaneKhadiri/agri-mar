import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { eq, sql, and, desc } from "drizzle-orm";
import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { quoteRepository } from "@/persistence/repositories/quote.repository";
import { getFarmerProducts } from "@/data-access/products.dal";
import { getOpenTenders, getFarmerBids } from "@/data-access/tenders.dal";
import { getFarmerHarvestPlans } from "@/data-access/harvests.dal";
import { getFarmerExpenses } from "@/data-access/expenses.dal";
import { FarmerDashboardTabs } from "./farmer-dashboard-tabs";
import { calculateFarmerScore } from "@/lib/utils/profile-score";
import { ConfidenceScoreCard } from "@/components/dashboard/confidence-score-card";
import { getHistoricalNDVI, getCurrentWeather, getWeatherForecast, getSoilData } from "@/services/agromonitoring.service";
import { syncParcelWithAgroMonitoringAction } from "@/actions/agromonitoring.actions";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { ParcelManagement } from "@/components/dashboard/farmer/parcel-management";
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
    Bell,
    Loader2,
    Activity,
    Globe
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
import { MapPin } from "lucide-react";

export default async function FarmerDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab } = await searchParams;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) redirect("/onboarding/farmer");

    // Fetch farmer-specific metrics using DALs
    const [myProducts, acceptedPartners, incomingRequests, parcelsList, openTenders, myBids, myQuotes, harvestPlans, expenses] = await Promise.all([
        getFarmerProducts(profile.id),
        getAcceptedPartners(profile.id, "FARMER"),
        getIncomingRequests(profile.id, "FARMER"),
        farmerRepository.getParcelsByFarmerId(profile.id),
        getOpenTenders(),
        getFarmerBids(profile.id),
        quoteRepository.findBySenderUserId(session.user.id),
        getFarmerHarvestPlans(profile.id),
        getFarmerExpenses(profile.id)
    ]);

    // Fetch NDVI and Weather Data if a parcel is connected
    let ndviData = [];
    let currentWeather = null;
    let weatherForecast = null;
    let soilData = null;
    let isTimeout = false;
    let isSyncing = false;

    if (parcelsList.length > 0 && parcelsList[0].polygonId) {
        if (parcelsList[0].polygonId === "WAITING_API_SYNC") {
            isSyncing = true;
        }
        let polygonId = parcelsList[0].polygonId;

        // --- LAZY SYNC REPAIR ---
        // If the parcel is stuck in WAITING_API_SYNC, attempt to repair it on-the-fly
        if (polygonId === "WAITING_API_SYNC") {
            const syncResult = await syncParcelWithAgroMonitoringAction(parcelsList[0].id);
            if (syncResult.data) {
                polygonId = syncResult.data;
            }
        }

        if (polygonId === "WAITING_API_SYNC") {
            // If still waiting (sync failed again), fallback to simulation
            polygonId = "DEMO_POLY_ID";
        }

        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);

            const dataPromise = Promise.all([
                getHistoricalNDVI(polygonId, startDate, endDate),
                getCurrentWeather(polygonId),
                getWeatherForecast(polygonId),
                getSoilData(polygonId)
            ]);

            // Safe timeout that doesn't cause unhandledRejection
            const timeoutPromise = new Promise(resolve =>
                setTimeout(() => resolve("TIMEOUT"), 5000)
            );

            const result = await Promise.race([dataPromise, timeoutPromise]);

            if (result === "TIMEOUT") {
                console.warn("AgroMonitoring API timeout - No data loaded");
                isTimeout = true;
            } else {
                const [ndvi, weather, forecast, soil] = result as any;
                ndviData = ndvi;
                currentWeather = weather;
                soilData = soil;

                if (forecast?.list) {
                    weatherForecast = forecast.list.filter((_: any, i: number) => i % 8 === 0);
                }
            }
        } catch (error) {
            console.error("Erreur chargement données AgroMonitoring", error);
        }
    }

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

            {/* Contextual Breadcrumb */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Dashboard</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold border-b-2 border-emerald-500/30 pb-0.5">
                            {!tab ? "Vue d'ensemble" :
                                tab === "requests" ? "Mes Demandes" :
                                    tab === "partners" ? "Partenaires" :
                                        tab === "products" ? "Mon Catalogue" :
                                            tab === "tenders" ? "Appels d'Offres" :
                                                tab === "planning" ? "Planning Récolte" :
                                                    tab === "finances" ? "Finances" :
                                                        tab === "land" ? "Ma Terre & Météo" : "Vue d'ensemble"}
                        </span>
                    </div>
                </div>
            </div>

            {!tab && (
                <>
                    {/* === HERO BANNER === */}
                    <div className="rounded-[2rem] bg-[#2c5f42] px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden shadow-xl shadow-[#2c5f42]/20">
                        {/* Decorative circles */}
                        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
                        <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-3 text-[#a8d5be]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#a8d5be]" />
                                <span className="text-[10px] font-bold uppercase tracking-[3px]">VOTRE ACTIVITÉ</span>
                            </div>
                            <h1 className="text-3xl font-light text-white tracking-tight leading-none mb-3">Bienvenue, {(profile.fullName || "Agriculteur").split(' ')[0]}</h1>
                            <p className="text-[13px] text-white/70 font-medium max-w-xl leading-relaxed">
                                Que vous soyez en phase de <strong className="text-white font-bold underline decoration-[#a8d5be]/50">négociation contractuelle</strong> avec de grandes industries ou en vente <strong className="text-white font-bold underline decoration-[#a8d5be]/50">directe aux acheteurs locaux</strong>.
                            </p>
                        </div>

                        <div className="flex gap-6 shrink-0 relative z-10 md:border-l md:border-white/10 md:pl-8">
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-white tabular-nums leading-none">
                                    {Number(parcelsList.reduce((acc, p) => acc + (Number(p.area) || 0), 0)).toFixed(1)}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-[#a8d5be] transition-colors">Ha exploités</div>
                            </div>
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-white tabular-nums leading-none">
                                    {myProducts.length}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-[#a8d5be] transition-colors">Produits</div>
                            </div>
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-[#a8d5be] tabular-nums leading-none">
                                    {(ndviData && ndviData.length > 0) ? (ndviData[ndviData.length - 1].data?.mean?.toFixed(2) || "0.0") : "--"}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-white transition-colors">NDVI Actuel</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm group hover:border-[#a8d5be] transition-colors h-full">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mes Produits</p>
                                <Package className="size-3.5 text-[#2c5f42]" />
                            </div>
                            <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">
                                {myProducts.length}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-auto flex items-center gap-1">
                                <ArrowUpRightIcon className="size-3 text-emerald-500" />
                                Catalogue Actif
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm group hover:border-[#a8d5be] transition-colors h-full">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Collaborateurs</p>
                                <Handshake className="size-3.5 text-[#2c5f42]" />
                            </div>
                            <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">
                                {acceptedPartners.length}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-auto flex items-center gap-1">
                                Partenaires Connectés
                            </p>
                        </div>

                        <div className="bg-[#f0f8f4] rounded-xl border border-[#c4dece] p-5 flex flex-col gap-3 shadow-sm group h-full">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium text-[#4a8c5c] uppercase tracking-wider">Demandes</p>
                                <Inbox className="size-3.5 text-[#2c5f42]" />
                            </div>
                            <span className="text-[30px] font-light text-[#2c5f42] tabular-nums leading-none">
                                {incomingRequests.filter(r => r.status === "PENDING").length}
                            </span>
                            <p className="text-[10px] text-[#4a8c5c]/80 mt-auto flex items-center gap-1">
                                En attente d&apos;action
                            </p>
                        </div>

                        <ConfidenceScoreCard
                            score={calculateFarmerScore(profile)}
                            role="FARMER"
                            className="p-5 h-full"
                            hideCTA={true}
                        />

                        {isSyncing && (
                            <div className="md:col-span-2 lg:col-span-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
                                <Loader2 className="size-4 text-blue-500 animate-spin" />
                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Synchronisation satellite en cours...</p>
                            </div>
                        )}

                        {isTimeout && (
                            <div className="md:col-span-2 lg:col-span-4 p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm">
                                        <Activity className="size-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Données de Monitoring Indisponibles</p>
                                        <p className="text-[11px] font-medium text-amber-600">Le serveur satellite met trop de temps à répondre. Veuillez rafraîchir la page dans quelques instants.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/farmer">
                                    <Button
                                        variant="outline"
                                        className="h-9 rounded-xl border-amber-200 bg-white text-amber-700 hover:bg-amber-100 text-[10px] font-bold uppercase tracking-widest px-6"
                                    >
                                        Réessayer
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
                            <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                                <ParcelManagement parcels={parcelsList} />
                                {!isTimeout && parcelsList.length > 0 && ndviData && ndviData.length > 0 && (
                                    <NdviChart data={ndviData} isSyncing={isSyncing} className="flex-1 h-full" />
                                )}
                            </div>
                            <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                                {parcelsList.length > 0 ? (
                                    <>
                                        {!isTimeout && (
                                            <>
                                                <WeatherCard
                                                    current={currentWeather}
                                                    forecast={weatherForecast}
                                                    locationName={profile.city}
                                                    isSyncing={isSyncing}
                                                />
                                                <SoilCard
                                                    data={soilData}
                                                    isSyncing={isSyncing}
                                                    className="flex-1 h-full"
                                                />
                                            </>
                                        )}
                                        {isTimeout && (
                                            <div className="bg-white border rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                                                <Globe className="size-8 text-slate-200" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Données Météo & Sol</p>
                                                <p className="text-[11px] text-slate-400 font-medium">En attente de connexion satellite...</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Card className="bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center min-h-[300px] h-full">
                                        <MapPin className="size-10 text-slate-300 mb-4" />
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Aucune parcelle</h3>
                                        <p className="text-[12px] text-slate-500 max-w-[200px]">
                                            Ajoutez une parcelle pour voir les données météo et de sol en temps réel.
                                        </p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Segmentation Tabs Content */}
            <div className={cn("mt-2 transition-all duration-500", !tab ? "opacity-40 pointer-events-none scale-[0.98] blur-[2px] hidden" : "opacity-100")}>
                <FarmerDashboardTabs
                    profile={profile}
                    initialRequests={incomingRequests}
                    initialPartners={acceptedPartners}
                    initialProducts={myProducts}
                    initialOpenTenders={openTenders as any}
                    initialFarmerBids={myBids as any}
                    initialFarmerQuotes={myQuotes as any}
                    initialHarvestPlans={harvestPlans as any}
                    initialExpenses={expenses as any}
                    userImage={session.user.image}
                    ndviData={ndviData}
                    currentWeather={currentWeather}
                    weatherForecast={weatherForecast}
                    soilData={soilData}
                    isSyncing={isSyncing}
                />
            </div>
        </main>
    );
}
