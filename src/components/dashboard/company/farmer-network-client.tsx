"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { FarmerListDTO } from "@/data-access/farmers.dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin, Search, ShieldCheck, Star, Camera,
    MessageSquare, CheckCircle2, Truck, Loader2, Users,
    X, Globe, Network, Info, Boxes, Briefcase, Sprout,
    Waves, Tractor, Calendar, Phone, Mail, ChevronDown,
    ShoppingBag, ArrowUpRight, Activity
} from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import Image from "next/image";
import { requestConnectionAction } from "@/actions/networking.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PartnerDTO } from "@/data-access/connections.dal";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { getFarmerAnalyticsAction } from "@/actions/agromonitoring.actions";

const MAROC_REGIONS = [
    "Souss-Massa", "Gharb-Chrarda-Béni Hssen", "Doukkala-Abda",
    "Oriental", "Safi", "Marrakech-Tensift-Al Haouz", "Fès-Boulemane"
];

const COMMON_CROPS = [
    "Tomates", "Agrumes", "Pommes de terre", "Olives", "Oignons", "Poivrons", "Fraises"
];

export function FarmerNetworkClient({
    initialFarmers,
    initialSuppliers = [],
    selectedId: externalSelectedId,
    onSelect
}: {
    initialFarmers: FarmerListDTO[],
    initialSuppliers?: PartnerDTO[],
    selectedId?: string | null,
    onSelect?: (id: string | null) => void
}) {
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("all");
    const [cropType, setCropType] = useState("all");
    const [selectedId, setSelectedId] = useState<string | null>(externalSelectedId || initialFarmers[0]?.id || null);

    // Sync with external selectedId
    useEffect(() => {
        if (externalSelectedId) {
            setSelectedId(externalSelectedId);
        }
    }, [externalSelectedId]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        if (onSelect) onSelect(id);
    };
    const [requestingId, setRequestingId] = useState<string | null>(null);

    // Gallery/reviews per farmer
    const [photos, setPhotos] = useState<string[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [loadingExtra, setLoadingExtra] = useState(false);

    // Monitoring State for Connected Suppliers
    const [monitorAnalytics, setMonitorAnalytics] = useState<any>(null);
    const [isLoadingMonitor, setIsLoadingMonitor] = useState(false);

    const filtered = useMemo(() => {
        return initialFarmers.filter(f => {
            const s = search.toLowerCase();
            const matchSearch = !s ||
                f.fullName.toLowerCase().includes(s) ||
                f.farmName.toLowerCase().includes(s) ||
                f.city.toLowerCase().includes(s);
            const matchRegion = region === "all" || f.region === region;
            const matchCrop = cropType === "all" || f.mainCrops.includes(cropType);
            return matchSearch && matchRegion && matchCrop;
        });
    }, [initialFarmers, search, region, cropType]);

    const selected = useMemo(() => filtered.find(f => f.id === selectedId) || filtered[0], [filtered, selectedId]);

    // Fetch gallery when selected changes
    useEffect(() => {
        if (!selected) return;
        setLoadingExtra(true);
        setPhotos([]);
        setReviews([]);
        setAvgRating(null);
        setReviewCount(0);
        fetch(`/api/farmer/${selected.id}/gallery`)
            .then(r => r.json())
            .then(data => {
                setPhotos((data.photos || []).map((p: any) => p.url));
                setReviews(data.reviews || []);
                setAvgRating(data.averageRating ?? null);
                setReviewCount(data.reviewCount ?? 0);
            })
            .finally(() => setLoadingExtra(false));

        // Check if selected is a supplier and has a polygon to trigger monitoring analytics
        const supplierInfo = initialSuppliers.find(s => s.profileId === selected.id);
        if (supplierInfo?.parcelPolygonId) {
            setIsLoadingMonitor(true);
            getFarmerAnalyticsAction(supplierInfo.parcelPolygonId)
                .then(result => {
                    if (result.data) {
                        setMonitorAnalytics(result.data);
                    }
                })
                .catch(err => console.error("Monitor fetch err:", err))
                .finally(() => setIsLoadingMonitor(false));
        } else {
            setMonitorAnalytics(null);
        }
    }, [selected?.id, initialSuppliers]);

    const handleConnect = async () => {
        if (!selected) return;
        setRequestingId(selected.id);
        const result = await requestConnectionAction({ targetId: selected.id });
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Demande envoyée ! Elle apparaît maintenant dans vos Demandes.");
        }
        setRequestingId(null);
    };

    const isVerified = selected && !!(selected.iceNumber && selected.onssaCert);
    const selectedSupplier = useMemo(() => selected ? initialSuppliers.find(s => s.profileId === selected.id) : null, [selected, initialSuppliers]);
    const isConnected = !!selectedSupplier;

    return (
        <div className="flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-border">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                        placeholder="Rechercher un agriculteur ou une ferme..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-50 border-transparent h-9 rounded-lg text-[13px] focus-visible:ring-slate-200 shadow-none"
                    />
                </div>
                <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-transparent text-[12px] font-semibold rounded-lg shadow-none">
                        <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {MAROC_REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-transparent text-[12px] font-semibold rounded-lg shadow-none">
                        <SelectValue placeholder="Cultures" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les cultures</SelectItem>
                        {COMMON_CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                {(search || region !== "all" || cropType !== "all") && (
                    <Button variant="ghost" size="sm"
                        className="h-9 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-900"
                        onClick={() => { setSearch(""); setRegion("all"); setCropType("all"); }}>
                        <X className="size-3 mr-1.5" /> Réinitialiser
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left: Farmer list */}
                <div className="col-span-12 lg:col-span-4 border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-[#f8fdf9]">
                        <Users className="size-4 text-[#2c5f42]" />
                        <h3 className="text-[13px] font-bold text-[#2c5f42] uppercase tracking-wider">
                            Réseau <span className="text-[#4a8c5c] font-normal">({filtered.length})</span>
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <Network className="size-8 opacity-20" />
                                <p className="text-[12px] font-medium">Aucun résultat</p>
                            </div>
                        ) : filtered.map(farmer => {
                            const isSelected = selected?.id === farmer.id;
                            return (
                                <div
                                    key={farmer.id}
                                    onClick={() => handleSelect(farmer.id)}
                                    className={cn(
                                        "mx-2 px-3 py-3 rounded-xl cursor-pointer transition-all flex items-start gap-3",
                                        isSelected ? "bg-[#f0f8f4] border border-[#c8dfd0]" : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <Avatar className="size-10 rounded-xl border border-border shrink-0 mt-0.5">
                                        <AvatarImage src={farmer.avatarUrl || ""} />
                                        <AvatarFallback className={cn("text-[11px] font-bold rounded-xl",
                                            isSelected ? "bg-white text-[#2c5f42]" : "bg-slate-100 text-slate-500")}>
                                            {farmer.fullName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between mb-0.5">
                                            <h4 className={cn("text-[13px] font-bold truncate", isSelected ? "text-[#2c5f42]" : "text-slate-900")}>{farmer.fullName}</h4>
                                            {farmer.iceNumber && (
                                                <Badge variant="secondary" className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0 h-4 bg-slate-100 text-slate-500 ml-2 border-none shadow-none">
                                                    PRO
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate mb-1">
                                            {farmer.mainCrops.join(", ") || "Cultures Diverses"}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                            <MapPin className="size-3 shrink-0" />
                                            <span className="truncate">{farmer.city}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Detail panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {selected ? (
                        <>
                            {/* Profile Header Card */}
                            <Card className="border-border shadow-sm overflow-hidden bg-white rounded-xl">
                                <div className="h-32 bg-[#2c5f42] w-full relative border-b border-[#2c5f42]">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white_1px,transparent_1px)] [background-size:20px_20px]" />
                                    <div className="absolute top-4 right-4">
                                        {!isConnected ? (
                                            <Button
                                                onClick={handleConnect}
                                                disabled={requestingId === selected.id}
                                                className="h-9 shadow-sm bg-white text-[#2c5f42] hover:bg-slate-50 border-none font-bold uppercase tracking-wider text-[11px]"
                                            >
                                                {requestingId === selected.id
                                                    ? <Loader2 className="size-3 animate-spin" />
                                                    : <MessageSquare className="size-3 mr-1.5" />}
                                                Proposer Contrat
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 gap-1.5 rounded-lg">
                                                <CheckCircle2 className="size-4" /> Partenaire
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="px-8 pb-8 -mt-10 relative">
                                    <div className="flex items-end gap-6 mb-8">
                                        <Avatar className="size-24 rounded-2xl border flex-shrink-0 bg-white shadow-sm ring-4 ring-white">
                                            <AvatarImage src={selected.avatarUrl || ""} />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#2c5f42]">
                                                {selected.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="pb-1 space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-light text-slate-800 tracking-tight truncate">{selected.fullName}</h2>
                                                {isVerified ? (
                                                    <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                                        <CheckCircle2 className="size-3" /> Vérifié Pro
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                                        <Info className="size-3" /> Profil Essentiel
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                                                <MapPin className="size-3.5" />
                                                <span className="truncate">{selected.city}, {selected.region}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Star className="size-3.5" /> Note Moyenne
                                            </p>
                                            <span className="text-2xl font-light text-[#2c5f42]">{avgRating ? avgRating.toFixed(1) : "—"}</span>
                                            <p className="text-[11px] font-medium text-slate-500 mt-1">{reviewCount} avis clients</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Boxes className="size-3.5" /> Production Annuelle
                                            </p>
                                            <span className="text-xl font-light text-[#2c5f42] truncate w-full">{selected.avgAnnualProduction || "Non spécifié"}</span>
                                            <p className="text-[11px] font-medium text-slate-500 mt-1">Volume Moyen</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Briefcase className="size-3.5" /> Secteur
                                            </p>
                                            <span className="text-xl font-light text-[#2c5f42] uppercase truncate w-full">{selected.livestockType || selected.mainCrops[0] || "Agricole"}</span>
                                            <p className="text-[11px] font-medium text-[#2c5f42] mt-1 uppercase tracking-widest">
                                                {selected.onssaCert ? "Certifié" : "Vérifié"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile details grid (no satellite/API) */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {[
                                            { icon: ShieldCheck, label: "ICE", value: selected.iceNumber || "En attente" },
                                            { icon: CheckCircle2, label: "ONSSA", value: selected.onssaCert || "En attente", green: !!selected.onssaCert },
                                            { icon: Waves, label: "Irrigation", value: selected.irrigationType || "Standard" },
                                            { icon: Truck, label: "Logistique", value: selected.logisticsCapacity || selected.deliveryCapacity ? "Incluse" : "Non incluse" },
                                        ].map(({ icon: Icon, label, value, green }) => (
                                            <div key={label} className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0">
                                                    <Icon className="size-3.5 text-[#2c5f42]" /> {label}
                                                </p>
                                                <span className={cn("text-[13px] font-bold tracking-tight truncate w-full", green ? "text-[#2c5f42]" : "text-slate-800")}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Globe className="size-3.5 text-[#2c5f42]" /> Modèle Business
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selected.businessModel && selected.businessModel.length > 0
                                                    ? selected.businessModel.map(m => (
                                                        <Badge key={m} variant="secondary" className="text-[10px] font-bold bg-[#f0f8f4] text-[#2c5f42] border-none uppercase">{m}</Badge>
                                                    ))
                                                    : <Badge variant="secondary" className="text-[10px] font-bold bg-[#f0f8f4] text-[#2c5f42] border-none uppercase">Vente Directe</Badge>
                                                }
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Sprout className="size-3.5 text-[#2c5f42]" /> Stockage Froid
                                            </p>
                                            <span className="text-[13px] font-bold text-slate-800">
                                                {selected.hasColdStorage ? "Disponible" : "Non disponible"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Certifications */}
                                    {selected.certifications.length > 0 && (
                                        <div className="space-y-2 mb-6">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Certifications & Qualité</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selected.certifications.map((cert, i) => (
                                                    <Badge key={i} variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-bold uppercase tracking-widest rounded-md px-2 py-1">
                                                        <ShieldCheck className="size-3 mr-1.5" /> {cert}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Farming methods / crops */}
                                    {selected.mainCrops.length > 0 && (
                                        <div className="space-y-2 mb-6">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Spécialités Agricoles</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selected.mainCrops.map(c => (
                                                    <Badge key={c} variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">{c}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Area / export / contract badges */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selected.exportCapacity && (
                                            <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 text-[9px] font-bold uppercase py-1 gap-1.5 px-2">
                                                <Globe className="size-3 text-[#2c5f42]" /> Capacité Export
                                            </Badge>
                                        )}
                                        {selected.longTermContractAvailable && (
                                            <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 text-[9px] font-bold uppercase py-1 gap-1.5 px-2">
                                                <Tractor className="size-3 text-[#2c5f42]" /> Contrat Long Terme
                                            </Badge>
                                        )}
                                        {selected.totalAreaHectares && (
                                            <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 text-[9px] font-bold uppercase py-1 gap-1.5 px-2">
                                                <MapPin className="size-3 text-[#2c5f42]" /> {selected.totalAreaHectares} Ha
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Contact Information (Blurred if not connected) */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm relative overflow-hidden group">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Phone className="size-3.5 text-[#2c5f42]" /> Téléphone
                                            </p>
                                            <span className={cn(
                                                "text-[14px] font-bold text-slate-800 tracking-tight transition-all duration-500",
                                                !isConnected && "blur-md select-none opacity-40"
                                            )}>
                                                {selected.phone || "Non renseigné"}
                                            </span>
                                            {!isConnected && (
                                                <div className="absolute inset-x-0 bottom-2 flex justify-center">
                                                    <Badge variant="secondary" className="text-[8px] font-bold bg-[#2c5f42] text-white border-none py-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Connectez-vous</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm relative overflow-hidden group">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Mail className="size-3.5 text-[#2c5f42]" /> Email Pro
                                            </p>
                                            <span className={cn(
                                                "text-[14px] font-bold text-slate-800 tracking-tight truncate w-full transition-all duration-500",
                                                !isConnected && "blur-md select-none opacity-40"
                                            )}>
                                                {selected.businessEmail || "Non renseigné"}
                                            </span>
                                            {!isConnected && (
                                                <div className="absolute inset-x-0 bottom-2 flex justify-center">
                                                    <Badge variant="secondary" className="text-[8px] font-bold bg-[#2c5f42] text-white border-none py-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Connectez-vous</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notice: Details locked until connection */}
                                    {!isConnected && (
                                        <div className="rounded-xl bg-[#f8fdf9] border border-[#e0ede5] p-4 flex items-start gap-3">
                                            <Info className="size-4 text-[#4a8c5c] shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                                Les coordonnées de contact, les avis clients et le monitoring satellite (NDVI, météo, humidité des sols) seront accessibles après acceptation de votre demande de connexion.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {isConnected && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2 p-4 bg-white rounded-xl border border-border shadow-sm">
                                        <Activity className="size-5 text-[#2c5f42]" />
                                        <h3 className="text-[14px] font-bold text-slate-900 tracking-wider uppercase">Monitoring Satellite Actif</h3>
                                    </div>

                                    {!selectedSupplier.parcelPolygonId ? (
                                        <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                            <div className="text-center space-y-3 max-w-sm px-6">
                                                <Tractor className="size-10 text-slate-200 mx-auto" />
                                                <p className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest leading-relaxed">
                                                    Données Agricoles Indisponibles
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                    Le producteur <strong>{selected.fullName}</strong> n&apos;a pas encore synchronisé ses coordonnées géospatiales depuis la plateforme. Contactez-le.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <NdviChart
                                                data={monitorAnalytics?.ndvi || []}
                                                isSyncing={isLoadingMonitor}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <WeatherCard
                                                    current={monitorAnalytics?.weather}
                                                    forecast={monitorAnalytics?.forecast}
                                                    locationName={selected.city}
                                                    isSyncing={isLoadingMonitor}
                                                />
                                                <SoilCard
                                                    data={monitorAnalytics?.soil}
                                                    isSyncing={isLoadingMonitor}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Photos + Reviews (Locked unless connected) */}
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="border-border shadow-sm bg-white rounded-xl overflow-hidden flex flex-col relative">
                                    {!isConnected && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                            <Camera className="size-8 text-slate-200 mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Images de l&apos;exploitation verrouillées</p>
                                        </div>
                                    )}
                                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fdf9]">
                                        <h3 className="text-[12px] font-bold text-[#2c5f42] uppercase tracking-wider flex items-center gap-1.5">
                                            <Camera className="size-3.5 text-[#4a8c5c]" /> Exploitation
                                        </h3>
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {loadingExtra ? (
                                            <div className="flex-1 min-h-[160px] flex items-center justify-center">
                                                <Loader2 className="size-5 animate-spin text-slate-300" />
                                            </div>
                                        ) : photos.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {photos.slice(0, 4).map((url, i) => (
                                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-50 border border-border/50 relative group">
                                                        <Image src={url} alt={`Photo ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ArrowUpRight className="size-4 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/50">
                                                <Camera className="size-6 opacity-20 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Pas de photos</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-border shadow-sm bg-white rounded-xl overflow-hidden flex flex-col relative">
                                    {!isConnected && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                            <Star className="size-8 text-slate-200 mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avis clients verrouillés</p>
                                        </div>
                                    )}
                                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fdf9]">
                                        <h3 className="text-[12px] font-bold text-[#2c5f42] uppercase tracking-wider flex items-center gap-1.5">
                                            <Star className="size-3.5 text-[#4a8c5c]" /> Avis Récents
                                        </h3>
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {loadingExtra ? (
                                            <div className="flex-1 min-h-[160px] flex items-center justify-center">
                                                <Loader2 className="size-5 animate-spin text-slate-300" />
                                            </div>
                                        ) : reviews.length > 0 ? (
                                            <div className="space-y-4">
                                                {reviews.slice(0, 3).map((r, i) => (
                                                    <div key={i} className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[12px] font-bold text-slate-800">{r.reviewer?.fullName || "Anonyme"}</span>
                                                            <div className="flex text-[#2c5f42]">{Array.from({ length: r.rating || 5 }).map((_, j) => <Star key={j} className="size-2.5 fill-current" />)}</div>
                                                        </div>
                                                        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 italic">&ldquo;{r.comment}&rdquo;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/50">
                                                <MessageSquare className="size-6 opacity-20 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Aucun avis</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 min-h-[400px]">
                            <Network className="size-16 opacity-10 mb-4 text-[#2c5f42]" />
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sélectionnez un profil</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
