"use client";

import { useState, useMemo, useEffect } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin, Search, ShieldCheck, Star, Camera,
    MessageSquare, CheckCircle2, Truck, Loader2, Users,
    X, Globe, Network, Info, Boxes, Briefcase, Sprout,
    Waves, Tractor, Calendar, Phone, Mail,
    ArrowUpRight, Activity, ThermometerSnowflake
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { getFarmerAnalyticsAction } from "@/actions/agromonitoring.actions";

export function SupplierNetworkClient({
    initialSuppliers
}: {
    initialSuppliers: PartnerDTO[]
}) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(initialSuppliers[0]?.id || null);

    const filtered = useMemo(() => {
        return initialSuppliers.filter(s => {
            const query = search.toLowerCase();
            return !query ||
                s.name.toLowerCase().includes(query) ||
                (s.farmName || "").toLowerCase().includes(query) ||
                s.location.toLowerCase().includes(query);
        });
    }, [initialSuppliers, search]);

    const selected = useMemo(() => filtered.find(s => s.id === selectedId) || filtered[0], [filtered, selectedId]);

    // Gallery/reviews/analytics per supplier
    const [photos, setPhotos] = useState<string[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [loadingExtra, setLoadingExtra] = useState(false);
    const [monitorAnalytics, setMonitorAnalytics] = useState<any>(null);
    const [isLoadingMonitor, setIsLoadingMonitor] = useState(false);

    useEffect(() => {
        if (!selected) return;
        setLoadingExtra(true);
        setPhotos([]);
        setReviews([]);
        setAvgRating(null);
        setReviewCount(0);

        fetch(`/api/farmer/${selected.profileId}/gallery`)
            .then(r => r.json())
            .then(data => {
                setPhotos((data.photos || []).map((p: any) => p.url));
                setReviews(data.reviews || []);
                setAvgRating(data.averageRating ?? null);
                setReviewCount(data.reviewCount ?? 0);
            })
            .catch(err => console.error("Gallery fetch err:", err))
            .finally(() => setLoadingExtra(false));

        if (selected.parcelPolygonId) {
            setIsLoadingMonitor(true);
            getFarmerAnalyticsAction(selected.parcelPolygonId)
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
    }, [selected?.id]);

    return (
        <div className="flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border mt-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                        placeholder="Rechercher un partenaire..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-50 border-transparent h-9 rounded-lg text-[13px] focus-visible:ring-slate-200 shadow-none"
                    />
                </div>
                {search && (
                    <Button variant="ghost" size="sm"
                        className="h-9 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-900"
                        onClick={() => setSearch("")}>
                        <X className="size-3 mr-1.5" /> Réinitialiser
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left: Supplier list */}
                <div className="col-span-12 lg:col-span-4 border border-border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-slate-50">
                        <Users className="size-4 text-slate-900" />
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                            Partenaires <span className="text-slate-400 font-bold">({filtered.length})</span>
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <Network className="size-8 opacity-20" />
                                <p className="text-[12px] font-medium">Aucun partenaire trouvé</p>
                            </div>
                        ) : filtered.map(supplier => {
                            const isSelected = selected?.id === supplier.id;
                            return (
                                <div
                                    key={supplier.id}
                                    onClick={() => setSelectedId(supplier.id)}
                                    className={cn(
                                        "mx-2 px-4 py-3 rounded-xl cursor-pointer transition-all flex items-start gap-4",
                                        isSelected ? "bg-slate-900 border border-slate-900 shadow-md shadow-slate-200" : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <Avatar className="size-11 rounded-xl border border-border shrink-0 mt-0.5">
                                        <AvatarImage src={supplier.avatarUrl || ""} />
                                        <AvatarFallback className={cn("text-[12px] font-bold rounded-xl",
                                            isSelected ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500")}>
                                            {supplier.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between mb-0.5">
                                            <h4 className={cn("text-[14px] font-bold truncate", isSelected ? "text-white" : "text-slate-900")}>{supplier.name}</h4>
                                            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 h-4 ml-2",
                                                isSelected ? "bg-white/10 text-white border-white/20" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                                PARTENAIRE
                                            </Badge>
                                        </div>
                                        <p className={cn("text-[11px] truncate mb-1.5", isSelected ? "text-slate-300" : "text-slate-500")}>
                                            Depuis {format(new Date(supplier.since), "MMM yyyy", { locale: fr })}
                                        </p>
                                        <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", isSelected ? "text-slate-400" : "text-slate-400")}>
                                            <MapPin className="size-3 shrink-0" />
                                            <span className="truncate">{supplier.location}</span>
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
                                <div className="h-32 bg-slate-900 w-full relative">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white_1px,transparent_1px)] [background-size:15px_15px]" />
                                    <div className="absolute top-4 right-4">
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 gap-1.5 rounded-lg backdrop-blur-md">
                                            <CheckCircle2 className="size-4" /> Relation Etablie
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="px-8 pb-8 -mt-10 relative">
                                    <div className="flex items-end gap-6 mb-8">
                                        <Avatar className="size-24 rounded-2xl border flex-shrink-0 bg-white shadow-sm ring-4 ring-white overflow-hidden">
                                            <AvatarImage src={selected.avatarUrl || ""} className="object-cover" />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-100 text-slate-900">
                                                {selected.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="pb-1 space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate uppercase">{selected.name}</h2>
                                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                                    <ShieldCheck className="size-3" /> Fournisseur Direct
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[13px] text-slate-500 font-bold">
                                                <MapPin className="size-3.5 text-slate-400" />
                                                <span className="truncate">{selected.location}</span>
                                            </div>
                                        </div>
                                        <div className="pb-1">
                                            <Button className="h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-slate-200 px-6">
                                                Ouvrir Chat <MessageSquare className="size-3.5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-5 rounded-2xl border border-slate-100 flex flex-col items-start bg-slate-50/50 shadow-sm transition-all hover:bg-white hover:border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Star className="size-3.5 text-slate-700" /> Qualité
                                            </p>
                                            <span className="text-2xl font-black text-slate-900">{avgRating ? avgRating.toFixed(1) : "—"}</span>
                                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{reviewCount} avis certifiés</p>
                                        </div>
                                        <div className="p-5 rounded-2xl border border-slate-100 flex flex-col items-start bg-slate-50/50 shadow-sm transition-all hover:bg-white hover:border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Boxes className="size-3.5 text-slate-700" /> Appro
                                            </p>
                                            <span className="text-xl font-black text-slate-900 truncate w-full uppercase">{selected.production || "Non spécifié"}</span>
                                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Capacité Annuelle</p>
                                        </div>
                                        <div className="p-5 rounded-2xl border border-slate-100 flex flex-col items-start bg-slate-50/50 shadow-sm transition-all hover:bg-white hover:border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Briefcase className="size-3.5 text-slate-700" /> Entité
                                            </p>
                                            <span className="text-xl font-black text-slate-900 truncate w-full uppercase">{selected.farmName || "Exploitation"}</span>
                                            <p className="text-[11px] font-black text-slate-900 mt-1 uppercase tracking-widest text-[9px] bg-slate-100 px-2 py-0.5 rounded">
                                                {selected.onssaCert ? "AGREE ONSSA" : "DOCUMENTE"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Logistics & Business Info */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {[
                                            { icon: ShieldCheck, label: "ICE", value: selected.iceNumber || "--" },
                                            { icon: CheckCircle2, label: "CONFORMITE", value: selected.onssaCert ? "ONSSA" : "VÉRIFIÉ", bold: true },
                                            { icon: Waves, label: "SOURCE EAU", value: selected.irrigationType || "Standard" },
                                            { icon: Truck, label: "LIVRAISON", value: selected.deliveryCapacity ? "PROPRE" : "TIERS" },
                                        ].map(({ icon: Icon, label, value, bold }) => (
                                            <div key={label} className="p-4 rounded-xl border border-slate-100 flex flex-col items-start bg-white shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0">
                                                    <Icon className="size-3.5 text-slate-600" /> {label}
                                                </p>
                                                <span className={cn("text-[12px] font-bold tracking-tight truncate w-full uppercase", bold ? "text-slate-900" : "text-slate-700")}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 rounded-xl border border-slate-100 flex flex-col items-start bg-white shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Globe className="size-3.5 text-slate-600" /> Commercialisation
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selected.businessModel && selected.businessModel.length > 0
                                                    ? selected.businessModel.map(m => (
                                                        <Badge key={m} variant="secondary" className="text-[9px] font-black bg-slate-900 text-white border-none uppercase px-2">{m}</Badge>
                                                    ))
                                                    : <Badge variant="secondary" className="text-[9px] font-black bg-slate-900 text-white border-none uppercase px-2">GROS</Badge>
                                                }
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 flex flex-col items-start bg-white shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Sprout className="size-3.5 text-slate-600" /> Chaîne de Froid
                                            </p>
                                            <span className="text-[12px] font-bold text-slate-900 uppercase">
                                                {selected.hasColdStorage ? "ENTREPOT FROID" : "NON DISPONIBLE"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-100 flex flex-col items-start bg-slate-50/50 shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Phone className="size-3.5 text-slate-600" /> Contact Direct
                                            </p>
                                            <span className="text-[13px] font-black text-slate-900 tabular-nums">
                                                {selected.phone || "--"}
                                            </span>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 flex flex-col items-start bg-slate-50/50 shadow-sm overflow-hidden">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Mail className="size-3.5 text-slate-600" /> Mail Pro
                                            </p>
                                            <span className="text-[13px] font-black text-slate-900 truncate w-full">
                                                {selected.email || "--"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Satellite Monitoring */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 p-4 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                                    <Activity className="size-5 text-slate-400" />
                                    <h3 className="text-[13px] font-black text-white tracking-[0.2em] uppercase">Données Agronomiques</h3>
                                </div>

                                {!selected.parcelPolygonId ? (
                                    <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                        <div className="text-center space-y-3 max-w-sm px-6">
                                            <Tractor className="size-10 text-slate-200 mx-auto" />
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                Données non synchronisées
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter leading-relaxed">
                                                Le profil géospatial du partenaire est manquant.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-6">
                                            <NdviChart
                                                data={monitorAnalytics?.ndvi || []}
                                                isSyncing={isLoadingMonitor}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <WeatherCard
                                                    current={monitorAnalytics?.weather}
                                                    forecast={monitorAnalytics?.forecast}
                                                    locationName={selected.location}
                                                    isSyncing={isLoadingMonitor}
                                                />
                                                <SoilCard
                                                    data={monitorAnalytics?.soil}
                                                    isSyncing={isLoadingMonitor}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Gallery & Reviews */}
                            <div className="grid grid-cols-2 gap-6 pb-10">
                                <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                                            <Camera className="size-3.5 text-slate-500" /> Media Partenaire
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
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
                                                        <Image src={url} alt={`Photo ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <ArrowUpRight className="size-5 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/30">
                                                <Camera className="size-6 opacity-20 mb-2" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Aucun visuel</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                                            <Star className="size-3.5 text-slate-500" /> Feedbacks B2B
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
                                                    <div key={i} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black text-slate-900 uppercase">{r.reviewer?.fullName || "Acheteur"}</span>
                                                            <div className="flex text-slate-900">{Array.from({ length: r.rating || 5 }).map((_, j) => <Star key={j} className="size-2.5 fill-current" />)}</div>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2 uppercase tracking-tighter">&ldquo;{r.comment}&rdquo;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/30">
                                                <MessageSquare className="size-6 opacity-20 mb-2" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Nouveau flux</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-100 rounded-3xl bg-white min-h-[400px]">
                            <Network className="size-16 opacity-5 mb-4 text-slate-900" />
                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Selection Partenaire</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
