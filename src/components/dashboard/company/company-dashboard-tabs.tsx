"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Search,
    Building2,
    MapPin,
    Globe,
    Calendar,
    PackageSearch,
    ShoppingBag,
    Flag,
    ClipboardList,
    PackageOpen,
    MessageSquare,
    User,
    PlusCircle,
    Tractor,
    Phone,
    Mail,
    ArrowUpRightIcon,
    ShieldCheck,
    Store,
    Receipt,
    Factory,
    Scale,
    Users,
    Activity
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PartnerDTO, IncomingRequestDTO } from "@/data-access/connections.dal";
import { cn } from "@/lib/utils";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { TenderSelectDTO } from "@/data-access/tenders.dal";
import { calculateCompanyScore } from "@/lib/utils/profile-score";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { getFarmerAnalyticsAction } from "@/actions/agromonitoring.actions";
import { CreateTenderModal } from "@/components/dashboard/company/create-tender-modal";
import { ViewBidsModal } from "@/components/dashboard/company/view-bids-modal";
import { ProductDetailModal } from "@/components/dashboard/company/product-detail-modal";
import { initiateProductInquiryAction } from "@/actions/contact-direct.actions";
import { toast } from "sonner";
import { FarmerNetworkClient } from "@/components/dashboard/company/farmer-network-client";
import { SupplierProfileDetail } from "@/components/dashboard/company/supplier-profile-detail";
import { FarmerListDTO } from "@/data-access/farmers.dal";

interface CompanyDashboardTabsProps {
    companyProfile: any;
    initialSuppliers: PartnerDTO[];
    initialMarketOffers: (ProductSelectDTO & { farmer: any })[];
    initialRequests: IncomingRequestDTO[];
    initialTenders: (TenderSelectDTO & { bids: any[] })[];
    initialFarmers?: FarmerListDTO[];
    userImage?: string | null;
}

export function CompanyDashboardTabs({
    companyProfile,
    initialSuppliers,
    initialMarketOffers,
    initialRequests,
    initialTenders,
    initialFarmers = [],
    userImage
}: CompanyDashboardTabsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") || "network";

    const [activeTab, setActiveTab] = useState(tabParam);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSupplierProfile, setSelectedSupplierProfile] = useState<PartnerDTO | null>(null);

    // Sync state with URL param
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/dashboard/company?tab=${value}`, { scroll: false });
    };

    // Modals state
    const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
    const [isViewBidsModalOpen, setIsViewBidsModalOpen] = useState(false);
    const [selectedTender, setSelectedTender] = useState<any>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isContacting, setIsContacting] = useState<string | null>(null);

    // Market-specific filters
    const [marketCategory, setMarketCategory] = useState("all");
    const [marketCity, setMarketCity] = useState("all");

    // Monitoring state
    const [selectedMonitorSupplier, setSelectedMonitorSupplier] = useState<PartnerDTO | null>(
        initialSuppliers.length > 0 ? initialSuppliers[0] : null
    );
    const [monitorAnalytics, setMonitorAnalytics] = useState<any>(null);
    const [isLoadingMonitor, setIsLoadingMonitor] = useState(false);
    const [isMonitorTimeout, setIsMonitorTimeout] = useState(false);
    const [monitorError, setMonitorError] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === "monitoring" && selectedMonitorSupplier?.parcelPolygonId) {
            const fetchAnalytics = async () => {
                setIsLoadingMonitor(true);
                setIsMonitorTimeout(false);
                setMonitorError(null);
                setMonitorAnalytics(null);
                try {
                    const result = await getFarmerAnalyticsAction(selectedMonitorSupplier.parcelPolygonId!);
                    if (result.isTimeout) {
                        setIsMonitorTimeout(true);
                    } else if (result.error === "INVALID_ID") {
                        setMonitorError("INVALID_ID");
                    } else if (result.data) {
                        setMonitorAnalytics(result.data);
                    } else {
                        setMonitorError("FETCH_ERROR");
                    }
                } catch (error) {
                    console.error("Error fetching monitor analytics:", error);
                    setMonitorError("FETCH_ERROR");
                } finally {
                    setIsLoadingMonitor(false);
                }
            };
            fetchAnalytics();
        }
    }, [activeTab, selectedMonitorSupplier]);

    const filteredSuppliers = initialSuppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMarket = initialMarketOffers.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.farmer.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = marketCategory === "all" || m.category.toLowerCase() === marketCategory.toLowerCase();
        const matchesCity = marketCity === "all" || (m.farmer?.city || "").toLowerCase().includes(marketCity.toLowerCase());
        return matchesSearch && matchesCategory && matchesCity;
    });

    // Derive unique categories and cities from offers for filter dropdowns
    const marketCategories = Array.from(new Set(initialMarketOffers.map(m => m.category).filter(Boolean)));
    const marketCities = Array.from(new Set(initialMarketOffers.map(m => m.farmer?.city).filter(Boolean)));

    const filteredRequests = initialRequests.filter(r =>
        r.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTenders = initialTenders.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContactSeller = async (product: any) => {
        const farmerId = product.farmer?.id;
        if (!farmerId || isContacting) return;

        setIsContacting(product.id);
        const result = await initiateProductInquiryAction({
            farmerId,
            product
        });

        if (result.error) {
            toast.error(result.error);
            setIsContacting(null);
        } else {
            router.push(`/dashboard/company/messages`);
        }
    };

    const handleSupplierClick = (supplier: PartnerDTO) => {
        setSelectedSupplierProfile(supplier);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-4 mt-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-[#2c5f42] uppercase tracking-wider">
                        {activeTab === "network" && "Réseau Agriculteurs"}
                        {activeTab === "suppliers" && "Mes Fournisseurs"}
                        {activeTab === "monitoring" && "Sourcing & Monitoring"}
                        {activeTab === "market" && "Place de Marché"}
                        {activeTab === "tenders" && "Appels d'Offres"}
                        {activeTab === "requests" && "Demandes Reçues"}
                        {activeTab === "profile" && "Mon Espace Business"}
                    </h2>
                    {activeTab === "tenders" && (
                        <Button
                            onClick={() => setIsTenderModalOpen(true)}
                            size="sm"
                            className="h-7 rounded-lg bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 shadow-sm font-bold text-[10px] uppercase tracking-wider px-3"
                        >
                            <PlusCircle className="size-3 mr-1.5" />
                            Créer
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Market-specific filters */}
                    {activeTab === "market" && (
                        <>
                            <Select value={marketCategory} onValueChange={setMarketCategory}>
                                <SelectTrigger className="h-8 w-36 text-[11px] font-bold bg-slate-50/50 border-border shadow-none rounded-lg">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent className="text-[12px]">
                                    <SelectItem value="all" className="font-bold">Toutes catégories</SelectItem>
                                    {marketCategories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={marketCity} onValueChange={setMarketCity}>
                                <SelectTrigger className="h-8 w-32 text-[11px] font-bold bg-slate-50/50 border-border shadow-none rounded-lg">
                                    <SelectValue placeholder="Ville" />
                                </SelectTrigger>
                                <SelectContent className="text-[12px]">
                                    <SelectItem value="all" className="font-bold">Toutes villes</SelectItem>
                                    {marketCities.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                    <div className="relative w-56 group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-[12px] bg-slate-50/50 border-border focus:bg-white transition-all shadow-none"
                        />
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} className="mt-2">
                {/* Réseau Tab */}
                <TabsContent value="network" className="m-0">
                    <FarmerNetworkClient
                        initialFarmers={initialFarmers}
                        initialSuppliers={initialSuppliers}
                    />
                </TabsContent>

                {/* Market Tab */}
                <TabsContent value="market" className="m-0">
                    {filteredMarket.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center gap-3 border border-dashed border-[#c8dfd0] rounded-xl bg-slate-50/50">
                            <ShoppingBag className="size-8 text-[#a8d5be]" />
                            <p className="text-[12px] font-bold text-slate-400">Aucune offre disponible.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredMarket.map((m) => {
                                const mainImage = m.images?.[0] || null;
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedProduct(m);
                                            setIsProductModalOpen(true);
                                        }}
                                        className="group cursor-pointer bg-white rounded-xl border border-border hover:border-[#c8dfd0] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                                    >
                                        {/* Image */}
                                        <div className="h-40 bg-[#f8fdf9] border-b border-[#e0ede5] overflow-hidden shrink-0 relative flex items-center justify-center">
                                            {mainImage ? (
                                                <img
                                                    src={mainImage}
                                                    alt={m.name}
                                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f8fdf9] to-[#f0f8f4]">
                                                    <Tractor className="size-12 text-[#c4dece]" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col gap-3 flex-1">
                                            {/* Category + Name */}
                                            <div>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{m.category}</p>
                                                <h3 className="text-[14px] font-semibold text-slate-800 leading-snug capitalize">{m.name}</h3>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[18px] font-semibold text-[#2c5f42] tabular-nums">{m.price}</span>
                                                <span className="text-[11px] text-slate-400 font-normal">MAD / {m.unit}</span>
                                            </div>

                                            {/* Stock */}
                                            <div className="flex items-center gap-1.5">
                                                <div className="size-1.5 rounded-full bg-[#2c5f42]/50 shrink-0" />
                                                <span className="text-[11px] text-slate-500">
                                                    {m.stockQuantity} {m.unit} disponibles
                                                </span>
                                            </div>

                                            {/* Separator */}
                                            <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                                                <Avatar className="size-5 rounded-md border border-border shrink-0">
                                                    <AvatarImage src={m.farmer?.avatarUrl || undefined} className="object-cover" />
                                                    <AvatarFallback className="text-[8px] font-medium bg-slate-50 text-slate-500">
                                                        {m.farmer?.fullName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-[11px] text-slate-500 truncate flex-1">{m.farmer?.fullName}</span>
                                                <ArrowUpRightIcon className="size-3.5 text-slate-300 group-hover:text-[#2c5f42] transition-colors shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Suppliers Tab */}
                <TabsContent value="suppliers" className="m-0">
                    {selectedSupplierProfile ? (
                        <SupplierProfileDetail
                            supplier={selectedSupplierProfile}
                            onBack={() => setSelectedSupplierProfile(null)}
                        />
                    ) : (
                        <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-[#f8fdf9]">
                                    <TableRow className="border-border hover:bg-transparent h-10">
                                        <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight pl-4">Partenaire</TableHead>
                                        <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Depuis le</TableHead>
                                        <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Status</TableHead>
                                        <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Localisation</TableHead>
                                        <TableHead className="text-right pr-4"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSuppliers.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 italic font-medium text-[12px]">Aucun fournisseur partenaire.</TableCell></TableRow>
                                    ) : filteredSuppliers.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            className="border-slate-50 hover:bg-slate-50/20 h-14 cursor-pointer"
                                            onClick={() => handleSupplierClick(s)}
                                        >
                                            <TableCell className="pl-4 py-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                        <AvatarImage src={s.avatarUrl || ""} />
                                                        <AvatarFallback className="text-[10px] font-bold bg-slate-50 text-slate-400">{s.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[13px] text-slate-900">{s.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Producteur Partenaire</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[12px] text-slate-500 font-bold tabular-nums">
                                                {format(new Date(s.since), "d MMM yyyy", { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-bold rounded-md px-2 py-0.5 uppercase tracking-wider">Actif</Badge>
                                            </TableCell>
                                            <TableCell className="text-[12px] text-slate-500 font-bold">
                                                <div className="flex items-center gap-1.5"><MapPin className="size-3 opacity-40 text-slate-400" /> {s.location}</div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSupplierClick(s);
                                                    }}
                                                    className="h-8 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-wider"
                                                >
                                                    Profil <ArrowUpRightIcon className="size-3 ml-1" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
                {/* Sourcing & Monitoring Tab */}
                <TabsContent value="monitoring" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-fit">
                            <div className="px-4 py-3 border-b border-border bg-[#f8fdf9]">
                                <h3 className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest">Sourcing Actif</h3>
                            </div>
                            <div className="p-2 space-y-1">
                                {initialSuppliers.length === 0 ? (
                                    <p className="p-4 text-center text-[11px] text-slate-400 italic">Aucun fournisseur à monitorer.</p>
                                ) : initialSuppliers.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedMonitorSupplier(s)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 border",
                                            selectedMonitorSupplier?.id === s.id ? "bg-[#f0f8f4] text-[#2c5f42] border-[#c8dfd0] shadow-sm" : "border-transparent hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <Avatar className="size-6 rounded-md border border-white/20 shrink-0">
                                            <AvatarImage src={s.avatarUrl || ""} />
                                            <AvatarFallback className="text-[9px] font-bold bg-slate-100 text-[#4a8c5c]">{s.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn("text-[11px] font-bold truncate", selectedMonitorSupplier?.id === s.id ? "text-[#2c5f42]" : "text-slate-700")}>{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-6">
                            {selectedMonitorSupplier ? (
                                <>
                                    <div className="flex items-center gap-2 mb-2 bg-white border border-border p-4 rounded-xl shadow-sm">
                                        <Globe className="size-5 text-[#2c5f42]" />
                                        <h3 className="text-[14px] font-bold text-slate-900 tracking-wider uppercase">Monitoring : {selectedMonitorSupplier.name}</h3>
                                    </div>

                                    {!selectedMonitorSupplier.parcelPolygonId ? (
                                        <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                            <div className="text-center space-y-3 max-w-sm px-6">
                                                <Tractor className="size-10 text-slate-200 mx-auto" />
                                                <p className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest leading-relaxed">
                                                    Données Agricoles Indisponibles
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                    Le producteur <strong>{selectedMonitorSupplier.name}</strong> n&apos;a pas encore synchronisé ses coordonnées géospatiales.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {isLoadingMonitor && (
                                                <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/10 animate-pulse">
                                                    <div className="text-center space-y-4">
                                                        <Globe className="size-10 text-blue-500 mx-auto animate-bounce opacity-40 shadow-blue-500/20 shadow-2xl" />
                                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                            Consultation du service satellite
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                            Récupération de l&apos;imagerie NDVI pour <strong>{selectedMonitorSupplier.name}</strong>...
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {!isLoadingMonitor && (isMonitorTimeout || monitorError === "FETCH_ERROR") && (
                                                <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm">
                                                            <Activity className="size-5 text-amber-600" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Données de Monitoring Indisponibles</p>
                                                            <p className="text-[11px] font-medium text-amber-600">
                                                                {isMonitorTimeout
                                                                    ? "L'API satellite est ralentie ou votre parcelle est en attente de données. Réessayez bientôt."
                                                                    : "Une erreur est survenue lors de la récupération des données satellite."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="h-9 rounded-xl border-amber-200 bg-white text-amber-700 hover:bg-amber-100 text-[10px] font-bold uppercase tracking-widest px-6"
                                                        onClick={() => window.location.reload()}
                                                    >
                                                        Réessayer
                                                    </Button>
                                                </div>
                                            )}

                                            {!isLoadingMonitor && monitorError === "INVALID_ID" && (
                                                <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
                                                    <div className="text-center space-y-3 max-w-sm px-6">
                                                        <Tractor className="size-10 text-slate-300 mx-auto" />
                                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                            Synchronisation en cours
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                            Le lien satellite pour <strong>{selectedMonitorSupplier.name}</strong> est en cours d&apos;établissement. Ces données seront visibles d&apos;ici quelques instants.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {!isLoadingMonitor && !isMonitorTimeout && !monitorError && (
                                                <>
                                                    <NdviChart
                                                        data={monitorAnalytics?.ndvi || []}
                                                        isSyncing={isLoadingMonitor}
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <WeatherCard
                                                            current={monitorAnalytics?.weather}
                                                            forecast={monitorAnalytics?.forecast}
                                                            locationName={selectedMonitorSupplier.location}
                                                            isSyncing={isLoadingMonitor}
                                                        />
                                                        <SoilCard
                                                            data={monitorAnalytics?.soil}
                                                            isSyncing={isLoadingMonitor}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-border rounded-2xl bg-white/50">
                                    <Globe className="size-16 opacity-10 mb-4" />
                                    <p className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Sélectionnez un fournisseur</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>



                {/* Tenders Tab */}
                <TabsContent value="tenders" className="m-0 space-y-6 text-left">
                    <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
                        <div className="bg-[#f8fdf9] p-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-[14px] font-bold text-[#2c5f42]">Catalogue d&apos;Appels d&apos;Offres</h3>
                                <p className="text-[11px] text-slate-500">Gérez vos demandes de volumes et visualisez les offres des producteurs.</p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-[#f8fdf9]">
                                <TableRow className="border-border hover:bg-transparent h-10">
                                    <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight pl-4">Appel d&apos;Offre</TableHead>
                                    <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Besoin</TableHead>
                                    <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Status</TableHead>
                                    <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Propositions</TableHead>
                                    <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Deadline</TableHead>
                                    <TableHead className="text-right pr-4 font-bold"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTenders.length === 0 ? (
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell colSpan={6} className="h-40 text-center text-slate-400 italic font-medium text-[12px] bg-slate-50/50 rounded-b-xl border-dashed border-t border-border">
                                            Aucun appel d&apos;offre publié.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTenders.map((t) => (
                                    <TableRow key={t.id} className="border-slate-50 hover:bg-slate-50/20 h-14">
                                        <TableCell className="pl-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[13px] text-slate-900">{t.title}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[12px] font-black text-slate-900">
                                            {t.quantity} {t.unit}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] font-black rounded-full border-none px-2 py-0.5 uppercase tracking-wider",
                                                t.status === "OPEN" ? "bg-[#f0f8f4] text-[#2c5f42]" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {t.status === "OPEN" ? "OUVERT" : t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "size-2 rounded-full",
                                                    (t.bids?.length || 0) > 0 ? "bg-[#4a8c5c] animate-pulse" : "bg-slate-200"
                                                )} />
                                                <span className="text-[12px] font-bold text-slate-700">{t.bids?.length || 0} offre(s)</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[12px] text-slate-500 font-bold tabular-nums">
                                            {format(new Date(t.deadline), "d MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTender(t);
                                                    setIsViewBidsModalOpen(true);
                                                }}
                                                className="h-8 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-wider"
                                            >
                                                Gérer <ArrowUpRightIcon className="size-3 ml-1" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Requests/Proposals Tab */}
                <TabsContent value="requests" className="border border-border rounded-xl bg-white overflow-hidden shadow-sm m-0 text-left">
                    <Table>
                        <TableHeader className="bg-[#f8fdf9]">
                            <TableRow className="border-border hover:bg-transparent h-10">
                                <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight pl-4">Expéditeur</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Type</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-tight">Date</TableHead>
                                <TableHead className="text-right pr-4 font-bold"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 italic font-medium text-[12px]">Aucune demande en attente.</TableCell></TableRow>
                            ) : filteredRequests.map((r) => (
                                <TableRow key={r.id} className="border-slate-50 hover:bg-slate-50/20 h-14">
                                    <TableCell className="pl-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={r.senderLogo || ""} />
                                                <AvatarFallback className="text-[10px] bg-slate-50">{r.senderName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[13px] text-slate-900">{r.senderName}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{r.location || "Producteur Agricole"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md border-none px-2 py-0.5">
                                            PARTENARIAT
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-bold rounded-full px-2 py-0.5">EN COURS</Badge>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-bold tabular-nums">
                                        {format(new Date(r.sentAt), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <Button asChild variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                                            <a href="/dashboard/company/requests">Détails</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Company Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-[#f8fdf9] border-b border-border p-6 text-left">
                                    <div className="flex items-center gap-2 text-[#4a8c5c] mb-1">
                                        <Building2 className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Identité Corporate</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{companyProfile.companyName}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-500">
                                        Type: {companyProfile.companyType} • {companyProfile.city}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <MapPin className="size-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siège Social</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.city}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Factory className="size-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secteur</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.industry}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Calendar className="size-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Année Création</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.establishedYear}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Scale className="size-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conformité</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] font-bold text-[10px] uppercase">ICE: {companyProfile.iceNumber}</Badge>
                                                        <Badge variant="outline" className="bg-white text-slate-500 border-border font-bold text-[10px] uppercase">RC: {companyProfile.rcNumber}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-[#f8fdf9] border-b border-border p-6 text-left">
                                    <div className="flex items-center gap-2 text-[#4a8c5c] mb-1">
                                        <PackageSearch className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Stratégie Sourcing</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Besoins & Logistique</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Volume Annuel</div>
                                                <div className="p-4 rounded-xl bg-slate-50 border border-border">
                                                    <div className="text-[15px] font-semibold text-slate-900">{companyProfile.purchasingCapacity}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Capacité d&apos;achat estimée</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Sourcing</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                            <Phone className="size-3.5" />
                                                        </div>
                                                        <div className="text-[13px] font-bold text-slate-900 tabular-nums">{companyProfile.phone}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                            <Mail className="size-3.5" />
                                                        </div>
                                                        <div className="text-[13px] font-bold text-slate-900">{companyProfile.businessEmail}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Company Summary Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8 text-center space-y-4">
                                    <Avatar className="mx-auto w-24 h-24 ring-4 ring-slate-100 shadow-sm">
                                        <AvatarImage src={companyProfile.logoUrl || userImage || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-slate-50 text-slate-300 text-2xl font-black">
                                            {companyProfile.companyName?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {calculateCompanyScore(companyProfile) >= 80 ? "Acheteur Certifié" : "Acheteur Business"}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">Actif sur Agri-Mar</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="border border-border rounded-xl p-5 bg-[#f8fdf9] border-l-2 border-l-[#2c5f42] text-left">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="size-4 text-[#4a8c5c]" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#2c5f42]">
                                        {calculateCompanyScore(companyProfile) >= 80 ? "Compte Certifié" : "Score de Confiance"}
                                    </span>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed mb-4 font-medium">
                                    {calculateCompanyScore(companyProfile) >= 80
                                        ? "Votre badge \"Confiance B2B\" est actif. Il rassure les producteurs sur votre sérieux."
                                        : "Vérifiez votre ICE et votre RC pour obtenir le badge de confiance Agri-Mar."}
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <ProductDetailModal
                isOpen={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
                product={selectedProduct}
                onContactSeller={handleContactSeller}
                isContacting={isContacting === selectedProduct?.id}
            />

            <CreateTenderModal
                isOpen={isTenderModalOpen}
                onOpenChange={setIsTenderModalOpen}
            />

            <ViewBidsModal
                isOpen={isViewBidsModalOpen}
                onOpenChange={setIsViewBidsModalOpen}
                tender={selectedTender}
            />

        </div>
    );
}
