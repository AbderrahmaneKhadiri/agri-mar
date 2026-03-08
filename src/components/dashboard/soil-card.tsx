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
            <Card className="border-white/5 shadow-2xl bg-[#070b14] overflow-hidden rounded-xl min-h-[160px]">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Loader2 className="size-10 text-[#10b981] animate-spin mb-3" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse mb-2" />
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Sonde Sol : Lecture...</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="border-white/5 shadow-2xl bg-[#070b14] overflow-hidden rounded-xl min-h-[160px]">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Info className="size-8 text-white/5 mb-3" />
                    <h3 className="font-bold text-white/60 uppercase tracking-widest text-xs">Analyse Sol</h3>
                    <p className="text-[9px] text-white/30 mt-2 uppercase tracking-wider px-4">Données en attente du passage satellite.</p>
                </CardContent>
            </Card>
        );
    }

    const moisturePerc = Math.round(data.moisture * 100);
    const tempSurface = Math.round(data.t0 - 273.15);
    const tempDepth = Math.round(data.t10 - 273.15);

    let status = {
        label: "Optimal",
        color: "text-[#10b981]",
        bg: "bg-[#10b981]/10",
        border: "border-[#10b981]/20",
        icon: <CheckCircle2 className="size-3" />,
        advice: "L'humidité est idéale pour la croissance."
    };

    if (moisturePerc < 20) {
        status = {
            label: "Stress Hydrique",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
            icon: <AlertTriangle className="size-3" />,
            advice: "Irrigation recommandée rapidement."
        };
    } else if (moisturePerc > 40) {
        status = {
            label: "Saturation",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            icon: <Droplets className="size-3" />,
            advice: "Attention aux risques d'asphyxie racinaire."
        };
    }

    return (
        <Card className={cn("border border-border shadow-sm bg-white overflow-hidden rounded-xl relative group", className)}>
            {/* Glossy accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2c5f42]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-[#2c5f42] bg-[#f0f8f4] px-1.5 py-0.5 rounded-full uppercase tracking-widest">Sonde Sols</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                            {moisturePerc}% <span className="text-xs font-bold text-slate-400">Humidité</span>
                        </h2>
                    </div>
                    <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#2c5f42]">
                        <Droplets className="size-5" />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", status.color)}>
                            {status.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Capacité au champ</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-1000", status.bg)}
                            style={{ width: `${moisturePerc}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 p-2.5 rounded-2xl border border-white/40 flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500 shrink-0">
                            <Thermometer className="size-3.5" />
                        </div>
                        <div>
                            <div className="text-[13px] font-black text-slate-900">{tempSurface}°C</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Surf.</div>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-2xl border border-white/40 flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                            <Thermometer className="size-3.5" />
                        </div>
                        <div>
                            <div className="text-[13px] font-black text-slate-900">{tempDepth}°C</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">10cm</div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto px-1">
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic border-l border-slate-200 pl-3">
                        "{status.advice}"
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
