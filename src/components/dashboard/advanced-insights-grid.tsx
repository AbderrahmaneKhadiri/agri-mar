"use client";

import { Thermometer, CloudRain, Sun, Sprout, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdvancedInsightsGridProps {
    accumulatedTemp?: number;
    accumulatedPrec?: number;
    uvi?: number;
    cropType?: string;
    isSyncing?: boolean;
    className?: string;
}

export function AdvancedInsightsGrid({
    accumulatedTemp,
    accumulatedPrec,
    uvi,
    cropType = "Non détecté",
    isSyncing,
    className
}: AdvancedInsightsGridProps) {

    const insights = [
        {
            label: "Cumul Thermique",
            value: accumulatedTemp ? `${accumulatedTemp.toFixed(1)}°C` : "--",
            sublabel: "Degrés Jours de Croissance",
            icon: Thermometer,
            color: "text-orange-600",
            bg: "bg-orange-50",
            description: "Somme des températures actives pour prédire la date de récolte."
        },
        {
            label: "Précipitations",
            value: accumulatedPrec ? `${accumulatedPrec.toFixed(1)}mm` : "--",
            sublabel: "Cumul de la saison",
            icon: CloudRain,
            color: "text-blue-600",
            bg: "bg-blue-50",
            description: "Volume total d'eau reçu par la parcelle cette saison."
        },
        {
            label: "Indice UV",
            value: uvi ? `${uvi.toFixed(1)}` : "--",
            sublabel: "Exposition solaire",
            icon: Sun,
            color: "text-amber-600",
            bg: "bg-amber-50",
            description: "Intensité du rayonnement ultraviolet actuel."
        },
        {
            label: "Culture (IA)",
            value: cropType,
            sublabel: "Reconnaissance spectrale",
            icon: Sprout,
            color: "text-[#2c5f42]",
            bg: "bg-[#f0f8f4]",
            description: "Type de culture identifié par analyse satellite du feuillage."
        }
    ];

    return (
        <Card className={cn("p-6 bg-white border-border shadow-sm rounded-xl relative overflow-hidden", className)}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2c5f42]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Insights IA</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Expert
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={cn(
                            "p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-transparent transition-all hover:border-slate-100 group relative flex flex-col justify-between",
                            isSyncing && "animate-pulse"
                        )}
                    >
                        <div className="flex items-start justify-between mb-2 lg:mb-3">
                            <div className={cn("size-8 lg:size-10 rounded-xl flex items-center justify-center shadow-sm", insight.bg, insight.color)}>
                                <insight.icon className="size-4 lg:size-5" />
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="p-1 cursor-help rounded-full hover:bg-slate-50 transition-colors">
                                            <Info className="size-3 lg:size-3.5 text-slate-300 hover:text-slate-500 transition-colors" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white border-none rounded-lg p-3 max-w-[200px] text-[11px] z-50">
                                        {insight.description}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="space-y-0.5">
                            <h4 className={cn("text-base lg:text-lg font-black tracking-tight", insight.color)}>
                                {insight.value}
                            </h4>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{insight.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
