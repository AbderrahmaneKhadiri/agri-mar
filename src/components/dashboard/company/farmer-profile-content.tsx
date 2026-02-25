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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ICE</p>
                    <span className="text-xs font-black text-slate-900 tabular-nums">{data.iceNumber || "En attente"}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ONSSA</p>
                    <span className="text-xs font-black text-emerald-600">{data.onssaCert || "En attente"}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Irrigation</p>
                    <span className="text-xs font-bold text-slate-700">
                        {Array.isArray(data.irrigationType) ? data.irrigationType.join(", ") : data.irrigationType || "Standard"}
                    </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Logistique</p>
                    <span className="text-xs font-bold text-slate-700">{data.logistics || data.deliveryCapacity ? "Incluse" : "Non incluse"}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Modèle Business</p>
                    <div className="flex flex-wrap justify-center gap-1">
                        {data.businessModel && data.businessModel.length > 0 ? (
                            data.businessModel.map(m => (
                                <Badge key={m} variant="secondary" className="text-[9px] font-bold bg-white text-slate-600 border-slate-100 uppercase">{m}</Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="text-[9px] font-bold bg-white text-slate-600 border-slate-100 uppercase">Vente Directe</Badge>
                        )}
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stockage Froid</p>
                    <span className="text-xs font-bold text-slate-700">{data.hasColdStorage ? "Disponible" : "Non disponible"}</span>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Téléphone</p>
                        <div className="flex items-center gap-2">
                            <Phone className="size-3 text-emerald-500" />
                            <p className="text-[13px] font-semibold text-slate-700">{data.phone || "Non renseigné"}</p>
                        </div>
                    </div>
                    <div className="space-y-1 text-right flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Professionnel</p>
                        <div className="flex items-center gap-2">
                            <Mail className="size-3 text-emerald-500" />
                            <p className="text-[13px] font-semibold text-slate-700 truncate max-w-[200px]">{data.email || "Non renseigné"}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Sprout className="size-4 text-emerald-600" /> Détails de l&apos;exploitation
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 italic text-[13px] text-slate-600 leading-relaxed font-medium">
                        &ldquo;{data.farmName || "Producteur Agricole stratégique"}. Spécialiste en {data.cropTypes?.join(", ") || data.livestock || "cultures maraîchères"}.&rdquo;
                        {data.production && <div className="mt-2 text-[12px] not-italic font-bold text-slate-500 underline decoration-emerald-200">Production moyenne: {data.production}</div>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                    {data.farmingMethods && data.farmingMethods.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Méthodes de Culture</p>
                            <div className="flex flex-wrap gap-1">
                                {data.farmingMethods.map(m => (
                                    <Badge key={m} variant="secondary" className="text-[9px] font-semibold bg-white border-slate-100">{m}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.seasonality && data.seasonality.length > 0 && (
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponibilité Saisonière</p>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {data.seasonality.map(s => (
                                    <Badge key={s} variant="secondary" className="text-[9px] font-semibold bg-white border-slate-100">{s}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {data.certifications && data.certifications.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certifications & Qualité</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.certifications.map((cert, i) => (
                                <Badge key={i} variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100 text-[10px] font-bold rounded-lg px-2 py-1">
                                    <ShieldCheck className="size-3 mr-1.5" /> {cert}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2">
                    {data.exportCapacity && (
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[8px] font-bold uppercase py-1 flex items-center justify-center gap-1">
                            <Globe className="size-2.5" /> Capacité Export
                        </Badge>
                    )}
                    {data.longTermContractAvailable && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-bold uppercase py-1 flex items-center justify-center gap-1">
                            <Tractor className="size-2.5" /> Contrat Long Terme
                        </Badge>
                    )}
                    {data.totalArea && (
                        <Badge className="bg-slate-50 text-slate-600 border-slate-100 text-[8px] font-bold uppercase py-1 flex items-center justify-center gap-1">
                            <MapPin className="size-2.5" /> {data.totalArea} Ha
                        </Badge>
                    )}
                </div>

                {data.since || data.sentAt ? (
                    <div className="pt-6 border-t">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {data.since ? "Partenaire depuis le " : "Demande envoyée le "}
                            {format(new Date(data.since || data.sentAt!), "d MMMM yyyy", { locale: fr })}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
