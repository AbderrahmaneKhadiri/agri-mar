"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
    ArrowLeft,
    CheckCircle2,
    Boxes,
    Briefcase,
    Waves,
    Info,
    Network,
    MessageSquare,
    Clock
} from "lucide-react";
import { AgroAnalyticsChart } from "@/components/dashboard/agro-analytics-chart";
import { AdvancedInsightsGrid } from "@/components/dashboard/advanced-insights-grid";
import { SatelliteVisionCard } from "@/components/dashboard/satellite-vision-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { SoilCard } from "@/components/dashboard/soil-card";
import { getFarmerAnalyticsAction, getSatelliteImageryAction } from "@/actions/agromonitoring.actions";

import { PartnerDTO } from "@/data-access/connections.dal";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SupplierProfileDetailProps {
    supplier: PartnerDTO;
    onBack: () => void;
    isPartner?: boolean;
}

export function SupplierProfileDetail({ supplier, onBack, isPartner = true }: SupplierProfileDetailProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [analytics, setAnalytics] = useState<any>(null);
    const [satelliteScenes, setSatelliteScenes] = useState<any[]>([]);
    const [isLoadingExtra, setIsLoadingExtra] = useState(false);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (supplier) {
            setIsLoadingExtra(true);
            fetch(`/api/farmer/${supplier.profileId}/gallery`)
                .then(res => res.json())
                .then(data => {
                    setPhotos((data.photos || []).map((p: any) => typeof p === 'string' ? p : p.url));
                    setReviews(data.reviews || []);
                    setAvgRating(data.averageRating ?? null);
                    setReviewCount(data.reviewCount ?? 0);
                })
                .catch(err => console.error("Profile extra data fetch error:", err))
                .finally(() => setIsLoadingExtra(false));

            if (supplier.parcelPolygonId && isPartner) {
                setIsLoadingAnalytics(true);
                Promise.all([
                    getFarmerAnalyticsAction(supplier.parcelPolygonId),
                    getSatelliteImageryAction(supplier.parcelPolygonId)
                ]).then(([analyticsRes, imageryRes]) => {
                    if (analyticsRes.data) setAnalytics(analyticsRes.data);
                    if (imageryRes.data) setSatelliteScenes(imageryRes.data);
                }).catch(err => console.error("Advanced analytics fetch error:", err))
                    .finally(() => setIsLoadingAnalytics(false));
            }
        }
    }, [supplier]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Top Navigation */}
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="group flex items-center gap-2 text-slate-500 hover:text-[#2c5f42] font-bold text-[11px] uppercase tracking-widest bg-white rounded-xl px-4 h-10 border border-slate-100 shadow-sm"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à la liste
                </Button>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">Profil Partenaire</span>
                </div>
            </div>

            {/* Profile Header Card (LinkedIn Style Re-mirrored) */}
            <Card className="border-border shadow-sm overflow-hidden bg-white rounded-xl">
                <div className="h-32 bg-[#2c5f42] w-full relative border-b border-[#2c5f42]">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white_1px,transparent_1px)] [background-size:20px_20px]" />
                    <div className="absolute top-4 right-4">
                        {isPartner ? (
                            <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 gap-1.5 rounded-lg">
                                <CheckCircle2 className="size-4" /> Partenaire Actif
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-[#fef9c3] text-[#854d0e] border-[#fef08a] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 gap-1.5 rounded-lg shadow-sm">
                                <Clock className="size-4" /> Demande en attente
                            </Badge>
                        )}
                    </div>
                </div>

                <CardContent className="px-8 pb-8 -mt-10 relative">
                    <div className="flex items-end gap-6 mb-8">
                        <Avatar className="size-24 rounded-2xl border flex-shrink-0 bg-white shadow-sm ring-4 ring-white">
                            <AvatarImage src={supplier.avatarUrl || ""} />
                            <AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#2c5f42]">
                                {supplier.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="pb-1 space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-light text-slate-800 tracking-tight truncate">{supplier.name}</h2>
                                <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md gap-1.5 shrink-0">
                                    <ShieldCheck className="size-3" /> Vérifié Sourcing
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                                <MapPin className="size-3.5" />
                                <span className="truncate">{supplier.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats matching FarmerNetworkClient */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Star className="size-3.5" /> Note Partenaire
                            </p>
                            <span className="text-2xl font-light text-[#2c5f42]">{avgRating ? avgRating.toFixed(1) : "—"}</span>
                            <p className="text-[11px] font-medium text-slate-500 mt-1">{reviewCount} évaluations B2B</p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Boxes className="size-3.5" /> Capacité Annuelle
                            </p>
                            <span className="text-xl font-light text-[#2c5f42] truncate w-full">{supplier.production || "Non spécifié"}</span>
                            <p className="text-[11px] font-medium text-slate-500 mt-1">Volume de Production</p>
                        </div>
                        <div className="p-4 rounded-xl border border-[#e0ede5] flex flex-col items-start bg-[#f8fdf9] shadow-sm">
                            <p className="text-[10px] font-semibold text-[#4a8c5c] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Building2 className="size-3.5" /> Entité Business
                            </p>
                            <span className="text-xl font-light text-[#2c5f42] uppercase truncate w-full">{supplier.farmName || supplier.name}</span>
                            <p className="text-[11px] font-medium text-[#2c5f42] mt-1 uppercase tracking-widest">
                                {supplier.onssaCert ? "AGREE ONSSA" : "Vérifié"}
                            </p>
                        </div>
                    </div>

                    {/* Identity Details Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: ShieldCheck, label: "ICE", value: supplier.iceNumber || "--", sensitive: true },
                            { icon: CheckCircle2, label: "ONSSA", value: supplier.onssaCert ? "CERTIFIÉ" : "EN COURS", green: !!supplier.onssaCert },
                            { icon: Waves, label: "Irrigation", value: supplier.irrigationType || "Standard" },
                            { icon: Truck, label: "Logistique", value: supplier.deliveryCapacity ? "Incluse" : "Non incluse" },
                        ].map(({ icon: Icon, label, value, green, sensitive }) => (
                            <div key={label} className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm relative overflow-hidden group">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0">
                                    <Icon className="size-3.5 text-[#2c5f42]" /> {label}
                                </p>
                                <span className={cn(
                                    "text-[13px] font-bold tracking-tight truncate w-full uppercase transition-all duration-500",
                                    green ? "text-[#2c5f42]" : "text-slate-800",
                                    sensitive && !isPartner && "blur-md select-none opacity-40"
                                )}>
                                    {value}
                                </span>
                                {sensitive && !isPartner && (
                                    <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge variant="secondary" className="text-[7px] font-bold bg-[#2c5f42] text-white border-none py-0 px-1.5 uppercase tracking-tighter">Verrouillé</Badge>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Globe className="size-3.5 text-[#2c5f42]" /> Commercialisation
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {supplier.businessModel && supplier.businessModel.length > 0
                                    ? supplier.businessModel.map(m => (
                                        <Badge key={m} variant="secondary" className="text-[10px] font-bold bg-[#f0f8f4] text-[#2c5f42] border-none uppercase">{m}</Badge>
                                    ))
                                    : <Badge variant="secondary" className="text-[10px] font-bold bg-[#f0f8f4] text-[#2c5f42] border-none uppercase">Direct Sourcing</Badge>
                                }
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-white shadow-sm">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Sprout className="size-3.5 text-[#2c5f42]" /> Stockage Froid
                            </p>
                            <span className="text-[13px] font-bold text-slate-800 uppercase">
                                {supplier.hasColdStorage ? "Disponible" : "Non disponible"}
                            </span>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-slate-50/50 shadow-sm transition-all hover:bg-white relative overflow-hidden group">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Phone className="size-3.5 text-[#2c5f42]" /> Téléphone Direct
                            </p>
                            <span className={cn(
                                "text-[14px] font-bold text-slate-800 tracking-tight transition-all duration-500",
                                !isPartner && "blur-md select-none opacity-40"
                            )}>
                                {supplier.phone || "--"}
                            </span>
                            {!isPartner && (
                                <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="secondary" className="text-[8px] font-bold bg-[#2c5f42] text-white border-none py-0 px-2 uppercase tracking-wider">Accent acceptation requis</Badge>
                                </div>
                            )}
                        </div>
                        <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-slate-50/50 shadow-sm transition-all hover:bg-white overflow-hidden relative group">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Mail className="size-3.5 text-[#2c5f42]" /> Email Professionnel
                            </p>
                            <span className={cn(
                                "text-[14px] font-bold text-slate-800 tracking-tight truncate w-full transition-all duration-500",
                                !isPartner && "blur-md select-none opacity-40"
                            )}>
                                {supplier.email || "--"}
                            </span>
                            {!isPartner && (
                                <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="secondary" className="text-[8px] font-bold bg-[#2c5f42] text-white border-none py-0 px-2 uppercase tracking-wider">Accès restreint</Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isPartner && (
                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                            <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Les coordonnées de contact, le numéro ICE et le monitoring satellite détaillé seront débloqués une fois que le partenaire aura accepté votre proposition de contrat.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Satellite Monitoring Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 p-4 bg-white rounded-xl border border-border shadow-sm">
                    <Activity className="size-5 text-[#2c5f42]" />
                    <h3 className="text-[14px] font-bold text-slate-900 tracking-wider uppercase">Monitoring Satellite & Agronomie</h3>
                </div>

                {!isPartner ? (
                    <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center p-8">
                        <Activity className="size-12 text-slate-200 mb-4" />
                        <h4 className="text-[14px] font-bold text-[#2c5f42] uppercase tracking-widest">Données de Monitoring Sécurisées</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mt-2 leading-relaxed">
                            L&apos;accès aux indices de végétation (NDVI), aux prévisions locales et à l&apos;humidité des sols est réservé aux partenaires confirmés.
                        </p>
                    </div>
                ) : !supplier.parcelPolygonId ? (
                    <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="text-center space-y-3 max-w-sm px-6">
                            <Tractor className="size-10 text-slate-200 mx-auto" />
                            <p className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest leading-relaxed">
                                Données Géospatiales Indisponibles
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Le tracé parcellaire de ce fournisseur n&apos;est pas encore synchronisé.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                            <AgroAnalyticsChart
                                initialData={analytics?.ndvi || []}
                                polygonId={supplier.parcelPolygonId}
                                isSyncing={isLoadingAnalytics}
                                className="xl:col-span-2"
                            />
                            <AdvancedInsightsGrid
                                accumulatedTemp={analytics?.accumulated?.temp}
                                accumulatedPrec={analytics?.accumulated?.prec}
                                uvi={analytics?.uvi}
                                isSyncing={isLoadingAnalytics}
                                className="xl:col-span-1"
                            />
                        </div>

                        <SatelliteVisionCard
                            scenes={satelliteScenes}
                            isSyncing={isLoadingAnalytics}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <WeatherCard
                                current={analytics?.weather}
                                forecast={analytics?.forecast}
                                locationName={supplier.location}
                                isSyncing={isLoadingAnalytics}
                            />
                            <SoilCard
                                data={analytics?.soil}
                                isSyncing={isLoadingAnalytics}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery & Reviews matching FarmerNetworkClient footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                <Card className="border-border shadow-sm bg-white rounded-xl overflow-hidden flex flex-col relative">
                    {!isPartner && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-[8px] z-20 flex flex-col items-center justify-center p-6 text-center">
                            <Camera className="size-8 text-[#2c5f42]/40 mb-2" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Galerie Verrouillée</p>
                        </div>
                    )}
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fdf9]">
                        <h3 className="text-[12px] font-bold text-[#2c5f42] uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="size-3.5 text-[#4a8c5c]" /> Galerie Exploitation
                        </h3>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                        {isLoadingExtra ? (
                            <div className="flex-1 min-h-[160px] flex items-center justify-center">
                                <Loader2 className="size-5 animate-spin text-slate-300" />
                            </div>
                        ) : photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {photos.slice(0, 4).map((url, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-50 border border-border/50 relative group cursor-pointer">
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
                                <span className="text-[10px] font-bold uppercase tracking-widest">Pas d&apos;images</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-white rounded-xl overflow-hidden flex flex-col relative">
                    {!isPartner && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-[8px] z-20 flex flex-col items-center justify-center p-6 text-center">
                            <Star className="size-8 text-[#2c5f42]/40 mb-2" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avis Verrouillés</p>
                        </div>
                    )}
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fdf9]">
                        <h3 className="text-[12px] font-bold text-[#2c5f42] uppercase tracking-wider flex items-center gap-1.5">
                            <Star className="size-3.5 text-[#4a8c5c]" /> Avis & Retours B2B
                        </h3>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                        {isLoadingExtra ? (
                            <div className="flex-1 min-h-[160px] flex items-center justify-center">
                                <Loader2 className="size-5 animate-spin text-slate-300" />
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.slice(0, 2).map((r, i) => (
                                    <div key={i} className="space-y-1.5 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] font-bold text-slate-800">{r.reviewer?.fullName || "Acheteur"}</span>
                                            <div className="flex text-[#2c5f42]">{Array.from({ length: r.rating || 5 }).map((_, j) => <Star key={j} className="size-2.5 fill-current" />)}</div>
                                        </div>
                                        <p className="text-[12px] text-slate-500 leading-relaxed italic line-clamp-2">&ldquo;{r.comment}&rdquo;</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/50">
                                <MessageSquare className="size-6 opacity-20 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau Partenaire</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
