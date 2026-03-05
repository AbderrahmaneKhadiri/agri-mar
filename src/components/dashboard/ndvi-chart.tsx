"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface NdviDataPoint {
    dt: number;
    data: {
        mean: number;
        min: number;
        max: number;
        p25: number;
        p75: number;
        stdev: number;
    };
}

interface NdviChartProps {
    data: NdviDataPoint[];
    isSyncing?: boolean;
    hideHeader?: boolean;
    className?: string;
}

export function NdviChart({ data, isSyncing, hideHeader, className }: NdviChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Sort by date (dt is unix timestamp)
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

    if (isSyncing) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-border border-dashed space-y-3">
                <Loader2 className="size-8 text-[#4a8c5c] animate-spin" />
                <p className="text-slate-500 text-sm font-bold tracking-tight text-center">NDVI : Analyse Satellite en cours...</p>
                <p className="text-slate-400 text-[11px] font-medium max-w-[250px] text-center">Nous récupérons les indices de santé de votre parcelle. Merci de patienter.</p>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-border border-dashed space-y-2">
                <p className="text-slate-500 text-sm font-bold">Analyse NDVI indisponible</p>
                <p className="text-slate-400 text-[11px] font-medium px-8 text-center">L&apos;API satellite est ralentie ou votre parcelle est en attente de données historiques. Réessayez bientôt.</p>
            </div>
        );
    }

    return (
        <div className={cn("min-h-[320px] h-full w-full p-5 bg-white rounded-xl border border-border shadow-sm", className)}>
            {!hideHeader && (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Santé de la Végétation (NDVI)</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Moyenne de la chlorophylle sur les 6 derniers mois</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2c5f42] bg-[#f0f8f4] border border-[#c4dece] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        <Activity className="size-3" />
                        Live Monitoring
                    </div>
                </div>
            )}

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4a8c5c" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4a8c5c" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="dateFormatted"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            // Only show every few ticks if there are many data points
                            minTickGap={30}
                        />
                        <YAxis
                            domain={[0, 1]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                            itemStyle={{ color: '#2c5f42', fontWeight: 'bold', fontSize: '13px' }}
                            formatter={(value: number) => [`${value} `, 'NDVI Moyen']}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                        />
                        <Area
                            type="monotone"
                            dataKey="mean"
                            stroke="#2c5f42"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorNdvi)"
                            activeDot={{ r: 6, fill: "#2c5f42", stroke: "#ffffff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
