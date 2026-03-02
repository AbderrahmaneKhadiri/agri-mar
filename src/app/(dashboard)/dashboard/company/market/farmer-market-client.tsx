"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, MapPin, Search, Filter, Phone, Mail, Award, CheckCircle2, MessageSquare, User, Users, X, ChevronDown, Star, LayoutGrid, List, ArrowUpRight, ShieldCheck, Camera, Truck, Waves, ClipboardCheck, Info, Calendar, Briefcase, Boxes, Zap, Globe } from "lucide-react";
import { FarmerListDTO } from "@/data-access/farmers.dal";
import { FarmerProfileContent } from "@/components/dashboard/company/farmer-profile-content";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requestConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const MAROC_REGIONS = [
    "Souss-Massa",
    "Gharb-Chrarda-Béni Hssen",
    "Doukkala-Abda",
    "Oriental",
    "Safi",
    "Marrakech-Tensift-Al Haouz",
    "Fès-Boulemane"
];

const COMMON_CROPS = [
    "Tomates",
    "Agrumes",
    "Pommes de terre",
    "Olives",
    "Oignons",
    "Poivrons",
    "Fraises"
];

export function FarmerMarketClient({ initialFarmers }: { initialFarmers: FarmerListDTO[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [farmers, setFarmers] = useState<FarmerListDTO[]>(initialFarmers);
    const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(initialFarmers[0]?.id || null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");

    // Details state
    const [photos, setPhotos] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        setFarmers(initialFarmers);

        // Handle direct linking to a farmer via query param
        const farmerId = searchParams.get("farmerId");
        if (farmerId && initialFarmers.some(f => f.id === farmerId)) {
            setSelectedFarmerId(farmerId);
        } else if (initialFarmers.length > 0 && (!selectedFarmerId || !initialFarmers.find(f => f.id === selectedFarmerId))) {
            setSelectedFarmerId(initialFarmers[0].id);
        }
    }, [initialFarmers, searchParams]);

    const selectedFarmer = useMemo(() => farmers.find(f => f.id === selectedFarmerId), [farmers, selectedFarmerId]);

    const updateFilters = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        router.push(pathname + '?' + params.toString(), { scroll: false });
    }, [router, pathname, searchParams]);

    useEffect(() => {
        if (!selectedFarmer) return;
        setLoadingDetails(true);
        fetch(`/api/farmer/${selectedFarmer.id}/gallery`)
            .then(res => res.json())
            .then(data => {
                setPhotos(data.photos || []);
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating ?? null);
                setReviewCount(data.reviewCount ?? 0);
            })
            .finally(() => setLoadingDetails(false));
    }, [selectedFarmer]);

    const handleProposeContract = async () => {
        if (!selectedFarmerId) return;
        setIsRequesting(true);
        const result = await requestConnectionAction({ targetId: selectedFarmerId });
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Demande de connexion envoyée avec succès !");
        }
        setIsRequesting(false);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Header Contextual */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Marketplace</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Marché Agricole</span>
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 rounded-xl border border-border">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                        placeholder="Rechercher un agriculteur ou une ferme..."
                        className="pl-9 bg-white border-border h-9 rounded-lg text-[13px] focus-visible:ring-slate-200"
                        defaultValue={searchParams.get('search') || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            const timeoutId = setTimeout(() => updateFilters('search', val), 500);
                            return () => clearTimeout(timeoutId);
                        }}
                    />
                </div>
                <Select value={searchParams.get('region') || "all"} onValueChange={(v) => updateFilters('region', v)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white border-border text-[12px] font-semibold rounded-lg">
                        <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {MAROC_REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={searchParams.get('cropType') || "all"} onValueChange={(v) => updateFilters('cropType', v)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white border-border text-[12px] font-semibold rounded-lg">
                        <SelectValue placeholder="Cultures" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les cultures</SelectItem>
                        {COMMON_CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                {searchParams.toString() !== "" && (
                    <Button variant="ghost" size="sm" className="h-9 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-900" onClick={() => router.push(pathname)}>
                        <X className="size-3 mr-1.5" /> Réinitialiser
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6 mt-2">
                {/* Farmer List (Sidebar-like) */}
                <div className="col-span-12 lg:col-span-4 border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <h3 className="text-[13px] font-semibold text-foreground tracking-tight">
                                Résultats <span className="text-muted-foreground font-normal">({farmers.length})</span>
                            </h3>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
                        {farmers.map((farmer) => {
                            const isSelected = selectedFarmerId === farmer.id;
                            return (
                                <div
                                    key={farmer.id}
                                    onClick={() => setSelectedFarmerId(farmer.id)}
                                    className={cn(
                                        "mx-2 px-3 py-3 rounded-xl cursor-pointer transition-all flex items-start gap-3",
                                        isSelected
                                            ? "bg-muted"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <Avatar className="size-10 rounded-xl border border-border shrink-0 mt-0.5">
                                        <AvatarImage src={farmer.avatarUrl || ""} />
                                        <AvatarFallback className={cn("text-[11px] font-semibold rounded-xl", isSelected ? "bg-background text-foreground" : "bg-muted text-muted-foreground")}>
                                            {farmer.fullName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between mb-0.5">
                                            <h4 className="text-[13px] font-semibold text-foreground truncate">{farmer.fullName}</h4>
                                            {farmer.iceNumber && (
                                                <Badge variant="secondary" className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0 h-4 bg-background/50 text-muted-foreground ml-2 border-border/50 shadow-none">
                                                    PRO
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate mb-1.5">
                                            {farmer.mainCrops.join(", ") || "Cultures Diverses"}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                            <MapPin className="size-3 shrink-0" />
                                            <span className="truncate">{farmer.city}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Farmer Detail Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {selectedFarmer ? (
                        <>
                            {/* Profile Header Card */}
                            <Card className="border-border shadow-sm overflow-hidden bg-white rounded-xl">
                                <div className="h-32 bg-slate-50 w-full relative border-b border-border">
                                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,var(--slate-200)_1px,transparent_1px)] [background-size:20px_20px]" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Button
                                            onClick={handleProposeContract}
                                            disabled={isRequesting}
                                            className="h-9 shadow-sm"
                                        >
                                            {isRequesting ? <Loader2 className="size-3 animate-spin" /> : <MessageSquare className="size-3 mr-1.5" />}
                                            Proposer Contrat
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="px-8 pb-8 -mt-10 relative">
                                    <div className="flex items-end gap-6 mb-8">
                                        <Avatar className="size-24 rounded-2xl border flex-shrink-0 bg-white shadow-sm ring-4 ring-white">
                                            <AvatarImage src={selectedFarmer.avatarUrl || ""} />
                                            <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground">
                                                {selectedFarmer.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="pb-1 space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-semibold text-foreground tracking-tight truncate">{selectedFarmer.fullName}</h2>
                                                {selectedFarmer.iceNumber && selectedFarmer.onssaCert ? (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                                        <CheckCircle2 className="size-3" />
                                                        Vérifié Pro
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-muted text-muted-foreground border-border/50 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                                        <Info className="size-3" />
                                                        Profil Essentiel
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5 truncate"><MapPin className="size-3.5" /> {selectedFarmer.city}, {selectedFarmer.region}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Star className="size-3.5" /> Note Moyenne</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-semibold text-foreground tracking-tight">{averageRating ? averageRating.toFixed(1) : "—"}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-muted-foreground mt-1">{reviewCount} avis clients</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Boxes className="size-3.5" /> Production Annuelle</p>
                                            <span className="text-lg font-semibold text-foreground tracking-tight truncate w-full">{selectedFarmer.avgAnnualProduction || "Non spécifié"}</span>
                                            <p className="text-[11px] font-medium text-muted-foreground mt-1">Volume Moyen</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Briefcase className="size-3.5" /> Secteur</p>
                                            <span className="text-lg font-semibold text-foreground tracking-tight uppercase truncate w-full">{selectedFarmer.livestockType || selectedFarmer.mainCrops[0] || "Agricole"}</span>
                                            <p className="text-[11px] font-medium text-emerald-600 mt-1 uppercase tracking-widest">
                                                {selectedFarmer.onssaCert ? "Certifié" : "Vérifié"}
                                            </p>
                                        </div>
                                    </div>

                                    <FarmerProfileContent
                                        isCompact
                                        data={{
                                            id: selectedFarmer.id,
                                            name: selectedFarmer.fullName,
                                            avatarUrl: selectedFarmer.avatarUrl,
                                            location: `${selectedFarmer.city}, ${selectedFarmer.region}`,
                                            farmName: selectedFarmer.farmName,
                                            totalArea: selectedFarmer.totalAreaHectares,
                                            cropTypes: selectedFarmer.mainCrops,
                                            livestock: selectedFarmer.livestockType || undefined,
                                            certifications: selectedFarmer.certifications,
                                            farmingMethods: selectedFarmer.farmingMethods,
                                            seasonality: selectedFarmer.seasonAvailability,
                                            exportCapacity: selectedFarmer.exportCapacity,
                                            logistics: selectedFarmer.logisticsCapacity,
                                            iceNumber: selectedFarmer.iceNumber,
                                            onssaCert: selectedFarmer.onssaCert,
                                            irrigationType: selectedFarmer.irrigationType,
                                            production: selectedFarmer.avgAnnualProduction,
                                            hasColdStorage: selectedFarmer.hasColdStorage,
                                            deliveryCapacity: selectedFarmer.deliveryCapacity,
                                            businessModel: selectedFarmer.businessModel,
                                            longTermContractAvailable: selectedFarmer.longTermContractAvailable,
                                            production: selectedFarmer.availableProductionVolume,
                                            phone: selectedFarmer.phone,
                                            email: selectedFarmer.businessEmail,
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Gallery Carousel/Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="border-border shadow-sm bg-card rounded-xl overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-white">
                                        <h3 className="text-[13px] font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                                            <Camera className="size-3.5 text-muted-foreground" />
                                            Exploitation
                                        </h3>
                                        {photos.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-6 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 -mr-2">Voir tout</Button>
                                        )}
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {loadingDetails ? (
                                            <div className="flex-1 min-h-[160px] flex items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                                        ) : photos.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {photos.slice(0, 4).map((p, i) => (
                                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/50 relative group">
                                                        <Image src={p.url} alt={`Photo ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ArrowUpRight className="size-4 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground bg-muted/30">
                                                <Camera className="size-6 opacity-20 mb-2" />
                                                <span className="text-[10px] font-semibold uppercase tracking-widest">Pas de photos</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-border shadow-sm bg-card rounded-xl overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-white">
                                        <h3 className="text-[13px] font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                                            <Star className="size-3.5 text-muted-foreground" />
                                            Avis Récents
                                        </h3>
                                        {reviews.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-6 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 -mr-2">Lire tout</Button>
                                        )}
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {loadingDetails ? (
                                            <div className="flex-1 min-h-[160px] flex items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                                        ) : reviews.length > 0 ? (
                                            <div className="space-y-4">
                                                {reviews.slice(0, 2).map((r, i) => (
                                                    <div key={i} className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[12px] font-semibold text-foreground">{r.reviewer?.fullName || "Anonyme"}</span>
                                                            <div className="flex text-amber-500"><Star className="size-2.5 fill-current" /></div>
                                                        </div>
                                                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 italic">&ldquo;{r.comment}&rdquo;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground bg-muted/30">
                                                <MessageSquare className="size-6 opacity-20 mb-2" />
                                                <span className="text-[10px] font-semibold uppercase tracking-widest">Aucun avis</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-border rounded-2xl bg-white/50">
                            <User className="size-16 opacity-10 mb-4" />
                            <p className="text-[14px] font-semibold text-slate-400">Sélectionnez un profil pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
