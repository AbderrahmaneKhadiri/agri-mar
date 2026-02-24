"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, MapPin, Search, Filter, Phone, Mail, Award, CheckCircle2, MessageSquare, User, Users, X, ChevronDown, Star, LayoutGrid, List, ArrowUpRight, ShieldCheck, Camera } from "lucide-react";
import { FarmerListDTO } from "@/data-access/farmers.dal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requestConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
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
        if (initialFarmers.length > 0 && (!selectedFarmerId || !initialFarmers.find(f => f.id === selectedFarmerId))) {
            setSelectedFarmerId(initialFarmers[0].id);
        }
    }, [initialFarmers]);

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
            alert(result.error);
        } else {
            alert("Demande de connexion envoyée avec succès !");
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
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                        placeholder="Rechercher un agriculteur ou une ferme..."
                        className="pl-9 bg-white border-slate-200 h-9 rounded-lg text-[13px] focus-visible:ring-slate-200"
                        defaultValue={searchParams.get('search') || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            const timeoutId = setTimeout(() => updateFilters('search', val), 500);
                            return () => clearTimeout(timeoutId);
                        }}
                    />
                </div>
                <Select value={searchParams.get('region') || "all"} onValueChange={(v) => updateFilters('region', v)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-[12px] font-semibold rounded-lg">
                        <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {MAROC_REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={searchParams.get('cropType') || "all"} onValueChange={(v) => updateFilters('cropType', v)}>
                    <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-[12px] font-semibold rounded-lg">
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
                <div className="col-span-12 lg:col-span-4 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <div className="p-4 border-b bg-slate-50/30">
                        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users className="size-3.5" />
                            Résultats ({farmers.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 p-2 scrollbar-none">
                        {farmers.map((farmer) => (
                            <div
                                key={farmer.id}
                                onClick={() => setSelectedFarmerId(farmer.id)}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3",
                                    selectedFarmerId === farmer.id
                                        ? "bg-slate-100/60 text-slate-900 shadow-sm"
                                        : "hover:bg-slate-50 text-slate-700 border border-transparent"
                                )}
                            >
                                <Avatar className="size-10 rounded-lg border border-slate-200/50 shrink-0 shadow-sm">
                                    <AvatarImage src={farmer.avatarUrl || ""} />
                                    <AvatarFallback className={cn("text-xs font-bold", selectedFarmerId === farmer.id ? "bg-white/50" : "bg-slate-100")}>
                                        {farmer.fullName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[13px] font-bold truncate">{farmer.fullName}</h4>
                                        <Badge variant="outline" className={cn("text-[8px] font-bold uppercase tracking-tighter px-1 py-0 h-4 border-none", selectedFarmerId === farmer.id ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500")}>
                                            PRO
                                        </Badge>
                                    </div>
                                    <p className={cn("text-[10px] font-medium truncate mt-0.5", selectedFarmerId === farmer.id ? "text-slate-500" : "text-slate-400")}>
                                        {farmer.mainCrops.join(", ") || "Cultures Diverses"}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <MapPin className="size-3 opacity-50" />
                                        <span className="text-[10px] font-semibold">{farmer.city}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Farmer Detail Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {selectedFarmer ? (
                        <>
                            {/* Profile Header Card */}
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
                                <div className="h-32 bg-slate-50 w-full relative border-b border-slate-100">
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
                                        <Avatar className="size-24 rounded-2xl border-4 border-white shadow-2xl bg-white ring-1 ring-slate-100">
                                            <AvatarImage src={selectedFarmer.avatarUrl || ""} />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-50 text-slate-900">
                                                {selectedFarmer.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="pb-2 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedFarmer.fullName}</h2>
                                                <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full border border-emerald-100">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400" /> {selectedFarmer.city}, {selectedFarmer.region}</span>
                                                <span className="flex items-center gap-1.5"><Award className="size-3.5 text-slate-400" /> {selectedFarmer.totalAreaHectares} Hectares</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Note Moyenne</p>
                                            <div className="flex items-center gap-1.5">
                                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                                <span className="text-lg font-bold text-slate-900">{averageRating?.toFixed(1) || "4.8"}</span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-400 mt-1">{reviewCount || "12"} avis clients</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cultures Phares</p>
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {selectedFarmer.mainCrops.slice(0, 2).map((crop, i) => (
                                                    <Badge key={i} variant="outline" className="bg-white text-[9px] font-bold border-slate-200">{crop}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expertise</p>
                                            <p className="text-[13px] font-bold text-slate-900 uppercase">{selectedFarmer.farmingMethods[0] || "Drip Irrigation"}</p>
                                            <span className="text-[9px] font-bold text-blue-600 mt-1 uppercase tracking-widest">Certifié Bio</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="size-4 text-slate-900" />
                                            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Profil Vérifié Agri-Mar</h4>
                                        </div>
                                        <p className="text-[14px] text-slate-600 leading-relaxed font-normal">
                                            Expert en production de {selectedFarmer.mainCrops.join(", ")} avec plus de 10 ans d&apos;expérience dans la région de {selectedFarmer.region}.
                                            Exploitation modernisée utilisant des techniques de {selectedFarmer.farmingMethods.join(" et ")}.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gallery Carousel/Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
                                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-[13px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <Camera className="size-3.5" />
                                            Exploitation
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-blue-600 px-2">Show all</Button>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        {loadingDetails ? (
                                            <div className="h-40 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-slate-200" /></div>
                                        ) : photos.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {photos.slice(0, 4).map((p, i) => (
                                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-50 border relative group">
                                                        <img src={p.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ArrowUpRight className="size-4 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-300">
                                                <Camera className="size-8 opacity-20 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Pas de média</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
                                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-[13px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <Star className="size-3.5" />
                                            Avis Récents
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-blue-600 px-2">Read feedback</Button>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        {loadingDetails ? (
                                            <div className="h-40 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-slate-200" /></div>
                                        ) : reviews.length > 0 ? (
                                            reviews.slice(0, 2).map((r, i) => (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[12px] font-bold text-slate-900">{r.reviewer?.fullName || "Anonyme"}</span>
                                                        <div className="flex text-amber-400"><Star className="size-2.5 fill-current" /></div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 italic">&quot;{r.comment}&quot;</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-300">
                                                <MessageSquare className="size-8 opacity-20 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Aucun avis</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-white/50">
                            <User className="size-16 opacity-10 mb-4" />
                            <p className="text-[14px] font-semibold text-slate-400">Sélectionnez un profil pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
