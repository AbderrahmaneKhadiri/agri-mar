"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface HistoryAnalyticsChartProps {
    data: any;
    isSyncing?: boolean;
}

export function HistoryAnalyticsChart({ data, isSyncing }: HistoryAnalyticsChartProps) {
    if (isSyncing || !data) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 gap-4">
                <div className="relative">
                    <div className="size-12 rounded-full border-2 border-slate-100 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronisation des archives...</p>
            </div>
        );
    }

    // Prepare data for Recharts: we need to merge current and previous by date (month)
    // In our DAL, we return dates as "Jan", "Feb", etc.
    const chartData = data.currentYear.map((curr: any, index: number) => ({
        name: curr.date,
        actuelle: curr.ndvi,
        precedente: data.previousYear[index]?.ndvi || 0
    }));

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorActuelle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPrecedente" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                        labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                    <Area
                        name="Année Actuelle (N)"
                        type="monotone"
                        dataKey="actuelle"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorActuelle)"
                        animationDuration={1500}
                    />
                    <Area
                        name="Année Précédente (N-1)"
                        type="monotone"
                        dataKey="precedente"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPrecedente)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
