"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Phone,
    Mail,
    Tractor,
    Globe,
    Activity,
    Camera,
    Star,
    Loader2,
    ShieldCheck,
    Building2,
    ArrowUpRight,
    FileText,
    Truck,
    ThermometerSnowflake,
    ClipboardCheck,
    Calendar,
    Sprout,
    ArrowLeft
} from "lucide-react";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { getFarmerAnalyticsAction } from "@/actions/agromonitoring.actions";
import { PartnerDTO } from "@/data-access/connections.dal";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SupplierProfileDetailProps {
    supplier: PartnerDTO;
    onBack: () => void;
}

export function SupplierProfileDetail({ supplier, onBack }: SupplierProfileDetailProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingExtra, setIsLoadingExtra] = useState(false);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (supplier) {
            setIsLoadingExtra(true);
            fetch(`/api/farmer/${supplier.profileId}/gallery`)
                .then(res => res.json())
                .then(data => {
                    setPhotos(data.photos || []);
                    setReviews(data.reviews || []);
                })
                .catch(err => console.error("Profile extra data fetch error:", err))
                .finally(() => setIsLoadingExtra(false));

            if (supplier.parcelPolygonId) {
                setIsLoadingAnalytics(true);
                getFarmerAnalyticsAction(supplier.parcelPolygonId)
                    .then(res => {
                        if (res.data) setAnalytics(res.data);
                    })
                    .catch(err => console.error("Analytics fetch error:", err))
                    .finally(() => setIsLoadingAnalytics(false));
            }
        }
    }, [supplier]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Top Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-[11px] uppercase tracking-widest"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à la liste
                </Button>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">Sourcing & Partenariat</span>
                </div>
            </div>

            {/* Header section with profile overview */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <Avatar className="size-32 rounded-3xl ring-8 ring-slate-50 shadow-xl border border-white">
                        {supplier.avatarUrl && <AvatarImage src={supplier.avatarUrl} className="object-cover" />}
                        <AvatarFallback className="text-4xl font-black bg-slate-100 text-slate-300">
                            {supplier.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{supplier.name}</h2>
                            <Badge variant="outline" className="border-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-wider px-4 py-1.5 bg-emerald-50/50 w-fit mx-auto md:mx-0">
                                <ShieldCheck className="size-4 mr-2 text-emerald-500" /> Partenaire Vérifié
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[13px] font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-slate-400" /> {supplier.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-slate-400" /> Partenaire depuis {format(new Date(supplier.since), "MMMM yyyy", { locale: fr })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Qualification & Identity Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2.5">
                            <Globe className="size-4 text-slate-400" /> Identité Business
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exploitation</span>
                                <p className="text-[14px] font-black text-slate-900 leading-tight">{supplier.farmName || supplier.name}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1.5 shadow-sm">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ICE</span>
                                    <p className="text-[14px] font-black text-slate-900">{supplier.iceNumber || "--"}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1.5 shadow-sm">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ONSSA</span>
                                    <p className="text-[14px] font-black text-slate-900 truncate">{supplier.onssaCert || "--"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2.5">
                            <Phone className="size-4 text-slate-400" /> Contacts Directs
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group">
                                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                    <Phone className="size-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Mobile</p>
                                    <p className="text-[13px] font-bold text-slate-900">{supplier.phone || "--"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group">
                                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                    <Mail className="size-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Email Pro</p>
                                    <p className="text-[13px] font-bold text-slate-900 truncate">{supplier.email || "--"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics & Practices Core */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[2px] flex items-center gap-3">
                                <Truck className="size-5 text-emerald-500" /> Capacités & Logistique
                            </h3>
                            <Badge className="bg-[#2c5f42] text-white font-black text-[10px] px-3 py-1 uppercase italic tracking-widest">Premium Sourcing</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-xl bg-sky-50 flex items-center justify-center">
                                                <ThermometerSnowflake className="size-4 text-sky-600" />
                                            </div>
                                            <span className="text-[13px] font-black text-slate-700">Stockage Froid</span>
                                        </div>
                                        <Badge variant={supplier.hasColdStorage ? "default" : "secondary"} className={cn("text-[10px] font-black px-3 py-1", supplier.hasColdStorage ? "bg-emerald-500" : "bg-slate-200")}>
                                            {supplier.hasColdStorage ? "DISPONIBLE" : "NON"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                <Truck className="size-4 text-emerald-600" />
                                            </div>
                                            <span className="text-[13px] font-black text-slate-700">Livraison Flotte</span>
                                        </div>
                                        <Badge variant={supplier.deliveryCapacity ? "default" : "secondary"} className={cn("text-[10px] font-black px-3 py-1", supplier.deliveryCapacity ? "bg-emerald-500" : "bg-slate-200")}>
                                            {supplier.deliveryCapacity ? "ASSURÉE" : "NON"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-xl bg-slate-50 flex items-center justify-center">
                                                <FileText className="size-4 text-slate-600" />
                                            </div>
                                            <span className="text-[13px] font-black text-slate-700">Contrat Exclusif</span>
                                        </div>
                                        <Badge variant={supplier.longTermContractAvailable ? "default" : "secondary"} className={cn("text-[10px] font-black px-3 py-1", supplier.longTermContractAvailable ? "bg-emerald-500" : "bg-slate-200")}>
                                            {supplier.longTermContractAvailable ? "ELIGIBLE" : "NON"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sprout className="size-3.5" /> Pratiques Culturales
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                            <span className="text-[12px] font-bold text-slate-500">Irrigation</span>
                                            <span className="text-[13px] font-black text-slate-900">{supplier.irrigationType || "--"}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[12px] font-bold text-slate-500">Saisonnalité</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {supplier.seasonality?.map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm">{s}</span>
                                                )) || "--"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2.5">
                                    <Tractor className="size-4 text-slate-400" /> Cultures Principales
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {supplier.cropTypes?.map((crop, i) => (
                                        <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none font-black px-4 py-2 text-[12px] rounded-2xl shadow-sm">
                                            {crop}
                                        </Badge>
                                    )) || <span className="text-[12px] text-slate-400 italic">Aucune culture renseignée</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surface Totale</p>
                                    <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{supplier.totalArea || "--"} <span className="text-sm font-bold uppercase not-italic text-slate-400">Ha</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prod. Annuelle</p>
                                    <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{supplier.production || "--"} <span className="text-sm font-bold uppercase not-italic text-slate-400">Tonnes</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery Grid */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <Camera className="size-5 text-slate-400" /> Galerie de l&apos;Exploitation
                        </h3>
                        {isLoadingExtra ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-video bg-slate-50 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : photos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {photos.map((url, i) => (
                                    <div key={i} className="aspect-[4/3] relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm group cursor-pointer">
                                        <Image src={url} alt={`Photo ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold italic text-[12px]">
                                Aucune image disponible pour le moment
                            </div>
                        )}
                    </div>
                </div>

                {/* Satellite Monitoring Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-[#2c5f42] rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 sticky top-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Activity className="size-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Direct Monitoring</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight leading-tight italic">Analyse Géo-Spatiale</h3>
                        </div>

                        {!supplier.parcelPolygonId ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 px-4 bg-white/5 rounded-3xl border border-white/10">
                                <Tractor className="size-10 text-white/20" />
                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Coordonnées manquantes</p>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">Les données satellite nécessitent le traçage du périmètre de la parcelle.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-3xl overflow-hidden border border-white/10 bg-white shadow-xl">
                                    <NdviChart data={analytics?.ndvi || []} isSyncing={isLoadingAnalytics} hideHeader />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Température Sol</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black italic">
                                                {analytics?.weather?.main?.temp ? `${Math.round(analytics.weather.main.temp)}°C` : "--"}
                                            </span>
                                            <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] px-2 shadow-lg shadow-emerald-500/20">STABLE</Badge>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Humidité Monitorée</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black italic">
                                                {analytics?.soil?.moisture ? `${(analytics.soil.moisture * 100).toFixed(1)}%` : "--"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10 space-y-6">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Témoignages Partenaires</h4>
                            {isLoadingExtra ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.slice(0, 2).map((r, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 relative">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-6 rounded-lg ring-1 ring-white/10">
                                                        {r.reviewer?.avatarUrl && <AvatarImage src={r.reviewer.avatarUrl} />}
                                                        <AvatarFallback className="text-[8px]">{r.reviewer?.fullName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[10px] font-black truncate max-w-[80px]">{r.reviewer?.fullName}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, j) => (
                                                        <Star key={j} className={cn("size-2", j < (r.rating || 5) ? "fill-white text-white" : "text-white/20")} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-white/60 leading-relaxed italic line-clamp-2">&ldquo;{r.comment}&rdquo;</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl text-white/20 font-bold italic text-[10px]">
                                    Nouveu partenaire
                                </div>
                            )}
                        </div>

                        <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[12px] tracking-widest shadow-xl shadow-white/5">
                            Engager Négociation <ArrowUpRight className="size-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
