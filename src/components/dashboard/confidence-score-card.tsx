import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ConfidenceScoreCardProps {
    score: number;
    role: "FARMER" | "COMPANY";
    className?: string;
    hideCTA?: boolean;
}

function RadialProgress({ value, size = 72 }: { value: number; size?: number }) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 80 ? "#2c5f42" : value >= 50 ? "#4a8c5c" : "#94a3b8";

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={5}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={5}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}

export function ConfidenceScoreCard({ score, role, className, hideCTA }: ConfidenceScoreCardProps) {
    const isHigh = score >= 80;
    const isMedium = score >= 50 && score < 80;

    const visibilityMultiplier = Math.round(score / 10);

    return (
        <div className={cn(
            "p-6 rounded-xl bg-white border border-border overflow-hidden relative shadow-sm",
            className
        )}>
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Score de Confiance
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[32px] font-light text-slate-800 tabular-nums leading-none tracking-tight">
                            {score}%
                        </span>
                        {isHigh && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#e8f4ed] text-[#2c5f42] uppercase tracking-wide border border-[#c4dece]">
                                Vérifié
                            </span>
                        )}
                    </div>
                </div>
                {/* Radial progress */}
                <div className="relative flex items-center justify-center">
                    <RadialProgress value={score} size={44} />
                    <span className="absolute text-[10px] font-bold text-slate-700 tabular-nums">
                        {score}
                    </span>
                </div>
            </div>

            {/* Visibility metric */}
            <div className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium mb-5 px-3 py-1.5 rounded-md w-fit border",
                isHigh ? "bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece]" :
                    isMedium ? "bg-slate-50 text-slate-600 border-border" :
                        "bg-slate-50 text-slate-500 border-border"
            )}>
                <TrendingUp className="size-3" />
                <span>Visibilité ×{visibilityMultiplier}</span>
                <span className="text-[9px] opacity-60">vs marché</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1 mb-5 overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isHigh ? "bg-[#2c5f42]" : isMedium ? "bg-[#a8d5be]" : "bg-slate-300"
                    )}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Alert / CTA */}
            {!hideCTA && score < 100 && (
                <div className="flex items-start gap-3 rounded-lg p-3.5 bg-[#f8fdf9] border border-[#e0ede5]">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-[#4a8c5c]" />
                    <div>
                        <p className="text-[12px] font-semibold text-slate-800 mb-0.5">
                            Complétez votre profil
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            {role === "FARMER"
                                ? "Ajoutez votre ICE et ONSSA pour débloquer ×5 requêtes en plus."
                                : "Ajoutez ICE et RC pour maximiser vos opportunités sur le marché."}
                        </p>
                        <Link
                            href="/dashboard/settings"
                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-[#2c5f42] hover:underline"
                        >
                            Mettre à jour <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
