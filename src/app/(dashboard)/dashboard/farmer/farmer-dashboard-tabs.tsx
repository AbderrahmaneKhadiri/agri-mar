"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, History, Clock, ArrowUpRightIcon, MapPin, Droplets, Building2, LandPlot, ShieldCheck, Waves, Truck, Store, LayoutGrid, Phone, Mail, Globe, Calendar, Briefcase, Boxes, Zap, Plus, ShoppingBag, Sprout, Users, Trash2, UserMinus, Eye, Pencil, Trash, Activity, Thermometer, CloudRain, Sun, MessageSquare, Check, X, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { BidTenderModal } from "@/components/dashboard/farmer/bid-tender-modal";
import { HarvestPlanning } from "@/components/dashboard/farmer/harvest-planning";
import { ExpenseTracker } from "@/components/dashboard/farmer/expense-tracker";
import { AgroAnalyticsChart } from "@/components/dashboard/agro-analytics-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { AdvancedInsightsGrid } from "@/components/dashboard/advanced-insights-grid";
import { SatelliteVisionCard } from "@/components/dashboard/satellite-vision-card";
import { HistoryAnalyticsChart } from "@/components/dashboard/history-analytics-chart";
import { PerformanceBadge } from "@/components/dashboard/performance-badge";
import { LogbookTab } from "@/components/dashboard/farmer/logbook-tab";
import { ClipboardCheck } from "lucide-react";
import { TenderSelectDTO, TenderBidSelectDTO } from "@/data-access/tenders.dal";
import { HarvestPlanSelectDTO } from "@/data-access/harvests.dal";
import { IncomingRequestDTO, PartnerDTO } from "@/data-access/connections.dal";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { ProductDetailModal } from "@/components/dashboard/company/product-detail-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateFarmerScore } from "@/lib/utils/profile-score";
import { DirectProposalModal } from "@/components/dashboard/farmer/direct-proposal-modal";
import { PartnerProfileModal } from "@/components/dashboard/farmer/partner-profile-modal";
import { resignConnectionAction, respondConnectionAction } from "@/actions/networking.actions";
import { toast } from "sonner";
import { AddProductModal } from "@/components/dashboard/farmer/add-product-modal";
import { EditProductModal } from "@/components/dashboard/farmer/edit-product-modal";
import { syncCatalogWithHarvestsAction, deleteProductAction } from "@/actions/products.actions";
import { deleteBidAction } from "@/actions/tenders.actions";
import { BidDetailsModal } from "@/components/dashboard/farmer/bid-details-modal";
import { RefreshCw, AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FarmerDashboardTabsProps {
    profile: any;
    initialRequests: IncomingRequestDTO[];
    initialPartners: PartnerDTO[];
    initialProducts: ProductSelectDTO[];
    initialOpenTenders: (TenderSelectDTO & { company: any })[];
    initialFarmerBids: (TenderBidSelectDTO & { tender: any })[];
    initialFarmerQuotes: any[];
    initialHarvestPlans: HarvestPlanSelectDTO[];
    initialExpenses: any[];
    userImage?: string | null;
    ndviData?: any[];
    currentWeather?: any;
    weatherForecast?: any;
    soilData?: any;
    isSyncing?: boolean;
    polygonId?: string;
    satelliteScenes?: any[];
    geoJson?: any;
    advancedData?: any;
    performanceHistory?: any;
    initialFarmLogs?: any[];
    initialParcels?: any[];
}

export function FarmerDashboardTabs({
    profile,
    initialRequests,
    initialPartners,
    initialProducts,
    initialOpenTenders,
    initialFarmerBids,
    initialFarmerQuotes = [],
    initialHarvestPlans,
    initialExpenses,
    userImage,
    ndviData = [],
    currentWeather = null,
    weatherForecast = null,
    soilData = null,
    isSyncing = false,
    polygonId = "",
    satelliteScenes = [],
    geoJson = null,
    advancedData = null,
    performanceHistory = null,
    initialFarmLogs = [],
    initialParcels = []
}: FarmerDashboardTabsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") || "requests";

    const [activeTab, setActiveTab] = useState(tabParam);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState(initialProducts);
    const [farmLogs, setFarmLogs] = useState(initialFarmLogs);

    // Sync state with props when server data changes
    useEffect(() => {
        setProducts(initialProducts);
        setFarmLogs(initialFarmLogs);
    }, [initialProducts, initialFarmLogs]);

    // Sync state with URL param
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/dashboard/farmer?tab=${value}`, { scroll: false });
    };

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        confirmText?: string;
        variant?: "destructive" | "default" | "success";
        icon?: React.ElementType;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const handleDeleteBid = async (bidId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Supprimer la proposition ?",
            description: "Cette action est irréversible. Votre proposition sera définitivement supprimée de l'appel d'offres.",
            confirmText: "Supprimer",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    const result = await deleteBidAction(bidId);
                    if (result.success) {
                        toast.success("Proposition supprimée avec succès");
                        router.refresh();
                    } else {
                        toast.error(result.error || "Erreur lors de la suppression");
                    }
                } catch (error) {
                    toast.error("Erreur réseau");
                }
            }
        });
    };

    const handleViewBidDetails = (bid: any) => {
        setSelectedBidForDetails(bid);
        setIsBidDetailsModalOpen(true);
    };

    const [requests, setRequests] = useState<IncomingRequestDTO[]>(initialRequests);
    const [isProcessingRequest, setIsProcessingRequest] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<IncomingRequestDTO | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const filteredRequests = requests.filter(req =>
        req.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPartners = initialPartners.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRequestAction = async (connectionId: string, status: "ACCEPTED" | "REJECTED") => {
        setConfirmConfig({
            isOpen: true,
            title: status === "ACCEPTED" ? "Accepter la demande ?" : "Décliner la demande ?",
            description: status === "ACCEPTED"
                ? "En acceptant, cette entreprise pourra voir vos données d'exploitation et vous proposer des contrats."
                : "Voulez-vous vraiment refuser cette demande de connexion ? Cette action est irréversible.",
            confirmText: status === "ACCEPTED" ? "Accepter" : "Décliner",
            variant: status === "ACCEPTED" ? "success" : "destructive",
            icon: status === "ACCEPTED" ? ShieldCheck : X,
            onConfirm: async () => {
                setIsProcessingRequest(connectionId);
                try {
                    const result = await respondConnectionAction({ connectionId, response: status });
                    if (result.error) {
                        toast.error(result.error);
                    } else {
                        setRequests(prev => prev.map(r => r.id === connectionId ? { ...r, status } : r));
                        toast.success(status === "ACCEPTED" ? "Demande acceptée" : "Demande refusée");
                        router.refresh();
                    }
                } catch (error) {
                    toast.error("Erreur réseau");
                } finally {
                    setIsProcessingRequest(null);
                }
            }
        });
    };

    const handleViewRequestProfile = (request: IncomingRequestDTO) => {
        setSelectedRequest(request);
        setIsRequestModalOpen(true);
    };

    const filteredOpenTenders = initialOpenTenders.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBids = [
        ...initialFarmerBids.map(b => ({
            id: b.id,
            title: b.tender.title,
            companyName: b.tender.company?.companyName,
            price: b.proposedPrice,
            quantity: b.proposedQuantity,
            unit: b.tender.unit,
            status: b.status,
            message: b.message,
            createdAt: b.createdAt,
            type: "BID" as const
        })),
        ...initialFarmerQuotes.map(q => ({
            id: q.id,
            title: q.productName,
            companyName: q.connection?.company?.companyName,
            price: q.unitPrice,
            quantity: q.quantity,
            unit: "u", // Default unit for quotes if not specified
            status: q.status,
            message: q.notes,
            createdAt: q.createdAt,
            type: "QUOTE" as const
        }))
    ].filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Product Detail Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Bidding State
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [selectedTender, setSelectedTender] = useState<any>(null);

    // Direct Proposal State
    const [isDirectProposalModalOpen, setIsDirectProposalModalOpen] = useState(false);

    // Catalog State
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [selectedEditProduct, setSelectedEditProduct] = useState<ProductSelectDTO | null>(null);

    const [selectedBidForDetails, setSelectedBidForDetails] = useState<any | null>(null);
    const [isBidDetailsModalOpen, setIsBidDetailsModalOpen] = useState(false);

    const handleEditProduct = (product: ProductSelectDTO, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEditProduct(product);
        setIsEditProductModalOpen(true);
    };

    // Partner Profile Modal State
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);

    const handleViewPartner = (partner: PartnerDTO) => {
        setSelectedPartner(partner);
        setIsPartnerModalOpen(true);
    };

    const handleViewProductDetail = (product: any) => {
        // Inject the current farmer's profile data so the modal shows real info
        const name = profile?.farmName || profile?.fullName || profile?.name || "Producteur";
        const enriched = {
            ...product,
            farmer: {
                id: profile?.id,
                fullName: name,
                avatarUrl: userImage || profile?.avatarUrl,
                region: profile?.region,
                city: profile?.city,
                iceNumber: profile?.iceNumber,
                parcels: profile?.parcels || [],
            },
        };
        setSelectedProduct(enriched);
        setIsProductModalOpen(true);
    };

    const handleOpenBidModal = (tender: any) => {
        setSelectedTender(tender);
        setIsBidModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: "Supprimer du catalogue ?",
            description: "Êtes-vous sûr de vouloir retirer ce produit de votre catalogue de vente ?",
            confirmText: "Supprimer",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteProductAction(productId);
                if (result.success) {
                    toast.success("Produit supprimé avec succès");
                    setProducts(products.filter(p => p.id !== productId));
                } else {
                    toast.error(result.error || "Erreur lors de la suppression");
                }
            }
        });
    };

    const handleResign = async (partnerId: string, partnerName: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Résilier le partenariat ?",
            description: `Voulez-vous vraiment mettre fin à votre collaboration avec ${partnerName} ?`,
            confirmText: "Résilier",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    const result = await resignConnectionAction(partnerId);
                    if (result.success) {
                        toast.success("Partenariat résilié avec succès");
                        router.refresh();
                    } else {
                        toast.error(result.error || "Erreur lors de la résiliation");
                    }
                } catch (error) {
                    toast.error("Erreur réseau");
                }
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="hidden items-center justify-between border-b border-border pb-0 mt-2">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                    <TabsList variant="line" className="bg-transparent gap-8 h-auto p-0 border-b-0">
                        {/* Tab triggers are now hidden as sidebar handles this, 
                            but we keep the Tabs component for switching logic */}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 pb-4">
                    <div className="relative w-64 group">
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
                <TabsContent value="requests" className="m-0">
                    {filteredRequests.length === 0 ? (
                        <div className="border border-dashed border-[#d4e9dc] rounded-2xl h-48 flex flex-col items-center justify-center bg-[#f8fdf9]/30 mt-4">
                            <Clock className="size-8 text-slate-200 mb-2" />
                            <p className="text-slate-400 text-[13px] font-medium">Aucune demande reçue pour le moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 mt-4">
                            <div className="bg-[#f0f8f4] border border-[#d4e9dc] rounded-xl p-4 flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg border border-[#d4e9dc]">
                                    <Building2 className="size-5 text-[#2c5f42]" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-[#2c5f42] mb-0.5">Vérification des Partenariats</h4>
                                    <p className="text-[11px] text-[#4a8c5c]/80 leading-relaxed max-w-2xl">
                                        C&apos;est ici que vous gérez les entreprises qui souhaitent collaborer avec vous.
                                        Analysez leurs propositions et acceptez celles qui correspondent à vos objectifs pour les ajouter à vos partenaires officiels.
                                    </p>
                                </div>
                            </div>

                            <div className="border border-[#d4e9dc] rounded-2xl bg-white overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-[#f8fdf9]">
                                        <TableRow className="border-[#d4e9dc] hover:bg-transparent h-10">
                                            <TableHead className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-tight pl-6">Entreprise</TableHead>
                                            <TableHead className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-tight">Secteur</TableHead>
                                            <TableHead className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-tight">Date</TableHead>
                                            <TableHead className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-tight">État</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.map((req) => (
                                            <TableRow key={req.id} className="border-[#f0f8f4] hover:bg-[#f8fdf9]/30 h-14 group transition-colors">
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9 rounded-xl ring-2 ring-[#f0f8f4]">
                                                            <AvatarImage src={req.senderLogo || ""} />
                                                            <AvatarFallback className="text-[10px] font-bold bg-[#f0f8f4] text-[#2c5f42] uppercase">
                                                                {req.senderName?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-bold text-[13px] text-slate-900 group-hover:text-[#2c5f42] transition-colors">{req.senderName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[12px] text-slate-500 font-medium">
                                                    <Badge variant="secondary" className="bg-[#f0f8f4] text-[#4a8c5c] border-none text-[9px] font-bold uppercase tracking-wider">
                                                        {req.senderIndustry || "Secteur non spécifié"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[12px] font-bold text-slate-400 tabular-nums">
                                                    {format(new Date(req.sentAt), "d MMM yyyy", { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit",
                                                        req.status === "PENDING" ? "bg-[#f0f8f4] text-[#4a8c5c]" :
                                                            req.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600" :
                                                                "bg-red-50 text-red-600"
                                                    )}>
                                                        {req.status === "PENDING" ? "En attente" : req.status === "ACCEPTED" ? "Accepté" : "Refusé"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {req.status === "PENDING" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleRequestAction(req.id, "ACCEPTED")}
                                                                    disabled={!!isProcessingRequest}
                                                                    className="h-8 px-3 bg-[#2c5f42] text-white border-none hover:bg-[#2c5f42]/90 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-none transition-all"
                                                                >
                                                                    {isProcessingRequest === req.id ? <RefreshCw className="size-3 animate-spin" /> : "Accepter"}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleRequestAction(req.id, "REJECTED")}
                                                                    disabled={!!isProcessingRequest}
                                                                    className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                                                                >
                                                                    Décliner
                                                                </Button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewRequestProfile(req)}
                                                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="size-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="partners" className="m-0">
                    {filteredPartners.length === 0 ? (
                        <div className="border border-dashed border-[#d4e9dc] rounded-2xl h-48 flex flex-col items-center justify-center bg-[#f8fdf9]/40">
                            <Users className="size-8 text-[#4a8c5c]/20 mb-2" />
                            <p className="text-[#4a8c5c]/50 text-[13px] font-medium">Aucun partenaire actif pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPartners.map((partner) => (
                                <Card key={partner.id} className="group border border-[#d4e9dc] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl">
                                    <div className="h-1.5 bg-[#2c5f42]" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-start gap-4 mb-6">
                                            <Avatar className="size-14 rounded-xl ring-4 ring-[#f8fdf9] shadow-sm transition-transform group-hover:scale-105">
                                                <AvatarImage src={partner.avatarUrl || ""} className="object-cover" />
                                                <AvatarFallback className="bg-[#f0f8f4] text-[#4a8c5c] text-lg font-black uppercase">
                                                    {partner.name.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[15px] text-slate-900 truncate tracking-tight group-hover:text-[#2c5f42] transition-colors">
                                                    {partner.name}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Badge variant="secondary" className="bg-[#f0f8f4] text-[#4a8c5c] border-none text-[9px] font-bold uppercase tracking-wider py-0 px-2 rounded-md">
                                                        {partner.industry || "Secteur non spécifié"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => handleResign(partner.id, partner.name)}
                                                title="Résilier le partenariat"
                                            >
                                                <UserMinus className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2.5 text-slate-500">
                                                <div className="size-7 rounded-lg bg-[#f0f8f4] flex items-center justify-center text-[#4a8c5c] border border-[#d4e9dc]/50">
                                                    <MapPin className="size-3.5" />
                                                </div>
                                                <span className="text-[12px] font-medium truncate">{partner.location || "Localisation non spécifiée"}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-500">
                                                <div className="size-7 rounded-lg bg-[#f0f8f4] flex items-center justify-center text-[#4a8c5c] border border-[#d4e9dc]/50">
                                                    <Clock className="size-3.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#4a8c5c]/50 uppercase tracking-widest leading-none mb-0.5">Partenaire depuis</span>
                                                    <span className="text-[12px] font-semibold text-slate-700">
                                                        {format(new Date(partner.since), "MMM yyyy", { locale: fr })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-10 rounded-xl bg-[#f0f8f4] hover:bg-[#2c5f42] hover:text-white text-[#2c5f42] font-bold border-none transition-all duration-300 group/btn shadow-none"
                                            onClick={() => handleViewPartner(partner)}
                                        >
                                            <span className="text-[11px] uppercase tracking-widest">Voir le Profil</span>
                                            <ArrowUpRightIcon className="size-3 ml-2 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="products" className="m-0 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <ShoppingBag className="size-4 text-[#2c5f42]" />
                                Catalogue de Vente
                            </h3>
                            <p className="text-[11px] font-medium text-slate-400">Gérez vos produits disponibles sur la place de marché.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-3 hover:bg-[#2c5f42] hover:text-white transition-all group"
                            onClick={() => setIsAddProductModalOpen(true)}
                        >
                            <Plus className="size-3 mr-1.5 group-hover:rotate-90 transition-transform" />
                            Ajouter un Produit
                        </Button>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="border border-dashed border-[#d4e9dc] rounded-2xl h-48 flex flex-col items-center justify-center bg-[#f8fdf9]/30">
                            <ShoppingBag className="size-8 text-slate-200 mb-2" />
                            <p className="text-slate-400 text-[13px] font-medium">Aucun produit au catalogue pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group border border-[#d4e9dc] shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-2xl cursor-pointer"
                                    onClick={() => handleViewProductDetail(product)}
                                >
                                    <div className="aspect-video bg-[#f0f8f4] relative overflow-hidden flex items-center justify-center border-b border-[#d4e9dc]/50">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Sprout className="size-10 text-[#4a8c5c]/20 group-hover:scale-110 group-hover:text-[#2c5f42]/40 transition-all duration-500" />
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-[#2c5f42] text-white border-none text-[9px] font-black uppercase tracking-widest py-0.5 shadow-md">
                                                En Vente
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="mb-4">
                                            <h4 className="font-bold text-[14px] text-slate-900 truncate tracking-tight group-hover:text-[#2c5f42] transition-colors">{product.name}</h4>
                                            <p className="text-[10px] font-bold text-[#4a8c5c] uppercase tracking-widest mt-0.5">{product.category || "Agriculture Directe"}</p>
                                        </div>

                                        <div className="flex items-end justify-between mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Prix Moyen</span>
                                                <span className="text-[16px] font-black text-[#2c5f42] tabular-nums">
                                                    {product.price.toString()}
                                                    <span className="text-[10px] text-[#4a8c5c] font-medium ml-1">MAD/{product.unit}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 text-right">Stock</span>
                                                <span className="text-[13px] font-bold text-slate-700 tabular-nums">
                                                    {product.stockQuantity.toString()}
                                                    <span className="text-[10px] text-slate-400 font-medium ml-1">{product.unit}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                className="flex-1 h-9 rounded-xl bg-[#f0f8f4] hover:bg-[#2c5f42] hover:text-white text-[#2c5f42] font-bold border-none transition-all duration-300"
                                                onClick={(e) => handleEditProduct(product, e)}
                                            >
                                                <span className="text-[10px] uppercase tracking-widest">Modifier</span>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-9 rounded-xl bg-[#fff0f0] text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                                                onClick={(e) => handleDeleteProduct(product.id, e)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-9 rounded-xl bg-[#f0f8f4] text-[#4a8c5c] hover:bg-[#2c5f42] hover:text-white transition-all duration-300"
                                                onClick={() => handleViewProductDetail(product)}
                                            >
                                                <ArrowUpRightIcon className="size-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tenders" className="m-0 space-y-8">
                    {/* Market Opportunities */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#d4e9dc]">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#2c5f42] tracking-tight flex items-center gap-2">
                                    <Globe className="size-4 text-[#4a8c5c]" />
                                    Opportunités de Marché
                                </h3>
                                <p className="text-[11px] font-medium text-[#4a8c5c]/70">Appels d&apos;offres ouverts des entreprises partenaires.</p>
                            </div>
                        </div>

                        {filteredOpenTenders.length === 0 ? (
                            <div className="border border-dashed border-[#d4e9dc] rounded-2xl h-32 flex items-center justify-center bg-[#f8fdf9]/40">
                                <p className="text-[#4a8c5c]/50 text-[12px] italic">Aucune opportunité ouverte pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredOpenTenders.map((t) => (
                                    <Card key={t.id} className="group border border-[#d4e9dc] shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-2xl">
                                        <div className="h-1.5 bg-[#f0f8f4]" />
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Avatar className="size-12 rounded-xl border border-[#f0f8f4] shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                    <AvatarImage src={t.company?.logoUrl || ""} className="object-cover" />
                                                    <AvatarFallback className="bg-[#f0f8f4] text-[#4a8c5c] text-base font-bold">
                                                        {t.company?.companyName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-[14px] text-slate-900 truncate tracking-tight group-hover:text-[#2c5f42] transition-colors">{t.title}</h4>
                                                    <p className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-widest mt-0.5">{t.company?.companyName}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="p-3 rounded-xl bg-[#f0f8f4]/30 border border-[#d4e9dc]/20">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Besoin</span>
                                                    <span className="text-[13px] font-black text-slate-900">{t.quantity} <span className="text-[10px] text-slate-500 font-medium">{t.unit}</span></span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50">
                                                    <span className="text-[9px] font-bold text-[#4a8c5c] uppercase tracking-widest block mb-1">Prix Visé</span>
                                                    <span className="text-[13px] font-black text-[#2c5f42]">{t.targetPrice ? `${t.targetPrice} MAD/u` : "Offre"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="size-3.5" />
                                                    <span className="text-[11px] font-semibold">Deadline: {format(new Date(t.deadline), "d MMM yyyy", { locale: fr })}</span>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-bold bg-[#f0f8f4] text-[#4a8c5c] border-none uppercase py-0.5">OUVERT</Badge>
                                            </div>

                                            <Button
                                                onClick={() => handleOpenBidModal(t)}
                                                className="w-full h-10 rounded-xl bg-[#2c5f42] hover:bg-[#1a3d2a] text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-[#2c5f42]/20 transition-all hover:scale-[1.02]"
                                            >
                                                Postuler Maintenant
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Proposals */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#d4e9dc]">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#2c5f42] tracking-tight flex items-center gap-2">
                                    <Briefcase className="size-4 text-[#4a8c5c]" />
                                    Mes Propositions
                                </h3>
                                <p className="text-[11px] font-medium text-[#4a8c5c]/70">Suivi de vos réponses aux appels d&apos;offres.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-3 hover:bg-[#2c5f42] hover:text-white transition-all group"
                                onClick={() => setIsDirectProposalModalOpen(true)}
                            >
                                <Plus className="size-3 mr-1.5 group-hover:rotate-90 transition-transform" />
                                Nouvelle Proposition
                            </Button>
                        </div>

                        {filteredBids.length === 0 ? (
                            <div className="border border-dashed border-[#d4e9dc] rounded-2xl h-32 flex items-center justify-center bg-[#f8fdf9]/30">
                                <p className="text-slate-400 text-[12px] italic">Vous n&apos;avez pas encore soumis de proposition.</p>
                            </div>
                        ) : (
                            <div className="border border-[#d4e9dc]/50 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <Table>
                                    <TableHeader className="bg-[#f0f8f4]/50">
                                        <TableRow className="hover:bg-transparent border-[#d4e9dc]/50">
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Statut</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Produit</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Entreprise</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Mon Prix</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Ma Quantité</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10">Date</TableHead>
                                            <TableHead className="text-[10px] font-black text-[#2c5f42] uppercase tracking-widest h-10 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBids.map((b) => (
                                            <TableRow key={b.id} className="border-[#d4e9dc]/30 hover:bg-[#f0f8f4]/30 transition-colors group">
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] font-black border-none px-2 rounded-full uppercase tracking-tighter",
                                                        b.status === "PENDING" ? "bg-[#f0f8f4] text-[#4a8c5c]" :
                                                            b.status === "ACCEPTED" ? "bg-[#2c5f42] text-white" :
                                                                "bg-red-50 text-red-600"
                                                    )}>
                                                        {b.status === "PENDING" ? "EN ATTENTE" : b.status === "ACCEPTED" ? "ACCEPTÉ" : "REFUSÉ"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="font-bold text-[13px] text-slate-800 group-hover:text-[#2c5f42] transition-colors">{b.title}</span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="text-[11px] font-bold text-[#4a8c5c] uppercase tracking-tight">{b.companyName}</span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="text-[13px] font-black text-[#2c5f42] tabular-nums">
                                                        {b.price} <span className="text-[9px] font-medium opacity-70">MAD/u</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="text-[13px] font-black text-slate-700 tabular-nums">
                                                        {b.quantity} <span className="text-[9px] font-medium opacity-60 uppercase">{b.unit}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {format(new Date(b.createdAt), "d MMM yyyy", { locale: fr })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 rounded-lg bg-[#f0f8f4] text-[#4a8c5c] hover:bg-[#2c5f42] hover:text-white"
                                                            onClick={() => handleViewBidDetails(b)}
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                                            onClick={() => handleDeleteBid(b.id)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="planning" className="m-0">
                    <HarvestPlanning initialPlans={initialHarvestPlans} />
                </TabsContent>

                <TabsContent value="finances" className="m-0">
                    <ExpenseTracker initialExpenses={initialExpenses} harvestPlans={initialHarvestPlans} />
                </TabsContent>
                <TabsContent value="land" className="m-0 space-y-6">
                    {/* Land Hero Banner */}
                    <div className="rounded-[2rem] bg-[#2c5f42] px-8 py-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden shadow-xl shadow-[#2c5f42]/20">
                        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
                        <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                        <div className="flex-1 relative z-10">
                            <p className="text-[10px] font-bold text-[#a8d5be] uppercase tracking-[3px] mb-3">Monitoring Parcelle</p>
                            <h2 className="text-3xl font-light text-white tracking-tight leading-none mb-3">Ma Terre & Météo</h2>
                            <p className="text-[13px] text-white/70 font-medium max-w-xl leading-relaxed">
                                Suivez l&apos;évolution de vos cultures et les conditions climatiques en temps réel.
                            </p>
                        </div>

                        <div className="flex gap-8 shrink-0 relative z-10 md:border-l md:border-white/10 md:pl-8">
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-[#a8d5be] tabular-nums leading-none">
                                    {(ndviData && ndviData.length > 0) ? (ndviData[ndviData.length - 1].data?.mean?.toFixed(2) || "--") : "--"}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-white transition-colors">NDVI Santé</div>
                            </div>
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-white tabular-nums leading-none">
                                    {advancedData?.accumulated?.temp ? `${advancedData.accumulated.temp.toFixed(0)}°` : "--"}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-[#a8d5be] transition-colors">Cumul Temp.</div>
                            </div>
                            <div className="text-center group cursor-help">
                                <div className="text-[28px] font-light text-white tabular-nums leading-none">
                                    {advancedData?.uvi ? advancedData.uvi.toFixed(1) : "--"}
                                </div>
                                <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1.5 font-bold group-hover:text-[#a8d5be] transition-colors">Index UV</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                        {/* Main Analysis Column (Left 3/4) */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <SatelliteVisionCard
                                scenes={satelliteScenes}
                                geoJson={geoJson}
                                isSyncing={isSyncing}
                                className="min-h-[450px]"
                            />
                            <AgroAnalyticsChart
                                initialData={ndviData}
                                polygonId={polygonId}
                                isSyncing={isSyncing}
                            />
                        </div>

                        {/* Sidebar (Right 1/4) */}
                        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                            <WeatherCard
                                current={currentWeather}
                                forecast={weatherForecast}
                                locationName={profile.farmLocation || "Ma Ferme"}
                                isSyncing={isSyncing}
                            />
                            <AdvancedInsightsGrid
                                accumulatedTemp={advancedData?.accumulated?.temp}
                                accumulatedPrec={advancedData?.accumulated?.prec}
                                uvi={advancedData?.uvi}
                                isSyncing={isSyncing}
                            />
                            <div className="flex-1">
                                <SoilCard
                                    data={soilData}
                                    isSyncing={isSyncing}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>


                <TabsContent value="logbook" className="m-0 space-y-6">
                    <LogbookTab
                        initialLogs={farmLogs}
                        farmerId={profile.id}
                        parcels={initialParcels}
                        farmName={profile.farmName}
                    />
                </TabsContent>

                <TabsContent value="history" className="m-0 space-y-6">
                    <div className="rounded-[2rem] bg-white border border-[#d4e9dc] px-10 py-10 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0f8f4] rounded-full -mr-32 -mt-32 opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]">
                                        <History className="size-5 text-[#2c5f42]" />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#4a8c5c] uppercase tracking-[0.3em]">Analytics Avancés</span>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Performance Historique</h2>
                                <p className="text-[13px] text-slate-500 font-medium max-w-xl leading-relaxed">
                                    Suivi long terme de la santé de vos parcelles. Comparez vos cycles actuels avec les archives pour optimiser vos rendements.
                                </p>
                            </div>
                            <Button className="h-11 px-6 rounded-xl bg-[#2c5f42] text-white hover:bg-[#1a3d2a] font-bold uppercase text-[10px] tracking-widest transition-all shadow-md">
                                Exporter Rapport
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-[#d4e9dc] shadow-sm rounded-[2rem] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between border-b border-neutral-50 mb-6">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-950 tracking-tight">Indice NDVI Temporel</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-400 mt-1">Comparaison de vigueur végétative (An-1 vs Actuel)</CardDescription>
                                </div>
                                <div className="p-2 rounded-xl bg-neutral-50">
                                    <Activity className="size-5 text-[#4a8c5c]/40" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="h-[350px] w-full">
                                    <HistoryAnalyticsChart
                                        data={performanceHistory}
                                        isSyncing={isSyncing}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6 flex flex-col">
                            <Card className="flex-1 border-[#d4e9dc] shadow-sm rounded-[2rem] overflow-hidden bg-white border-l-4 border-l-[#2c5f42]">
                                <CardContent className="p-8 h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-8 text-[#2c5f42]">
                                        <div className="p-2.5 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]">
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <Badge variant="outline" className="text-[#4a8c5c] border-[#d4e9dc] font-bold text-[9px] px-2 tracking-widest uppercase">Certifié</Badge>
                                    </div>

                                    <PerformanceBadge
                                        score={performanceHistory?.score}
                                        delta={performanceHistory?.stats?.delta || "0"}
                                    />

                                    <div className="space-y-4">
                                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#2c5f42] transition-all duration-1000"
                                                style={{ width: `${performanceHistory?.score || 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                            Score fondé sur la régularité du NDVI et l'optimisation des ressources.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#d4e9dc] shadow-sm rounded-[2rem] overflow-hidden bg-white relative">

                                <CardContent className="p-8">
                                    <div className="p-2.5 w-fit rounded-xl bg-[#f0f8f4] text-[#2c5f42] mb-6 border border-[#d4e9dc]">
                                        <History className="size-5" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-950 mb-2 tracking-tight">Rapport de Rendement</h4>
                                    <p className="text-[13px] text-slate-500 leading-relaxed mb-6 font-medium">
                                        Générez un certificat officiel pour vos partenaires ou assurances.
                                    </p>
                                    <Button className="w-full bg-[#f0f8f4] text-[#2c5f42] hover:bg-[#2c5f42] hover:text-white font-bold uppercase text-[10px] tracking-widest h-11 rounded-xl shadow-none transition-colors border-none">
                                        Générer Certificat
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="profile" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Farm Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-[#f8fdf9] border-b border-[#e0ede5] p-6">
                                    <div className="flex items-center gap-2 text-[#4a8c5c] mb-1">
                                        <LandPlot className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Informations Exploitation</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#2c5f42]">{profile.farmName}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-[#4a8c5c]/70">
                                        {profile.farmLocation}, {profile.city}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <MapPin className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Localisation</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.city}, {profile.region}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Waves className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Irrigation</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {Array.isArray(profile.irrigationType) ? profile.irrigationType.map((t: string) => (
                                                            <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none font-bold text-[10px] uppercase">{t}</Badge>
                                                        )) : <span className="text-[13px] font-semibold text-slate-900">{profile.irrigationType || "Non spécifié"}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Zap className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Méthodes de Culture</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {Array.isArray(profile.farmingMethods) && profile.farmingMethods.length > 0 ? profile.farmingMethods.map((m: string) => (
                                                            <Badge key={m} variant="secondary" className="bg-[#f0f8f4] text-[#4a8c5c] border-none font-bold text-[10px] uppercase">{m}</Badge>
                                                        )) : <span className="text-[13px] font-medium text-slate-400 italic">Non spécifié</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Building2 className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taille Exploitation</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.totalArea} Hectares</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <ShieldCheck className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certifications</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {profile.onssaCert && <Badge className="bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 border-none font-bold text-[10px] uppercase">ONSSA: {profile.onssaCert}</Badge>}
                                                        {Array.isArray(profile.certifications) && profile.certifications.length > 0 ? profile.certifications.map((c: string) => (
                                                            <Badge key={c} variant="secondary" className="bg-[#f0f8f4] text-[#4a8c5c] hover:bg-[#f0f8f4] border-none font-bold text-[10px] uppercase">{c}</Badge>
                                                        )) : !profile.onssaCert && <span className="text-[13px] font-medium text-slate-500 italic">Aucune certification</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {profile.livestockType && (
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                        <Briefcase className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Élevage</div>
                                                        <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.livestockType}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-[#f8fdf9] border-b border-[#e0ede5] p-6">
                                    <div className="flex items-center gap-2 text-[#4a8c5c] mb-1">
                                        <Boxes className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Production & Disponibilité</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#2c5f42]">Capacités de Production</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Volume de Production</div>
                                                <div className="p-4 rounded-xl bg-[#f0f8f4]/50 border border-[#c4dece]/50">
                                                    <div className="text-[15px] font-semibold text-[#2c5f42]">{profile.avgAnnualProduction}</div>
                                                    <div className="text-[10px] font-bold text-[#4a8c5c]/70 uppercase mt-1">Production Annuelle Moyenne</div>
                                                </div>
                                                <div className="mt-4 p-4 rounded-xl bg-[#f0f8f4]/50 border border-[#c4dece]/50">
                                                    <div className="text-[13px] font-bold text-[#2c5f42]">{profile.availableProductionVolume}</div>
                                                    <div className="text-[10px] font-bold text-[#4a8c5c]/70 uppercase mt-1">Volume Actuellement Disponible</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Saisonnalité</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(profile.seasonAvailability) && profile.seasonAvailability.length > 0 ? profile.seasonAvailability.map((month: string) => (
                                                        <Badge key={month} variant="secondary" className="bg-[#f0f8f4] text-[#4a8c5c] font-bold text-[9px] uppercase border-[#c4dece]">{month}</Badge>
                                                    )) : <span className="text-[13px] font-medium text-slate-400 italic">Toute l&apos;année</span>}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Export</span>
                                                    <Badge variant={profile.exportCapacity ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase border-none", profile.exportCapacity ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400")}>
                                                        {profile.exportCapacity ? "CAPABLE" : "NON"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Logistique</span>
                                                    <Badge variant={profile.logisticsCapacity ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase border-none", profile.logisticsCapacity ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400")}>
                                                        {profile.logisticsCapacity ? "OUI" : "NON"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Contrat Long Terme</span>
                                                    <Badge variant={profile.longTermContractAvailable ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase border-none", profile.longTermContractAvailable ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400")}>
                                                        {profile.longTermContractAvailable ? "DISPONIBLE" : "NON"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-[#f8fdf9] border-b border-[#e0ede5] p-6">
                                    <div className="flex items-center gap-2 text-[#4a8c5c] mb-1">
                                        <Building2 className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Modèle Économique & Logistique</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#2c5f42]">Capacités Commerciales</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Modes de Vente</div>
                                                <div className="space-y-2">
                                                    {Array.isArray(profile.businessModel) && profile.businessModel.includes("Direct Sales") && (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f8f4]/50 border border-[#c4dece]/50">
                                                            <Store className="size-4 text-[#4a8c5c]" />
                                                            <div className="text-[13px] font-bold text-[#2c5f42]">Vente Directe (Au Kilo)</div>
                                                        </div>
                                                    )}
                                                    {Array.isArray(profile.businessModel) && profile.businessModel.includes("Contracts") && (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f8f4]/50 border border-[#c4dece]/50">
                                                            <LayoutGrid className="size-4 text-[#4a8c5c]" />
                                                            <div className="text-[13px] font-bold text-[#2c5f42]">Contrats (Industriel)</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Options Logistiques</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                                            <Truck className="size-4 text-[#4a8c5c]" /> Livraison
                                                        </div>
                                                        <Badge variant={profile.deliveryCapacity ? "default" : "secondary"} className={cn("text-[10px] font-bold uppercase border-none", profile.deliveryCapacity ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400")}>
                                                            {profile.deliveryCapacity ? "OUI" : "NON"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                                            <Droplets className="size-4 text-[#4a8c5c]" /> Froid
                                                        </div>
                                                        <Badge variant={profile.hasColdStorage ? "default" : "secondary"} className={cn("text-[10px] font-bold uppercase border-none", profile.hasColdStorage ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400")}>
                                                            {profile.hasColdStorage ? "OUI" : "NON"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Producer Summary */}
                        <div className="space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8 text-center space-y-4">
                                    <Avatar className="mx-auto w-24 h-24 ring-4 ring-[#f0f8f4] shadow-sm">
                                        <AvatarImage src={profile.avatarUrl || userImage || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-[#f0f8f4] text-[#4a8c5c] text-2xl font-black">
                                            {profile.fullName?.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-[#2c5f42]">{profile.fullName}</h3>
                                        <p className="text-[12px] font-bold text-[#4a8c5c]/60 uppercase tracking-widest">{profile.iceNumber || "Sans ICE"}</p>
                                    </div>
                                    <div className="pt-4 flex flex-wrap justify-center gap-2">
                                        {Array.isArray(profile.cropTypes) && profile.cropTypes.map((crop: string) => (
                                            <Badge key={crop} className="bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 border-none font-bold text-[9px] uppercase tracking-tighter shadow-sm">{crop}</Badge>
                                        ))}
                                    </div>
                                    <div className="pt-6 space-y-4 text-left border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#f0f8f4] text-[#4a8c5c]">
                                                <Phone className="size-3.5" />
                                            </div>
                                            <div className="text-[13px] font-bold text-[#2c5f42] tabular-nums">{profile.phone}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#f0f8f4] text-[#4a8c5c]">
                                                <Mail className="size-3.5" />
                                            </div>
                                            <div className="text-[13px] font-bold text-[#2c5f42] truncate">{profile.businessEmail}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="border border-border rounded-xl p-5 bg-white border-l-2 border-l-[#2c5f42]">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="size-4 text-[#4a8c5c]" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#4a8c5c]/70">
                                        {calculateFarmerScore(profile) >= 80 ? "Statut Vérifié" : "Score de Confiance"}
                                    </span>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                                    {calculateFarmerScore(profile) >= 80
                                        ? "Votre profil est certifié Agri-Mar. Vous avez accès aux contrats institutionnels."
                                        : "Complétez votre ICE et vos certifications pour accéder aux contrats industriels."}
                                </p>
                                {calculateFarmerScore(profile) < 80 && (
                                    <Button size="sm" className="w-full text-[13px] bg-[#2c5f42] hover:bg-[#2c5f42]/90 shadow-lg shadow-[#2c5f42]/20">
                                        Compléter le profil
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <ProductDetailModal
                isOpen={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
                product={selectedProduct}
                onContactSeller={() => { }} // No action for farmer viewing own product
                isContacting={false}
            />

            <BidTenderModal
                isOpen={isBidModalOpen}
                onOpenChange={setIsBidModalOpen}
                tender={selectedTender}
            />

            <DirectProposalModal
                isOpen={isDirectProposalModalOpen}
                onOpenChange={setIsDirectProposalModalOpen}
                partners={initialPartners}
                products={initialProducts}
            />

            <AddProductModal
                isOpen={isAddProductModalOpen}
                onOpenChange={setIsAddProductModalOpen}
            />

            <PartnerProfileModal
                isOpen={isPartnerModalOpen}
                onOpenChange={setIsPartnerModalOpen}
                partner={selectedPartner}
            />

            <EditProductModal
                isOpen={isEditProductModalOpen}
                onOpenChange={setIsEditProductModalOpen}
                product={selectedEditProduct}
            />

            <BidDetailsModal
                isOpen={isBidDetailsModalOpen}
                onOpenChange={setIsBidDetailsModalOpen}
                bid={selectedBidForDetails}
            />

            <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                <DialogContent className="max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Profil Acheteur</DialogTitle>
                        <DialogDescription>Détails de l'entreprise demandant un partenariat</DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <>
                            <DialogHeader className="px-8 pt-8 pb-4">
                                <DialogDescription className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                                    Mise en Relation
                                </DialogDescription>
                                <DialogTitle className="text-[22px] font-bold tracking-tight text-foreground">
                                    Profil Acheteur
                                </DialogTitle>
                            </DialogHeader>

                            <Separator className="bg-border/60" />

                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border border-border shadow-sm rounded-2xl">
                                        <AvatarImage src={selectedRequest.senderLogo || ""} className="object-cover" />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold rounded-2xl uppercase">
                                            {selectedRequest.senderName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1.5">
                                        <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none">{selectedRequest.senderName}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{selectedRequest.senderIndustry || "Secteur non défini"}</p>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                                                <MapPin className="size-3" />
                                                {selectedRequest.location || "Maroc"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Type de Compte</label>
                                        <div className="h-10 px-4 rounded-lg border border-border flex items-center bg-muted/20 text-[13px] font-semibold text-foreground">
                                            Acheteur Officiel
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Enregistré le</label>
                                        <div className="h-10 px-4 rounded-lg border border-border flex items-center bg-muted/20 text-[13px] font-semibold text-foreground tabular-nums">
                                            {format(new Date(selectedRequest.sentAt), "d MMMM yyyy", { locale: fr })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="size-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Message d'accompagnement</span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border border-dashed bg-muted/5">
                                        <p className="text-[13px] font-medium text-foreground leading-relaxed italic">
                                            "{selectedRequest.initialMessage || "Aucun message d'accompagnement"}"
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="h-12 px-6 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleRequestAction(selectedRequest.id, "ACCEPTED");
                                            setIsRequestModalOpen(false);
                                        }}
                                        disabled={!!isProcessingRequest}
                                        className="h-12 flex-1 bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 rounded-xl text-[13px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
                                    >
                                        {isProcessingRequest === selectedRequest.id ? <RefreshCw className="size-4 animate-spin" /> : "Autoriser l'Accès"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white max-w-[400px]">
                    <div className={cn(
                        "h-1.5 bg-gradient-to-r",
                        confirmConfig.variant === "destructive" ? "from-red-500 to-orange-500" :
                            confirmConfig.variant === "success" ? "from-emerald-500 to-teal-500" : "from-slate-500 to-slate-700"
                    )} />
                    <div className="p-8 space-y-6">
                        <AlertDialogHeader>
                            <div className={cn(
                                "size-12 rounded-2xl border flex items-center justify-center mb-2",
                                confirmConfig.variant === "destructive" ? "bg-red-50 border-red-100" :
                                    confirmConfig.variant === "success" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                            )}>
                                {confirmConfig.icon ? (
                                    <confirmConfig.icon className={cn(
                                        "size-6",
                                        confirmConfig.variant === "destructive" ? "text-red-600" :
                                            confirmConfig.variant === "success" ? "text-emerald-600" : "text-slate-600"
                                    )} />
                                ) : (
                                    <AlertCircle className={cn(
                                        "size-6",
                                        confirmConfig.variant === "destructive" ? "text-red-600" : "text-slate-600"
                                    )} />
                                )}
                            </div>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                                {confirmConfig.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                                {confirmConfig.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 sm:gap-3">
                            <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px] hover:bg-slate-50 shadow-none">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    confirmConfig.onConfirm();
                                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                }}
                                className={cn(
                                    "flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] shadow-lg transition-all active:scale-[0.98]",
                                    confirmConfig.variant === "destructive"
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
                                        : confirmConfig.variant === "success"
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                                            : "bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 shadow-slate-200"
                                )}
                            >
                                {confirmConfig.confirmText || "Confirmer"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
