"use client";

import { useState } from "react";
import { FarmerListDTO, FarmerDetailDTO } from "@/data-access/farmers.dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, Filter, Phone, Mail, Award, CheckCircle2, MessageSquare, User, Users, X } from "lucide-react";
import { requestConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px]">

            {/* LEFT COLUMN: LISTE DES AGRICULTEURS */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[600px] shadow-sm">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-[9px] font-bold text-green-600 uppercase tracking-[2px] mb-2">Portail de talents</h2>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-4">PROFILS AGRICULTEURS</h3>

                    <div className="space-y-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-green-500 transition-colors" />
                            <Input
                                placeholder="Rechercher par nom ou ferme..."
                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-green-500/20 transition-all rounded-xl h-11"
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
                                className="bg-slate-50 border-slate-200 rounded-xl h-11 px-3 text-sm focus:bg-white focus:ring-green-500/20 outline-none transition-all"
                                value={searchParams.get('region') || "Toutes les régions"}
                                onChange={(e) => updateFilters('region', e.target.value)}
                            >
                                {MAROC_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <select
                                className="bg-slate-50 border-slate-200 rounded-xl h-11 px-3 text-sm focus:bg-white focus:ring-green-500/20 outline-none transition-all"
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {farmers.length === 0 ? (
                        <div className="text-center p-8 text-slate-400">Aucun profil trouvé.</div>
                    ) : (
                        farmers.map((farmer) => (
                            <div
                                key={farmer.id}
                                onClick={() => setSelectedFarmerId(farmer.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                                    selectedFarmerId === farmer.id
                                        ? "border-green-500 bg-green-50/50 shadow-md"
                                        : "border-transparent bg-slate-50/50 hover:bg-white hover:border-green-200"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <AvatarImage src={farmer.avatarUrl || ""} alt={farmer.fullName} />
                                        <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                                            {farmer.fullName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{farmer.fullName}</h4>
                                        <p className="text-[10px] font-bold text-green-600 truncate mt-0.5 uppercase tracking-wider">
                                            {farmer.mainCrops.join(", ") || "Culture Générale"}
                                        </p>
                                        <div className="flex items-center text-xs text-slate-500 mt-2 font-medium">
                                            <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                                            {farmer.city}, {farmer.region}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-2 transition-all",
                                        selectedFarmerId === farmer.id ? "bg-green-500 scale-125" : "bg-transparent"
                                    )} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
                {/* TOP STATS CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-sm border-none bg-white rounded-2xl">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-xl font-black text-slate-900">10+ ans</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-none bg-white rounded-2xl">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px] mb-2">Surface d'exploitation</p>
                            <p className="text-xl font-black text-slate-900">{selectedFarmer?.totalAreaHectares || "0"} Ha</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-none bg-green-50/50 rounded-2xl ring-1 ring-green-100">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[9px] text-green-700 font-bold flex items-center gap-1 uppercase tracking-[2px] mb-2">
                                <CheckCircle2 className="h-3 w-3" /> Certification
                            </p>
                            <p className="text-lg font-black text-green-700">{selectedFarmer?.certifications?.[0] || "Certifié"}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* BOTTOM CONTENT AREA */}
                <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* PROFILE DETAILS */}
                    <div className="col-span-8 space-y-6 overflow-y-auto pr-2 pb-6">
                        <Card className="shadow-sm border-none bg-white rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-3 mb-6">
                                    <User className="h-4 w-4" /> PARCOURS PROFESSIONNEL & VISION
                                </h4>
                                <p className="text-[13px] text-slate-600 leading-[1.7] font-medium">
                                    Spécialiste de la culture de {selectedFarmer?.mainCrops.join(", ")}. Expert en techniques de {selectedFarmer?.farmingMethods?.[0] || "culture raisonnée"} et optimisation des ressources. Partenaire de qualité pour le marché local et international.
                                </p>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-8 mt-8 pt-8 border-t border-slate-50">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">CULTURES</p>
                                        <p className="text-xs font-bold text-slate-800">{selectedFarmer?.mainCrops.join(", ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">MÉTHODES</p>
                                        <p className="text-sm font-bold text-slate-800 font-sans">{selectedFarmer?.farmingMethods?.join(", ") || "Traditionnelles"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Production Annuelle</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedFarmer?.avgAnnualProduction || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Localisation</p>
                                        <p className="text-sm font-bold text-slate-800 font-sans">{selectedFarmer?.city}, {selectedFarmer?.region}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* GALLERY PREVIEW */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-3 px-2">
                                APERÇU DE L'EXPLOITATION
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-48 bg-slate-200 rounded-3xl overflow-hidden shadow-sm relative group">
                                    <img src="https://images.unsplash.com/photo-1595856754098-958aed1a3809?w=600&q=80" alt="Farm" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="h-48 bg-slate-200 rounded-3xl overflow-hidden shadow-sm relative group">
                                    <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a38a?w=600&q=80" alt="Tomatoes" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION CARD */}
                    <div className="col-span-4 h-fit sticky top-0">
                        <Card className="bg-slate-900 border-none rounded-[2rem] overflow-hidden h-full flex flex-col shadow-2xl relative">
                            {/* Abstract Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="h-40 flex items-center justify-center relative bg-gradient-to-b from-slate-800 to-slate-900 p-8">
                                <Avatar className="h-28 w-28 border-[6px] border-slate-900 absolute -bottom-14 shadow-2xl ring-1 ring-slate-800 overflow-hidden">
                                    <AvatarImage src={selectedFarmer?.avatarUrl || ""} className="object-cover" />
                                    <AvatarFallback className="bg-green-600 text-white text-3xl font-black">
                                        {selectedFarmer?.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <CardContent className="pt-20 pb-10 px-8 flex flex-col items-center text-center flex-1 min-h-0">
                                <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-2">
                                    {selectedFarmer?.fullName.toUpperCase()}
                                </h3>
                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-[3px] mb-10">
                                    {selectedFarmer?.mainCrops[0] || "EXPERT MARAÎCHER"} & AGRONOMIE
                                </p>

                                <div className="text-left w-full space-y-6 mb-12">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-800 p-2 rounded-lg">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Zone d'influence</p>
                                            <p className="text-sm font-bold text-slate-200">{selectedFarmer?.city}, {selectedFarmer?.region}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-800 p-2 rounded-lg">
                                            <Award className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Vérification</p>
                                            <p className="text-sm font-bold text-slate-200">Profil certifié ONSSA</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-800 p-2 rounded-lg">
                                            <Users className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Disponibilité</p>
                                            <p className="text-sm font-bold text-slate-200">Collaborations B2B</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black h-14 rounded-2xl text-xs tracking-widest shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all"
                                        onClick={handleProposeContract}
                                        disabled={isRequesting || !selectedFarmerId}
                                    >
                                        {isRequesting ? 'ENVOI...' : 'PROPOSER UN CONTRAT'}
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 h-12 rounded-2xl border-none ring-1 ring-slate-700/50">
                                            <MessageSquare className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 h-12 rounded-2xl border-none ring-1 ring-slate-700/50">
                                            <Phone className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for icons/labels if needed could be added here
