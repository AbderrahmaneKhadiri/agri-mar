"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Thermometer, Info, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoilCardProps {
    data: any;
    isSyncing?: boolean;
    className?: string;
}

export function SoilCard({ data, isSyncing, className }: SoilCardProps) {
    if (isSyncing) {
        return (
            <Card className="border-none shadow-sm bg-slate-50 overflow-hidden rounded-[2rem] min-h-[160px]">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Loader2 className="size-10 text-[#4a8c5c] animate-spin mb-3" />
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-2" />
                    <p className="text-[10px] text-slate-400">Lecture des capteurs au sol...</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="border-none shadow-sm bg-slate-50 overflow-hidden rounded-[2rem] min-h-[160px]">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Info className="size-8 text-slate-200 mb-3" />
                    <h3 className="font-bold text-slate-900 text-sm">Données Sol en attente</h3>
                    <p className="text-[11px] text-slate-400 mt-1 px-4">Les données sol seront disponibles dès la fin de l&apos;analyse satellite.</p>
                </CardContent>
            </Card>
        );
    }

    const moisturePerc = Math.round(data.moisture * 100);
    const tempSurface = Math.round(data.t0 - 273.15);
    const tempDepth = Math.round(data.t10 - 273.15);

    let status = {
        label: "Optimal",
        color: "text-[#2c5f42]",
        bg: "bg-[#f0f8f4]",
        icon: <CheckCircle2 className="size-3" />,
        advice: "L'humidité est idéale pour la croissance."
    };

    if (moisturePerc < 20) {
        status = {
            label: "Stress Hydrique",
            color: "text-amber-500",
            bg: "bg-amber-50",
            icon: <AlertTriangle className="size-3" />,
            advice: "Irrigation recommandée rapidement."
        };
    } else if (moisturePerc > 40) {
        status = {
            label: "Saturation",
            color: "text-[#2c5f42]",
            bg: "bg-[#f0f8f4]",
            icon: <Droplets className="size-3" />,
            advice: "Attention aux risques d'asphyxie racinaire."
        };
    }

    return (
        <Card className={cn("border border-border shadow-sm bg-white overflow-hidden rounded-xl group transition-all duration-300", className)}>
            <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5", status.bg, status.color)}>
                                {status.icon}
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                                {moisturePerc}%
                            </h3>
                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Humidité</span>
                        </div>
                    </div>
                    <div className="size-12 rounded-2xl bg-[#f8fdf9] flex items-center justify-center text-[#2c5f42] shadow-sm border border-[#e0ede5] group-hover:scale-110 transition-transform duration-500">
                        <Droplets className="size-6" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-white/40">
                        <div className="flex items-center gap-2 mb-1">
                            <Thermometer className="size-3 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">Surface</span>
                        </div>
                        <div className="text-[15px] font-black text-slate-900">{tempSurface}°C</div>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-white/40">
                        <div className="flex items-center gap-2 mb-1">
                            <Thermometer className="size-3 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">Sol (10cm)</span>
                        </div>
                        <div className="text-[15px] font-black text-slate-900">{tempDepth}°C</div>
                    </div>
                </div>

                <div className="mt-auto px-1">
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                        "{status.advice}"
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
