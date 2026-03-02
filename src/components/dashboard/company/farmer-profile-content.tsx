"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Sprout,
    ShieldCheck,
    Truck,
    Waves,
    Globe,
    Phone,
    Mail,
    Tractor,
    Calendar,
    Star,
    CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FarmerProfileData {
    id: string;
    name: string;
    avatarUrl?: string | null;
    location?: string;
    farmName?: string;
    phone?: string;
    email?: string;
    totalArea?: string;
    cropTypes?: string[];
    livestock?: string;
    certifications?: string[];
    farmingMethods?: string[];
    seasonality?: string[];
    exportCapacity?: boolean;
    logistics?: boolean;
    iceNumber?: string | null;
    onssaCert?: string | null;
    irrigationType?: string[] | string | null;
    hasColdStorage?: boolean;
    deliveryCapacity?: boolean;
    businessModel?: string[] | null;
    longTermContractAvailable?: boolean;
    production?: string;
    since?: Date;
    sentAt?: Date;
}

interface FarmerProfileContentProps {
    data: FarmerProfileData;
    isCompact?: boolean;
}

export function FarmerProfileContent({ data, isCompact = false }: FarmerProfileContentProps) {
    const displayName = data.name || "Agriculteur";
    const displayLocation = data.location || "Localisation non renseignée";

    return (
        <div className="flex flex-col">
            {!isCompact && (
                <div className="flex items-end gap-6 mb-8">
                    <Avatar className="size-24 rounded-2xl border-4 border-white shadow-2xl bg-white ring-1 ring-slate-100">
                        <AvatarImage src={data.avatarUrl || ""} />
                        <AvatarFallback className="text-3xl font-bold bg-slate-50 text-slate-900">
                            {displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pb-2 space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{displayName}</h2>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold uppercase">
                                {data.since ? "Partenaire Certifié" : "Producteur Agricole"}
                            </Badge>
                        </div>
                        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-slate-400" /> {displayLocation}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0"><ShieldCheck className="size-3.5" /> ICE</p>
                    <span className="text-[13px] font-semibold text-foreground tracking-tight tabular-nums truncate w-full">{data.iceNumber || "En attente"}</span>
                </div>
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0"><CheckCircle2 className="size-3.5" /> ONSSA</p>
                    <span className="text-[13px] font-semibold text-emerald-600 tracking-tight truncate w-full">{data.onssaCert || "En attente"}</span>
                </div>
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0"><Waves className="size-3.5" /> Irrigation</p>
                    <span className="text-[13px] font-semibold text-foreground tracking-tight truncate w-full">
                        {Array.isArray(data.irrigationType) ? data.irrigationType.join(", ") : data.irrigationType || "Standard"}
                    </span>
                </div>
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5 shrink-0"><Truck className="size-3.5" /> Logistique</p>
                    <span className="text-[13px] font-semibold text-foreground tracking-tight truncate w-full">{data.logistics || data.deliveryCapacity ? "Incluse" : "Non incluse"}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 shrink-0"><Globe className="size-3.5" /> Modèle Business</p>
                    <div className="flex flex-wrap gap-1.5">
                        {data.businessModel && data.businessModel.length > 0 ? (
                            data.businessModel.map(m => (
                                <Badge key={m} variant="secondary" className="text-[10px] font-medium bg-muted text-foreground border-border/50 uppercase">{m}</Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="text-[10px] font-medium bg-muted text-foreground border-border/50 uppercase">Vente Directe</Badge>
                        )}
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-border flex flex-col items-start bg-card shadow-sm">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 shrink-0"><Sprout className="size-3.5" /> Stockage Froid</p>
                    <span className="text-[13px] font-semibold text-foreground tracking-tight truncate w-full">{data.hasColdStorage ? "Disponible" : "Non disponible"}</span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 bg-card p-4 rounded-xl border border-border">
                    <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Phone className="size-3" /> Téléphone</p>
                        <p className="text-[13px] font-semibold text-foreground">{data.phone || "Non renseigné"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Mail className="size-3" /> Email Pro</p>
                        <p className="text-[13px] font-semibold text-foreground truncate">{data.email || "Non renseigné"}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Sprout className="size-3.5" /> Détails de l&apos;exploitation
                    </h4>
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-[13px] text-muted-foreground leading-relaxed font-normal flex flex-col items-start gap-4">
                        <p>
                            <span className="text-foreground font-medium">{data.farmName || data.name}</span>
                            {data.cropTypes && data.cropTypes.length > 0
                                ? `. Spécialiste en ${data.cropTypes.join(", ")}${data.livestock ? ` et ${data.livestock}` : ""}.`
                                : data.livestock ? `. Spécialiste en élevage (${data.livestock}).` : ". Producteur agricole partenaire."}
                        </p>
                        {data.production && data.production !== "Non spécifié" && (
                            <div className="text-[12px] font-medium text-foreground bg-muted p-2 rounded-lg inline-block border border-border/50">
                                Production moyenne: {data.production}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                    {data.farmingMethods && data.farmingMethods.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Méthodes de Culture</p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.farmingMethods.map(m => (
                                    <Badge key={m} variant="secondary" className="text-[10px] font-medium bg-muted text-foreground border-border/50">{m}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.seasonality && data.seasonality.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Disponibilité Saisonière</p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.seasonality.map(s => (
                                    <Badge key={s} variant="secondary" className="text-[10px] font-medium bg-muted text-foreground border-border/50">{s}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {data.certifications && data.certifications.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Certifications & Qualité</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.certifications.map((cert, i) => (
                                <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 text-[10px] font-semibold uppercase tracking-widest rounded-lg px-2 py-1">
                                    <ShieldCheck className="size-3 max-sm:mr-0 mr-1.5" /> {cert}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                    {data.exportCapacity && (
                        <Badge variant="outline" className="bg-background text-muted-foreground border-border text-[9px] font-semibold uppercase py-1 flex items-center justify-center gap-1.5 px-2">
                            <Globe className="size-3" /> Capacité Export
                        </Badge>
                    )}
                    {data.longTermContractAvailable && (
                        <Badge variant="outline" className="bg-background text-muted-foreground border-border text-[9px] font-semibold uppercase py-1 flex items-center justify-center gap-1.5 px-2">
                            <Tractor className="size-3" /> Contrat Long Terme
                        </Badge>
                    )}
                    {data.totalArea && (
                        <Badge variant="outline" className="bg-background text-muted-foreground border-border text-[9px] font-semibold uppercase py-1 flex items-center justify-center gap-1.5 px-2">
                            <MapPin className="size-3" /> {data.totalArea} Ha
                        </Badge>
                    )}
                </div>

                {data.since || data.sentAt ? (
                    <div className="pt-4 mt-4 border-t border-border">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="size-3" />
                            {data.since ? "Partenaire depuis le " : "Demande envoyée le "}
                            {format(new Date(data.since || data.sentAt!), "d MMMM yyyy", { locale: fr })}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
