
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceScoreCardProps {
    score: number;
    role: "FARMER" | "COMPANY";
    className?: string;
}

export function ConfidenceScoreCard({ score, role, className }: ConfidenceScoreCardProps) {
    const isHigh = score >= 80;
    const isMedium = score >= 50 && score < 80;

    return (
        <div className={cn(
            "p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
            className
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl",
                        isHigh ? "bg-emerald-50 text-emerald-600" : isMedium ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                    )}>
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Score de Confiance</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-900">{score}%</span>
                            {isHigh && (
                                <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Vérifié</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]">
                        <TrendingUp className="size-3" />
                        <span>Visibilité +{score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-qualification</span>
                </div>
            </div>

            <Progress
                value={score}
                className={cn(
                    "h-2 bg-slate-100 mb-6",
                    isHigh ? "[&>div]:bg-emerald-500" : isMedium ? "[&>div]:bg-amber-500" : "[&>div]:bg-slate-400"
                )}
            />

            <div className="grid grid-cols-1 gap-3">
                {score < 100 && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[12px] font-bold text-slate-700">
                                {score < 50 ? "Profil à compléter d'urgence" : "Augmentez votre score"}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                {role === "FARMER"
                                    ? "Ajoutez votre ICE et ONSSA pour multiplier vos demandes de contrats par 5."
                                    : "Complétez votre ICE et RC pour rassurer les coopératives et accéder aux prix producteurs."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
