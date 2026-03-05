"use client";

import {
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Leaf, Building2, ShoppingBag, FileText, MapPin, ArrowUpRight, TrendingUp } from "lucide-react";
import { PartnerDTO } from "@/data-access/connections.dal";

interface CompanyOverviewProps {
    suppliers: PartnerDTO[];
    totalOffers: number;
    totalTenders: number;
    averageNdvi: string;
    totalMonitoredArea: number;
    marketChartData: { date: string; actives: number; epuisees: number }[];
    companyName: string;
}

const chartConfig = {
    actives: {
        label: "Offres actives",
        color: "#2c5f42",
    },
    epuisees: {
        label: "Épuisées",
        color: "#a8d5be",
    },
} satisfies ChartConfig;

export function CompanyOverview({
    suppliers,
    totalOffers,
    totalTenders,
    averageNdvi,
    totalMonitoredArea,
    marketChartData,
    companyName,
}: CompanyOverviewProps) {
    return (
        <div className="flex flex-col gap-5">

            {/* === HERO BANNER === */}
            <div className="rounded-2xl bg-[#2c5f42] px-8 py-7 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                {/* Left: welcome */}
                <div className="flex-1 relative z-10">
                    <p className="text-[10px] font-medium text-[#a8d5be] uppercase tracking-[3px] mb-2">Centre de Pilotage</p>
                    <h2 className="text-[26px] font-light text-white tracking-tight leading-none">{companyName}</h2>
                    <p className="text-[12px] text-white/50 mt-2 font-normal">Gérez vos approvisionnements et suivez votre réseau agricole</p>
                </div>

                {/* Right: quick stats */}
                <div className="flex gap-4 shrink-0 relative z-10">
                    <div className="text-center border-r border-white/15 pr-4">
                        <div className="text-[26px] font-light text-white tabular-nums">{suppliers.length}</div>
                        <div className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Partenaires</div>
                    </div>
                    <div className="text-center border-r border-white/15 pr-4">
                        <div className="text-[26px] font-light text-white tabular-nums">{totalOffers}</div>
                        <div className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Offres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[26px] font-light text-[#a8d5be] tabular-nums">{averageNdvi}</div>
                        <div className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">NDVI moy.</div>
                    </div>
                </div>
            </div>

            {/* === STATS ROW === */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Fournisseurs actifs</p>
                        <Building2 className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">{suppliers.length}</span>
                    <p className="text-[10px] text-slate-400">Partenariats acceptés</p>
                </div>

                <div className="bg-[#f0f8f4] rounded-xl border border-[#c4dece] p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#4a8c5c] uppercase tracking-wider">NDVI moyen</p>
                        <Leaf className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-[#2c5f42] tabular-nums leading-none">{averageNdvi}</span>
                    <p className="text-[10px] text-[#4a8c5c]/70">Santé réseau agricole</p>
                </div>

                <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Offres au marché</p>
                        <ShoppingBag className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">{totalOffers}</span>
                    <p className="text-[10px] text-slate-400">Produits disponibles</p>
                </div>

                <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Appels d&apos;offres</p>
                        <FileText className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">{totalTenders}</span>
                    <p className="text-[10px] text-slate-400">En cours</p>
                </div>
            </div>

            {/* === CHART + SUPPLIERS === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-[14px] font-semibold text-slate-800">Activité du Marché</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Offres actives vs épuisées — 7 derniers jours</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#2c5f42] bg-[#f0f8f4] border border-[#c4dece] px-2.5 py-1 rounded-full">
                            <TrendingUp className="size-3" />
                            {totalOffers} offres ouvertes
                        </div>
                    </div>

                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart
                            data={marketChartData}
                            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorActives" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2c5f42" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#2c5f42" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEpuisees" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a8d5be" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#a8d5be" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                                tickFormatter={(v) =>
                                    new Date(v).toLocaleDateString("fr-FR", { weekday: "short" })
                                }
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                width={24}
                                allowDecimals={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area
                                type="monotone"
                                dataKey="actives"
                                stroke="#2c5f42"
                                strokeWidth={2}
                                fill="url(#colorActives)"
                                dot={false}
                                activeDot={{ r: 4, fill: "#2c5f42", stroke: "#fff", strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="epuisees"
                                stroke="#a8d5be"
                                strokeWidth={1.5}
                                fill="url(#colorEpuisees)"
                                dot={false}
                                activeDot={{ r: 3, fill: "#a8d5be", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>

                {/* Suppliers panel */}
                <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
                    <div className="px-5 py-4 bg-[#f8fdf9] border-b border-[#e0ede5] flex items-center justify-between">
                        <h3 className="text-[13px] font-semibold text-[#2c5f42]">Mes Fournisseurs</h3>
                        <span className="text-[10px] font-medium text-[#4a8c5c] bg-[#e8f4ed] px-2 py-0.5 rounded-full border border-[#c4dece]">{suppliers.length} actifs</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                        {suppliers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-2">
                                <Building2 className="size-7 text-slate-200" />
                                <p className="text-[11px] text-slate-400">Aucun fournisseur partenaire</p>
                            </div>
                        ) : suppliers.map((s) => (
                            <div key={s.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#f8fdf9] transition-colors cursor-pointer">
                                <Avatar className="size-8 rounded-lg border border-border shrink-0">
                                    <AvatarImage src={s.avatarUrl || ""} className="object-cover" />
                                    <AvatarFallback className="text-[10px] font-semibold bg-[#eaf4ee] text-[#2c5f42]">
                                        {s.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-slate-800 truncate">{s.name}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                        <MapPin className="size-2.5 shrink-0" />
                                        <span className="truncate">{s.location || "—"}</span>
                                    </div>
                                </div>
                                <div className="size-2 rounded-full bg-[#2c5f42] shrink-0" />
                            </div>
                        ))}
                    </div>
                    {suppliers.length > 0 && (
                        <div className="px-5 py-3 border-t border-border bg-[#f8fdf9]">
                            <button className="text-[11px] font-medium text-[#2c5f42] flex items-center gap-1 hover:gap-1.5 transition-all">
                                Voir tous <ArrowUpRight className="size-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
