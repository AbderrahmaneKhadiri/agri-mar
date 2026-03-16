import { AIAdvisorChat } from "@/components/dashboard/chat/ai-advisor-chat";
import { Sparkles, Info } from "lucide-react";

export default function AIAdvisorPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-5 text-[#2c5f42]" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conseiller Intelligent</h1>
                </div>
                <p className="text-slate-500 text-sm">
                    Votre assistant agronomique personnel, alimenté par l'IA et vos données de terrain.
                </p>
            </div>

            <div className="h-[calc(100vh-280px)]">
                <AIAdvisorChat />
            </div>

            {/* Disclaimer / Additional Info */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Info className="size-4" />
                </div>
                <div className="space-y-1">
                    <p className="text-[12px] font-bold text-amber-900 uppercase tracking-widest leading-none">Note de l'Expert</p>
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                        Le Conseiller AgriMar utilise des modèles d'intelligence artificielle pour analyser vos données AgroMonitoring.
                        Bien que très précis, ces conseils doivent être validés par une inspection physique de vos champs avant toute action critique.
                    </p>
                </div>
            </div>
        </div>
    );
}
