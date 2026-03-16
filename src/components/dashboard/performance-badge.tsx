"use client";

import { ShieldCheck } from "lucide-react";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PerformanceBadgeProps {
    score: number;
    delta: string;
}

export function PerformanceBadge({ score, delta }: PerformanceBadgeProps) {
    const isPositive = !delta.startsWith('-');

    return (
        <div className="space-y-0.5 mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Agro-Score</h4>
            <div className="flex items-end gap-2">
                <span className="text-6xl font-medium text-slate-900 leading-none tracking-tight">
                    {score || "--"}
                </span>
                <div className="flex flex-col mb-1 select-none">
                    <span className="text-[12px] font-bold text-slate-300">/100</span>
                    <div className={cn(
                        "flex items-center gap-0.5 text-[11px] font-bold",
                        isPositive ? "text-emerald-600" : "text-amber-600"
                    )}>
                        {isPositive ? <IconTrendingUp className="size-3.5" /> : <IconTrendingDown className="size-3.5" />}
                        {isPositive ? '+' : ''}{delta}%
                    </div>
                </div>
            </div>
        </div>
    );
}
