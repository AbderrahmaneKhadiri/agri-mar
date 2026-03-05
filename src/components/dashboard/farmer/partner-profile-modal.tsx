"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    ShieldCheck,
    Truck,
    ThermometerSnowflake,
    FileText,
    Sprout,
    Activity,
    Star,
    Camera,
    Tractor,
    X,
} from "lucide-react";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import { getFarmerAnalyticsAction } from "@/actions/agromonitoring.actions";
import { PartnerDTO } from "@/data-access/connections.dal";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PartnerProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    partner: PartnerDTO | null;
}

export function PartnerProfileModal({ isOpen, onOpenChange, partner }: PartnerProfileModalProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingExtra, setIsLoadingExtra] = useState(false);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (!partner) return;
        setPhotos([]);
        setReviews([]);
        setAnalytics(null);

        setIsLoadingExtra(true);
        fetch(`/api/farmer/${partner.profileId}/gallery`)
            .then(res => res.json())
            .then(data => {
                setPhotos(data.photos || []);
                setReviews(data.reviews || []);
            })
            .catch(() => { })
            .finally(() => setIsLoadingExtra(false));

        if (partner.parcelPolygonId) {
            setIsLoadingAnalytics(true);
            getFarmerAnalyticsAction(partner.parcelPolygonId)
                .then(res => { if (res.data) setAnalytics(res.data); })
                .catch(() => { })
                .finally(() => setIsLoadingAnalytics(false));
        }
    }, [partner]);

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden border border-[#d4e9dc] shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
                {/* Header Banner */}
                <div className="bg-[#2c5f42] px-6 pt-6 pb-0 relative overflow-hidden shrink-0">
                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                    <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

                    <div className="flex items-start gap-5 relative z-10 pb-6">
                        <Avatar className="size-20 rounded-2xl ring-4 ring-white/20 shadow-xl shrink-0">
                            <AvatarImage src={partner.avatarUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-[#1a3d2a] text-white text-2xl font-black uppercase">
                                {partner.name.substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black text-white tracking-tight truncate">{partner.name}</h2>
                                <Badge className="bg-[#a8d5be]/20 text-[#a8d5be] border-[#a8d5be]/20 text-[9px] font-black uppercase tracking-widest shrink-0">
                                    <ShieldCheck className="size-3 mr-1" /> Partenaire
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-white/60 text-[12px] font-medium">
                                {partner.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" /> {partner.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    Depuis {format(new Date(partner.since), "MMMM yyyy", { locale: fr })}
                                </span>
                                {partner.industry && (
                                    <Badge className="bg-white/10 text-white/80 border-none text-[9px] font-bold uppercase tracking-wider">
                                        {partner.industry}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center gap-6 border-t border-white/10 pt-3 pb-4">
                        <div className="text-center">
                            <div className="text-xl font-black text-white tabular-nums">{partner.totalArea || "--"}</div>
                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Ha</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-xl font-black text-white tabular-nums">{partner.production || "--"}</div>
                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">T/an</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-xl font-black text-[#a8d5be] tabular-nums">
                                {analytics?.ndvi?.length > 0
                                    ? (analytics.ndvi[analytics.ndvi.length - 1]?.data?.mean?.toFixed(2) || "--")
                                    : "--"}
                            </div>
                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">NDVI</div>
                        </div>
                        {partner.exportCapacity && (
                            <>
                                <div className="w-px h-8 bg-white/10" />
                                <Badge className="bg-[#a8d5be]/20 text-[#a8d5be] border-none text-[9px] font-black uppercase tracking-widest">
                                    Export Possible
                                </Badge>
                            </>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-[#f8fdf9]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Identity */}
                            <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5 space-y-4">
                                <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="size-3.5" /> Identité Business
                                </h3>
                                {[
                                    { label: "Exploitation", value: partner.farmName || partner.name },
                                    { label: "ICE", value: partner.iceNumber || "--" },
                                    { label: "ONSSA", value: partner.onssaCert || "--" },
                                ].map(item => (
                                    <div key={item.label} className="p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50">
                                        <span className="text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest block mb-0.5">{item.label}</span>
                                        <p className="text-[13px] font-bold text-slate-800 truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Contacts */}
                            <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5 space-y-3">
                                <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="size-3.5" /> Contacts
                                </h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50">
                                    <div className="size-8 rounded-lg bg-[#d4e9dc] flex items-center justify-center">
                                        <Phone className="size-3.5 text-[#2c5f42]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">Mobile</p>
                                        <p className="text-[13px] font-bold text-slate-800">{partner.phone || "--"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50">
                                    <div className="size-8 rounded-lg bg-[#d4e9dc] flex items-center justify-center">
                                        <Mail className="size-3.5 text-[#2c5f42]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">Email</p>
                                        <p className="text-[13px] font-bold text-slate-800 truncate">{partner.email || "--"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Capacities */}
                            <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2">
                                        <Truck className="size-3.5" /> Capacités
                                    </h3>
                                    <Badge className="bg-[#2c5f42] text-white text-[8px] font-black uppercase italic tracking-widest">Premium</Badge>
                                </div>
                                {[
                                    { icon: ThermometerSnowflake, label: "Stockage Froid", value: partner.hasColdStorage, yes: "DISPONIBLE", no: "Non" },
                                    { icon: Truck, label: "Livraison Flotte", value: partner.deliveryCapacity, yes: "ASSURÉE", no: "Non" },
                                    { icon: FileText, label: "Contrat Long Terme", value: partner.longTermContractAvailable, yes: "ÉLIGIBLE", no: "Non" },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/30">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-7 rounded-lg bg-[#d4e9dc] flex items-center justify-center">
                                                <item.icon className="size-3.5 text-[#2c5f42]" />
                                            </div>
                                            <span className="text-[12px] font-bold text-slate-700">{item.label}</span>
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] font-black border-none px-2 py-0.5",
                                            item.value ? "bg-[#2c5f42] text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {item.value ? item.yes : item.no}
                                        </Badge>
                                    </div>
                                ))}
                            </div>

                            {/* Crops & Agriculture */}
                            <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5 space-y-3">
                                <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2">
                                    <Sprout className="size-3.5" /> Cultures & Agriculture
                                </h3>
                                {partner.cropTypes && partner.cropTypes.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {partner.cropTypes.map((crop, i) => (
                                            <Badge key={i} className="bg-[#f0f8f4] text-[#2c5f42] border border-[#d4e9dc] text-[10px] font-bold">
                                                {crop}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-[#4a8c5c]/50 italic">Aucune culture renseignée</p>
                                )}
                                {partner.irrigationType && (
                                    <div className="p-3 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-600">Irrigation</span>
                                        <span className="text-[11px] font-black text-[#2c5f42]">{partner.irrigationType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* NDVI Chart */}
                    {partner.parcelPolygonId && (
                        <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="size-3.5 text-[#2c5f42]" />
                                <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest">Analyse Géo-Spatiale</h3>
                                {isLoadingAnalytics && <span className="text-[10px] text-[#4a8c5c]/60 italic animate-pulse">Chargement...</span>}
                            </div>
                            <NdviChart data={analytics?.ndvi || []} isSyncing={isLoadingAnalytics} hideHeader />
                        </div>
                    )}

                    {/* Photo Gallery */}
                    <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5">
                        <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Camera className="size-3.5" /> Galerie
                        </h3>
                        {isLoadingExtra ? (
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-[#f0f8f4] animate-pulse rounded-xl" />)}
                            </div>
                        ) : photos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((url, i) => (
                                    <div key={i} className="aspect-video relative rounded-xl overflow-hidden border border-[#d4e9dc] group">
                                        <Image src={url} alt={`Photo ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-[#d4e9dc] rounded-xl text-[#4a8c5c]/40 text-[12px] italic">
                                Aucune photo disponible
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    {(reviews.length > 0 || isLoadingExtra) && (
                        <div className="bg-white rounded-2xl border border-[#d4e9dc] p-5">
                            <h3 className="text-[11px] font-black text-[#2c5f42] uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Star className="size-3.5" /> Témoignages
                            </h3>
                            <div className="space-y-3">
                                {reviews.slice(0, 3).map((r, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-black text-[#2c5f42]">{r.reviewer?.fullName}</span>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <Star key={j} className={cn("size-2.5", j < (r.rating || 5) ? "fill-[#2c5f42] text-[#2c5f42]" : "text-slate-200")} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-600 italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
