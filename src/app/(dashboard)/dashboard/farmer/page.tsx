import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { eq, sql, and, desc } from "drizzle-orm";
import { getIncomingRequests, getAcceptedPartners } from "@/data-access/connections.dal";
import { quoteRepository } from "@/persistence/repositories/quote.repository";
import { getFarmerProducts, getMarketChartData } from "@/data-access/products.dal";
import { getOpenTenders, getFarmerBids } from "@/data-access/tenders.dal";
import { getFarmerHarvestPlans } from "@/data-access/harvests.dal";
import { getFarmerExpenses } from "@/data-access/expenses.dal";
import { FarmerDashboardTabs } from "./farmer-dashboard-tabs";
import { calculateFarmerScore } from "@/lib/utils/profile-score";
import { ConfidenceScoreCard } from "@/components/dashboard/confidence-score-card";
import { getHistoricalNDVI, getCurrentWeather, getWeatherForecast, getSoilData } from "@/services/agromonitoring.service";
import { syncParcelWithAgroMonitoringAction, getFarmerAnalyticsAction, getSatelliteImageryAction } from "@/actions/agromonitoring.actions";
import { AgroAnalyticsChart } from "@/components/dashboard/agro-analytics-chart";
import { AdvancedInsightsGrid } from "@/components/dashboard/advanced-insights-grid";
import { SatelliteVisionCard } from "@/components/dashboard/satellite-vision-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { ParcelManagement } from "@/components/dashboard/farmer/parcel-management";
import { FarmerOverview } from "@/components/dashboard/farmer/farmer-overview";
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
    const [myProducts, acceptedPartners, incomingRequests, parcelsList, openTenders, myBids, myQuotes, harvestPlans, expenses, marketChartData] = await Promise.all([
        getFarmerProducts(profile.id),
        getAcceptedPartners(profile.id, "FARMER"),
        getIncomingRequests(profile.id, "FARMER"),
        farmerRepository.getParcelsByFarmerId(profile.id),
        getOpenTenders(),
        getFarmerBids(profile.id),
        quoteRepository.findBySenderUserId(session.user.id),
        getFarmerHarvestPlans(profile.id),
        getFarmerExpenses(profile.id),
        getMarketChartData()
    ]);

    // Fetch NDVI and Weather Data if a parcel is connected
    let ndviData = [];
    let currentWeather = null;
    let weatherForecast = null;
    let soilData = null;
    let isTimeout = false;
    let isSyncing = false;
    let advancedData: any = null;
    let satelliteScenes: any[] = [];
    let activePolygonId = "";

    if (parcelsList.length > 0 && parcelsList[0].polygonId) {
        if (parcelsList[0].polygonId === "WAITING_API_SYNC") {
            isSyncing = true;
        }
        activePolygonId = parcelsList[0].polygonId;

        // --- LAZY SYNC REPAIR ---
        // If the parcel is stuck in WAITING_API_SYNC, attempt to repair it on-the-fly
        if (activePolygonId === "WAITING_API_SYNC") {
            const syncResult = await syncParcelWithAgroMonitoringAction(parcelsList[0].id);
            if (syncResult.data) {
                activePolygonId = syncResult.data;
            }
        }

        if (activePolygonId === "WAITING_API_SYNC") {
            // If still waiting (sync failed again), fallback to simulation
            activePolygonId = "DEMO_POLY_ID";
        }

        try {
            const [analyticsResult, imageryResult] = await Promise.all([
                getFarmerAnalyticsAction(activePolygonId),
                getSatelliteImageryAction(activePolygonId)
            ]);

            if (analyticsResult.isTimeout) {
                isTimeout = true;
            }

            if (analyticsResult.data) {
                ndviData = analyticsResult.data.ndvi;
                currentWeather = analyticsResult.data.weather;
                soilData = analyticsResult.data.soil;
                weatherForecast = analyticsResult.data.forecast;
                advancedData = analyticsResult.data;
            }

            if (imageryResult.data) {
                satelliteScenes = imageryResult.data;
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
                    <FarmerOverview
                        partners={acceptedPartners}
                        totalProducts={myProducts.length}
                        totalTenders={openTenders.length}
                        pendingRequests={incomingRequests.filter(r => r.status === "PENDING").length}
                        averageNdvi={(ndviData && ndviData.length > 0) ? (ndviData[ndviData.length - 1].data?.mean?.toFixed(2) || "0.0") : "--"}
                        totalArea={Number(parcelsList.reduce((acc, p) => acc + (Number(p.area) || 0), 0))}
                        marketChartData={marketChartData}
                        farmName={profile.farmName || "Ma Ferme"}
                    />

                    {isSyncing && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
                            <Loader2 className="size-4 text-blue-500 animate-spin" />
                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Synchronisation satellite en cours...</p>
                        </div>
                    )}

                    {isTimeout && (
                        <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
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

                    <div className="flex flex-col gap-4">
                        <ParcelManagement parcels={parcelsList} />

                        {/* Data access indicator for the user */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                    <TrendingUp className="size-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Analyse de Terrain & Météo</p>
                                    <p className="text-[11px] font-medium text-slate-500">Toutes vos données satellite, sols et prévisions sont désormais centralisées.</p>
                                </div>
                            </div>
                            <Link href="/dashboard/farmer?tab=land">
                                <Button variant="outline" className="h-9 rounded-xl border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest px-6 group">
                                    Consulter ma Terre
                                    <ArrowUpRightIcon className="size-3 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </Link>
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
                    satelliteScenes={satelliteScenes}
                    geoJson={parcelsList[0]?.geoJson}
                    advancedData={advancedData}
                    polygonId={activePolygonId}
                />
            </div>
        </main>
    );
}
