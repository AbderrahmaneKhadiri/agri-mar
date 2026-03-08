"use client";

import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Activity, Droplets, Zap, Leaf, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHistoricalIndexAction } from "@/actions/agromonitoring.actions";

interface IndexDataPoint {
    dt: number;
    data: {
        mean: number;
        min: number;
        max: number;
    };
}

interface AgroAnalyticsChartProps {
    initialData: IndexDataPoint[];
    polygonId: string;
    isSyncing?: boolean;
    className?: string;
}

const INDICES = [
    { id: "ndvi", label: "Santé", longLabel: "NDVI (Biomasse)", icon: Leaf, color: "#2c5f42", description: "Indice de santé globale et chlorophylle." },
    { id: "evi", label: "Vigueur", longLabel: "EVI (Densité)", icon: Zap, color: "#0891b2", description: "Plus précis dans les zones à haute densité végétale." },
    { id: "ndwi", label: "Eau", longLabel: "NDWI (Stress Hydrique)", icon: Droplets, color: "#2563eb", description: "Mesure le taux d'humidité interne des feuilles." },
    { id: "nri", label: "Azote", longLabel: "NRI (Besoins Engrais)", icon: Activity, color: "#7c3aed", description: "Aide à optimiser l'apport en fertilisants azotés." },
    { id: "dswi", label: "Risque", longLabel: "DSWI (Maladies)", icon: AlertTriangle, color: "#dc2626", description: "Détection précoce du stress dû aux maladies." },
];

export function AgroAnalyticsChart({ initialData, polygonId, isSyncing: initialSyncing, className }: AgroAnalyticsChartProps) {
    const [activeIndex, setActiveIndex] = useState(INDICES[0]);
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch new index data when tab changes
    useEffect(() => {
        const fetchData = async () => {
            // Only set loading if we don't have initial data for NDVI
            if (activeIndex.id !== "ndvi" || data.length === 0) {
                setIsLoading(true);
            }

            // Clear old data to avoid showing the same curve for different indices
            if (activeIndex.id !== "ndvi") {
                setData([]);
            } else {
                setData(initialData);
                setIsLoading(false);
                return;
            }

            const result = await getHistoricalIndexAction(polygonId, activeIndex.id);
            if (result.data && result.data.length > 0) {
                setData(result.data);
            } else {
                setData([]); // Ensure it's empty if fetch fails
            }
            setIsLoading(false);
        };

        fetchData();
    }, [activeIndex, polygonId, initialData]);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        const sortedData = [...data].sort((a, b) => a.dt - b.dt);

        return sortedData.map((point) => {
            const date = new Date(point.dt * 1000);
            return {
                dateFormatted: format(date, "MMM yyyy", { locale: fr }),
                fullDate: format(date, "dd MMM yyyy", { locale: fr }),
                mean: Number((point.data?.mean ?? 0).toFixed(2)),
                min: Number((point.data?.min ?? 0).toFixed(2)),
                max: Number((point.data?.max ?? 0).toFixed(2)),
            };
        });
    }, [data]);

    if (initialSyncing || (isLoading && data.length === 0)) {
        return (
            <div className="h-[400px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-border border-dashed space-y-3">
                <Loader2 className="size-8 text-[#4a8c5c] animate-spin" />
                <p className="text-slate-500 text-sm font-bold tracking-tight text-center">Analyse Satellite Avancée...</p>
                <p className="text-slate-400 text-[11px] font-medium max-w-[250px] text-center">Récupération des indices spectraux en cours via Sentinel-2.</p>
            </div>
        );
    }

    return (
        <div className={cn("w-full p-6 bg-white rounded-xl border border-border shadow-sm flex flex-col relative overflow-hidden", className)}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2c5f42]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                <div>
                    <h3 className="text-[14px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <activeIndex.icon className="size-4" style={{ color: activeIndex.color }} />
                        {activeIndex.longLabel}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{activeIndex.description}</p>
                </div>

                {/* Index Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100 self-start">
                    {INDICES.map((idx) => {
                        const Icon = idx.icon;
                        const isActive = activeIndex.id === idx.id;
                        return (
                            <button
                                key={idx.id}
                                onClick={() => setActiveIndex(idx)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                                    isActive
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Icon className={cn("size-3", isActive ? "" : "opacity-50")} style={{ color: isActive ? idx.color : undefined }} />
                                {idx.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-[400px] w-full relative mt-2 z-10">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                        <Loader2 className="size-6 text-slate-400 animate-spin" />
                    </div>
                )}

                {!isLoading && chartData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-border border-dashed space-y-2">
                        <Activity className="size-8 text-slate-300 mb-2 opacity-50" />
                        <p className="text-slate-500 text-sm font-bold">Analyse {activeIndex.id.toUpperCase()} indisponible</p>
                        <p className="text-slate-400 text-[11px] font-medium px-8 text-center max-w-[300px]">L'API satellite n'a pas encore généré cet indice ou votre parcelle est en attente de synchronisation.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={activeIndex.color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={activeIndex.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="dateFormatted"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={[0, 1]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                                itemStyle={{ color: activeIndex.color, fontWeight: 'bold', fontSize: '13px' }}
                                formatter={(value: number) => [`${value} `, activeIndex.label]}
                            />
                            <Area
                                type="monotone"
                                dataKey="mean"
                                stroke={activeIndex.color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIndex)"
                                activeDot={{ r: 6, fill: activeIndex.color, stroke: "#ffffff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                <span>Dernière analyse complète: il y a 2h</span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Source Sentinel-2 L2A
                </span>
            </div>
        </div >
    );
}
