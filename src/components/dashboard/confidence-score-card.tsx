
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ConfidenceScoreCardProps {
    score: number;
    role: "FARMER" | "COMPANY";
    className?: string;
}

function RadialProgress({ value, size = 72 }: { value: number; size?: number }) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 80 ? "#16a34a" : value >= 50 ? "#d97706" : "#0f172a";

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={6}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}

export function ConfidenceScoreCard({ score, role, className }: ConfidenceScoreCardProps) {
    const isHigh = score >= 80;
    const isMedium = score >= 50 && score < 80;
    const isLow = score < 50;

    const visibilityMultiplier = Math.round(score / 10);

    return (
        <div className={cn(
            "p-6 rounded-xl bg-white border border-border overflow-hidden relative",
            className
        )}>
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1">
                        Score de Confiance
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span style={{ fontSize: "22px", fontWeight: 600, lineHeight: "28px", color: "lab(2.75381 0 0)" }} className="tabular-nums">
                            {score}%
                        </span>
                        {isHigh && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
                                Certifié
                            </span>
                        )}
                    </div>
                </div>
                {/* Radial progress */}
                <div className="relative flex items-center justify-center">
                    <RadialProgress value={score} size={44} />
                    <span className="absolute text-[9px] font-black tabular-nums" style={{ color: "lab(2.75381 0 0)" }}>
                        {score}
                    </span>
                </div>
            </div>

            {/* Visibility metric */}
            <div className={cn(
                "flex items-center gap-1.5 text-[12px] font-bold mb-5 px-3 py-2 rounded-lg w-fit",
                isHigh ? "bg-slate-900 text-white" :
                    isMedium ? "bg-slate-100 text-slate-700" :
                        "bg-slate-100 text-slate-500"
            )}>
                <TrendingUp className="size-3.5" />
                <span>Visibilité ×{visibilityMultiplier}</span>
                <span className="text-[10px] opacity-60 font-medium">vs marché</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isHigh ? "bg-slate-900" : isMedium ? "bg-amber-500" : "bg-slate-400"
                    )}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Alert / CTA */}
            {score < 100 && (
                <div className={cn(
                    "flex items-start gap-3 rounded-xl p-3 border-l-2",
                    isLow
                        ? "bg-red-50 border-red-400"
                        : isMedium
                            ? "bg-amber-50 border-amber-400"
                            : "bg-slate-50 border-slate-300"
                )}>
                    <AlertCircle className={cn(
                        "size-4 shrink-0 mt-0.5",
                        isLow ? "text-red-500" : isMedium ? "text-amber-500" : "text-slate-400"
                    )} />
                    <div>
                        <p className="text-[12px] font-bold text-slate-800 mb-0.5">
                            {isLow ? "Profil à compléter d'urgence" : "Augmentez votre score"}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            {role === "FARMER"
                                ? "Ajoutez votre ICE et ONSSA pour ×5 vos demandes de contrats."
                                : "Complétez ICE et RC pour accéder aux prix producteurs."}
                        </p>
                        <Link
                            href="/dashboard/settings"
                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-slate-900 hover:underline"
                        >
                            Compléter le profil <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
