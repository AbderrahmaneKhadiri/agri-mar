"use client";

import { Bar, BarChart, XAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";

interface MarketBarChartProps {
    data: { date: string; actives: number; epuisees: number }[];
    totalOffers: number;
}

const chartConfig = {
    actives: {
        label: "Actives",
        color: "hsl(0, 0%, 10%)",
    },
    epuisees: {
        label: "Épuisées",
        color: "hsl(0, 0%, 60%)",
    },
} satisfies ChartConfig;

export function MarketBarChart({ data, totalOffers }: MarketBarChartProps) {
    return (
        <Card className="@container/card bg-white shadow-sm border-slate-100">
            <CardHeader>
                <div className="flex items-center justify-between mb-1">
                    <CardDescription className="text-[13px] font-medium text-slate-500">
                        Marché Ouvert
                    </CardDescription>
                    <div className="p-1.5 rounded-lg text-slate-700 bg-slate-100 border border-slate-200/60">
                        <Globe className="size-3.5" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tabular-nums text-slate-900">
                    {totalOffers}
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5">
                    Offres — 7 derniers jours
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                <ChartContainer config={chartConfig} className="h-[80px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        barCategoryGap="25%"
                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={6}
                            axisLine={false}
                            tick={{ fontSize: 9, fontWeight: 600, fill: "#94a3b8" }}
                            tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("fr-FR", {
                                    weekday: "short",
                                })
                            }
                        />
                        <Bar
                            dataKey="actives"
                            stackId="a"
                            fill="var(--color-actives)"
                            radius={[0, 0, 3, 3]}
                        />
                        <Bar
                            dataKey="epuisees"
                            stackId="a"
                            fill="var(--color-epuisees)"
                            radius={[3, 3, 0, 0]}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent indicator="line" />}
                            cursor={false}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
