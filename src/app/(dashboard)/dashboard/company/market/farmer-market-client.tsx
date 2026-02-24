"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { FarmerListDTO, FarmerDetailDTO } from "@/data-access/farmers.dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Filter, Phone, Mail, Award, CheckCircle2, MessageSquare, User, Users, X } from "lucide-react";
import { requestConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MAROC_REGIONS = [
    "Toutes les régions",
    "Souss-Massa",
    "Gharb-Chrarda-Béni Hssen",
    "Doukkala-Abda",
    "Oriental",
    "Safi",
    "Marrakech-Tensift-Al Haouz",
    "Fès-Boulemane"
];

const COMMON_CROPS = [
    "Toutes les cultures",
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

    // Sync state with props when initialFarmers change (after server re-fetch)
    useEffect(() => {
        setFarmers(initialFarmers);
        if (initialFarmers.length > 0 && (!selectedFarmerId || !initialFarmers.find(f => f.id === selectedFarmerId))) {
            setSelectedFarmerId(initialFarmers[0].id);
        }
    }, [initialFarmers]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== "" && !value.includes("Toutes")) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const updateFilters = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value), { scroll: false });
    };

    const selectedFarmer = farmers.find(f => f.id === selectedFarmerId);

    // State for gallery and reviews
    const [photos, setPhotos] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    return (
        <div className="flex flex-col gap-6 -mt-4 pb-10">
            <div className="px-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Marché Agricole</h1>
                <p className="text-slate-500 font-medium mt-1 text-sm">Découvrez et connectez-vous avec les meilleurs agriculteurs du Maroc.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px] mt-2">

                {/* LEFT COLUMN: LISTE DES AGRICULTEURS */}
                <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm h-fit sticky top-6">
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[2px] mb-2">PORTAIL DE TALENTS</p>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-6 uppercase tracking-tight">PROFILS AGRICULTEURS</h3>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher par nom ou ferme..."
                                    className="pl-10 bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-emerald-500/10 focus-visible:bg-white transition-all text-sm"
                                    defaultValue={searchParams.get('search') || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const timeoutId = setTimeout(() => updateFilters('search', val), 500);
                                        return () => clearTimeout(timeoutId);
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="w-full bg-slate-50 border-none rounded-xl h-12 px-3 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-600"
                                    value={searchParams.get('region') || "Toutes les régions"}
                                    onChange={(e) => updateFilters('region', e.target.value)}
                                >
                                    {MAROC_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-xl h-12 px-3 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-600"
                                    value={searchParams.get('cropType') || "Toutes les cultures"}
                                    onChange={(e) => updateFilters('cropType', e.target.value)}
                                >
                                    {COMMON_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {searchParams.toString() !== "" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-slate-400 hover:text-slate-600 h-8 text-[10px] font-bold uppercase tracking-wider"
                                    onClick={() => router.push(pathname)}
                                >
                                    <X className="h-3 w-3 mr-1" /> Effacer les filtres
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* LISTING SCROLLABLE */}
                    <div className="px-5 pb-6 space-y-3">
                        {farmers.length === 0 ? (
                            <div className="text-center py-10 text-slate-300 font-medium text-xs">Aucun agriculteur trouvé.</div>
                        ) : (
                            farmers.map((farmer) => (
                                <div
                                    key={farmer.id}
                                    onClick={() => setSelectedFarmerId(farmer.id)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all cursor-pointer group relative",
                                        selectedFarmerId === farmer.id
                                            ? "border-emerald-500 bg-white"
                                            : "border-transparent bg-slate-50/50 hover:bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <AvatarImage src={farmer.avatarUrl || ""} alt={farmer.fullName} />
                                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">
                                                {farmer.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate">{farmer.fullName}</h4>
                                            <p className="text-[9px] font-bold text-emerald-600 truncate mt-0.5 uppercase tracking-wide">
                                                {farmer.mainCrops.join(", ") || "CULTURE GÉNÉRALE"}
                                            </p>
                                            <div className="flex items-center text-[10px] text-slate-400 mt-1 font-medium">
                                                <MapPin className="h-3 w-3 mr-1 opacity-50" />
                                                {farmer.city}, {farmer.region}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full shadow-sm transition-all",
                                            selectedFarmerId === farmer.id ? "bg-emerald-500" : "bg-transparent"
                                        )} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILS */}
                <div className="lg:col-span-9 flex flex-col space-y-8">
                    {/* TOP STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border border-slate-100 bg-white rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 right-4 text-slate-100 group-hover:text-emerald-500/10 transition-colors">
                                <MapPin className="h-12 w-12" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px] mb-4">Surface Exploitation</p>
                                <p className="text-4xl font-black text-slate-900 leading-none">{selectedFarmer?.totalAreaHectares || "0"} <span className="text-sm text-slate-400 font-bold ml-1">Hectares</span></p>
                            </div>
                        </Card>
                        {selectedFarmer?.certifications && selectedFarmer.certifications.length > 0 && (
                            <Card className="shadow-sm border border-slate-100 bg-white rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-4 right-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                                    <CheckCircle2 className="h-12 w-12" />
                                </div>
                                <div className="relative z-10 text-emerald-950">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px] mb-4">Certification</p>
                                    <p className="text-2xl font-black text-emerald-600 leading-none flex items-center gap-2">
                                        {selectedFarmer.certifications.join(", ")}
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* BOTTOM CONTENT AREA */}
                    <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                        {/* PROFILE DETAILS */}
                        <div className="col-span-12 lg:col-span-8 space-y-8 overflow-y-auto pr-2 pb-6 scrollbar-hide">
                            <Card className="shadow-sm border border-slate-100 bg-white rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="bg-slate-50 p-3 rounded-2xl ring-1 ring-slate-100">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
                                            CATALOGUE DE PRODUCTION & DISPONIBILITÉ
                                        </h4>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-50">
                                            <div className="col-span-8">Produit</div>
                                            <div className="col-span-4 text-right">Qualité</div>
                                        </div>

                                        <div className="space-y-6">
                                            {selectedFarmer?.mainCrops && selectedFarmer.mainCrops.length > 0 ? (
                                                selectedFarmer.mainCrops.map((crop, idx) => (
                                                    <div key={idx} className="grid grid-cols-12 items-center group">
                                                        <div className="col-span-8">
                                                            <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{crop}</p>
                                                        </div>
                                                        <div className="col-span-4 text-right">
                                                            <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                                                                PREMIUM
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 font-medium italic">Aucun produit listé dans le catalogue pour le moment.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-slate-50">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-emerald-50 p-2 rounded-xl">
                                                <Award className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
                                                PARCOURS PROFESSIONNEL & VISION
                                            </h4>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-[1.8] font-medium max-w-2xl">
                                            {selectedFarmer?.mainCrops && selectedFarmer.mainCrops.length > 0
                                                ? `Spécialiste de la culture de ${selectedFarmer.mainCrops.join(", ")}. `
                                                : "Exploitant agricole passionné. "}
                                            {selectedFarmer?.farmingMethods && selectedFarmer.farmingMethods.length > 0
                                                ? `Expert en techniques de ${selectedFarmer.farmingMethods.join(", ")} et optimisation des ressources. `
                                                : "Expert en techniques culturales modernes. "}
                                            Partenaire de qualité pour le marché local et international.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* GALLERY SECTION */}
                            <div className="space-y-6">
                                <Card className="shadow-sm border border-slate-100 bg-white rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="p-8 pb-4 border-b border-emerald-50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-50 p-2 rounded-xl">
                                                <Filter className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Galerie photos</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        {loadingDetails ? (
                                            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-emerald-200 animate-spin" /></div>
                                        ) : photos.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                {photos.map((photo, i) => (
                                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100 group cursor-pointer">
                                                        <img src={photo.url} alt={photo.caption || 'Photo'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                                <MapPin className="h-12 w-12 mb-4 opacity-10" />
                                                <p className="text-[10px] font-black uppercase tracking-[2px]">Aucune photo disponible</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* REVIEWS SECTION */}
                            <Card className="shadow-sm border-none bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="p-4 border-b border-slate-50 flex justify-between items-center">
                                    <CardTitle className="text-xl font-black text-slate-900">Avis & notes</CardTitle>
                                    {averageRating !== null && (
                                        <div className="flex items-center space-x-1 text-yellow-500">
                                            <span className="font-bold">{averageRating.toFixed(1)}</span>
                                            <span className="text-sm text-slate-600">/ 5</span>
                                            <span className="text-sm text-slate-600">({reviewCount})</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {loadingDetails ? (
                                        <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                    ) : reviews.length > 0 ? (
                                        reviews.map((rev, i) => (
                                            <div key={i} className="border-b pb-2 last:border-b-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium">{rev.reviewer?.fullName || 'Utilisateur'}</span>
                                                    <span className="text-yellow-500">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                                                </div>
                                                <p className="text-sm text-slate-700">{rev.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-slate-400">Aucun avis pour le moment.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* ACTION CARD */}
                        <div className="col-span-12 lg:col-span-4 h-fit sticky top-6">
                            <Card className="bg-[#0B1221] border-none rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                                {/* Accent line at the top */}
                                <div className="h-1.5 w-full bg-emerald-500" />

                                <div className="pt-16 pb-12 px-8 flex flex-col items-center text-center">
                                    <div className="relative mb-8">
                                        <Avatar className="h-32 w-32 border-[8px] border-[#151C2C] shadow-2xl ring-1 ring-emerald-500/20">
                                            <AvatarImage src={selectedFarmer?.avatarUrl || ""} className="object-cover" />
                                            <AvatarFallback className="bg-emerald-600 text-white text-3xl font-black">
                                                {selectedFarmer?.fullName.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -right-2 -bottom-2 bg-emerald-500 p-2 rounded-full border-4 border-[#0B1221] shadow-lg">
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-tight mb-2 max-w-[200px]">
                                        {selectedFarmer?.fullName}
                                    </h3>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[3px] mb-12">
                                        {selectedFarmer?.mainCrops[0] || "EXPLOITANT"} CERTIFIÉ
                                    </p>

                                    <div className="w-full space-y-7 text-left mb-12">
                                        <div className="flex items-center gap-4 group">
                                            <div className="bg-[#151C2C] p-2.5 rounded-xl">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] uppercase text-slate-500 font-bold tracking-[2px] mb-1">SIÈGE EXPLOITATION</p>
                                                <p className="text-xs font-bold text-slate-200">{selectedFarmer?.city}, {selectedFarmer?.region}</p>
                                            </div>
                                        </div>

                                        {selectedFarmer?.certifications && selectedFarmer.certifications.length > 0 && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="bg-[#151C2C] p-2.5 rounded-xl">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] uppercase text-slate-500 font-bold tracking-[2px] mb-1">VÉRIFICATION</p>
                                                    <p className="text-xs font-bold text-slate-200">{selectedFarmer.certifications[0]}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 group">
                                            <div className="bg-[#151C2C] p-2.5 rounded-xl">
                                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] uppercase text-slate-500 font-bold tracking-[2px] mb-1">DISPONIBILITÉ</p>
                                                <p className="text-xs font-bold text-slate-200">Contact via contrat</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black h-16 rounded-[1.25rem] text-[13px] tracking-widest shadow-xl shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                            onClick={handleProposeContract}
                                            disabled={isRequesting || !selectedFarmerId}
                                        >
                                            {isRequesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                                            PROPOSER UN CONTRAT
                                        </Button>

                                        <div className="pt-6">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px]">ID VÉRIFIÉ: #{selectedFarmer?.id.slice(0, 8).toUpperCase() || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for icons/labels if needed could be added here
