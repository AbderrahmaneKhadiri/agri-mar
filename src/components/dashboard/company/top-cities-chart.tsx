"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Globe } from "lucide-react";
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";

interface TopCitiesChartProps {
    data: { city: string; count: number }[];
}

const COLORS = [
    "hsl(142, 71%, 45%)",  // emerald-500
    "hsl(142, 71%, 55%)",
    "hsl(142, 71%, 65%)",
    "hsl(142, 71%, 72%)",
    "hsl(142, 71%, 80%)",
];

const chartConfig = {
    count: {
        label: "Offres",
        color: "hsl(142, 71%, 45%)",
    },
} satisfies ChartConfig;

export function TopCitiesChart({ data }: TopCitiesChartProps) {
    const hasData = data.length > 0;

    return (
        <Card className="@container/card bg-white shadow-sm border-slate-100 col-span-1 md:col-span-2 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardDescription className="text-[13px] font-medium text-slate-500">
                        Marché Ouvert
                    </CardDescription>
                    <div className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50/50 border border-emerald-100/50">
                        <Globe className="size-3.5" />
                    </div>
                </div>
                <CardTitle className="text-[13px] font-bold text-slate-900 uppercase tracking-widest">
                    Top 5 Villes
                </CardTitle>
            </CardHeader>
            <div className="px-4 pb-2">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-[120px] w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                            barCategoryGap="20%"
                        >
                            <XAxis type="number" dataKey="count" hide />
                            <YAxis
                                type="category"
                                dataKey="city"
                                width={72}
                                tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[120px] flex items-center justify-center text-slate-300">
                        <div className="text-center">
                            <Globe className="size-8 opacity-20 mx-auto mb-1" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Aucune offre active</p>
                        </div>
                    </div>
                )}
            </div>
            <CardFooter className="flex-col items-start gap-1 pb-4 px-4">
                <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                    Villes avec le plus d&apos;offres actives sur le marché
                </div>
            </CardFooter>
        </Card>
    );
}
