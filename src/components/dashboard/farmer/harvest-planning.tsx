"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HarvestPlanSelectDTO } from "@/data-access/harvests.dal";
import {
    Plus,
    Calendar,
    TrendingUp,
    Layers,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AddHarvestPlanModal } from "./add-harvest-plan-modal";
import { HarvestResultModal } from "./harvest-result-modal";
import { updateHarvestStatusAction } from "@/actions/harvests.actions";
import { toast } from "sonner";

interface HarvestPlanningProps {
    initialPlans: HarvestPlanSelectDTO[];
}

export function HarvestPlanning({ initialPlans }: HarvestPlanningProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [resultModalState, setResultModalState] = useState<{ isOpen: boolean; planId: string }>({ isOpen: false, planId: "" });
    const [plans, setPlans] = useState(initialPlans);
    const router = useRouter();

    // Sync state with props when server data changes
    useEffect(() => {
        setPlans(initialPlans);
    }, [initialPlans]);

    const totalArea = plans.reduce((acc, p) => acc + Number(p.area), 0);
    const pendingHarvestCount = plans.filter(p => p.status === "GROWING").length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PLANNED": return "bg-slate-50 text-slate-500 border-slate-200";
            case "GROWING": return "bg-[#f0f8f4] text-[#4a8c5c] border-[#c4dece]";
            case "HARVESTED": return "bg-slate-900 text-white border-none shadow-sm shadow-slate-200";
            case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-slate-50 text-slate-500";
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (newStatus === "HARVESTED") {
            setResultModalState({ isOpen: true, planId: id });
            return;
        }

        const result = await updateHarvestStatusAction(id, newStatus);
        if (result.success) {
            toast.success("Statut mis à jour");
            router.refresh();
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const calculateMargins = (plan: any) => {
        const totalExpenses = plan.expenses?.reduce((acc: number, exp: any) => acc + Number(exp.amount), 0) || 0;
        const revenue = Number(plan.actualYield || 0) * Number(plan.actualSalePrice || 0);
        const margin = revenue - totalExpenses;
        const roi = totalExpenses > 0 ? (margin / totalExpenses) * 100 : 0;
        return { totalExpenses, revenue, margin, roi };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Calendrier de Récolte</h2>
                    <p className="text-[12px] font-medium text-slate-500">Gérez vos cycles de culture et prévisions de production.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-10 rounded-xl bg-[#2c5f42] text-white font-bold text-[11px] uppercase tracking-widest px-5 shadow-lg shadow-slate-200"
                >
                    <Plus className="size-3.5 mr-2" />
                    Nouveau Plan
                </Button>
            </div>

            {/* Metrics Row */}
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm group hover:border-[#a8d5be] transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Surface Totale</p>
                        <Layers className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">
                        {totalArea.toFixed(1)} <span className="text-[12px] font-bold text-slate-400">Ha</span>
                    </span>
                    <p className="text-[10px] text-slate-400">Totalité des parcelles</p>
                </div>

                <div className="bg-[#f0f8f4] rounded-xl border border-[#c4dece] p-5 flex flex-col gap-3 shadow-sm group">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#4a8c5c] uppercase tracking-wider">En Croissance</p>
                        <TrendingUp className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-[#2c5f42] tabular-nums leading-none">
                        {pendingHarvestCount} <span className="text-[12px] font-bold text-[#4a8c5c]/60">Cycles</span>
                    </span>
                    <p className="text-[10px] text-[#4a8c5c]/80">Suivi actif</p>
                </div>

                <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm group">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Prochaine Récolte</p>
                        <Calendar className="size-3.5 text-[#2c5f42]" />
                    </div>
                    <span className="text-[30px] font-light text-slate-800 tabular-nums leading-none">
                        Estimée
                    </span>
                    <p className="text-[10px] text-slate-400">Voir calendrier ci-dessous</p>
                </div>
            </div>

            {/* Timeline View */}
            <div className="space-y-4">
                {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
                            <Clock className="size-8 text-slate-200" />
                        </div>
                        <h3 className="font-bold text-slate-900">Aucune planification</h3>
                        <p className="text-[12px] text-slate-400 max-w-[200px] text-center mt-1">Commencez par ajouter votre première culture pour suivre son évolution.</p>
                        <Button
                            variant="link"
                            className="mt-4 text-emerald-600 font-bold p-0 h-auto"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Créer un plan maintenant
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className="relative bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group overflow-hidden">
                                {/* Glass background accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:w-48 group-hover:h-48 transition-all" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{format(new Date(plan.plantingDate), "MMM", { locale: fr })}</span>
                                            <span className="text-[16px] font-black text-slate-900 leading-none mt-1">{format(new Date(plan.plantingDate), "dd")}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 tracking-tight text-[15px]">{plan.cropName}</h3>
                                                {plan.variety && <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-full">{plan.variety}</span>}
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                                                <span className="flex items-center gap-1.5"><Layers className="size-3 text-[#4a8c5c]" /> {plan.area} Ha</span>
                                                <span className="flex items-center gap-1.5"><TrendingUp className="size-3 text-[#4a8c5c]" /> Et. {plan.estimatedYield} {plan.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        {/* Status Progress */}
                                        <div className="flex items-center gap-3">
                                            <div className="hidden lg:flex items-center gap-1">
                                                <div className={cn("size-2 rounded-full shadow-sm", plan.status === "PLANNED" || plan.status === "GROWING" || plan.status === "HARVESTED" ? "bg-[#4a8c5c]" : "bg-slate-200")} />
                                                <div className="w-8 h-0.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full transition-all duration-1000", plan.status === "GROWING" || plan.status === "HARVESTED" ? "w-full bg-[#4a8c5c]" : "w-0")} />
                                                </div>
                                                <div className={cn("size-2 rounded-full shadow-sm", plan.status === "GROWING" || plan.status === "HARVESTED" ? "bg-[#4a8c5c]" : "bg-slate-200")} />
                                                <div className="w-8 h-0.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full transition-all duration-1000", plan.status === "HARVESTED" ? "w-full bg-[#4a8c5c]" : "w-0")} />
                                                </div>
                                                <div className={cn("size-2 rounded-full shadow-sm", plan.status === "HARVESTED" ? "bg-[#4a8c5c]" : "bg-slate-200")} />
                                            </div>
                                            <Badge variant="outline" className={cn("text-[10px] font-black rounded-full border-none px-3 py-1 uppercase tracking-widest", getStatusColor(plan.status))}>
                                                {plan.status === "PLANNED" ? "Planifié" :
                                                    plan.status === "GROWING" ? "En Croissance" :
                                                        plan.status === "HARVESTED" ? "Récolté" : "Annulé"}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Délai Estimé</span>
                                            <div className="flex items-center gap-2">
                                                <div className="text-[13px] font-black text-slate-900">
                                                    {format(new Date(plan.estimatedHarvestDate), "d MMM yyyy", { locale: fr })}
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                    differenceInDays(new Date(plan.estimatedHarvestDate), new Date()) < 7 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                                                )}>
                                                    J-{differenceInDays(new Date(plan.estimatedHarvestDate), new Date())}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {plan.status === "PLANNED" && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3"
                                                    onClick={() => handleUpdateStatus(plan.id, "GROWING")}
                                                >
                                                    Semé
                                                </Button>
                                            )}
                                            {plan.status === "GROWING" && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-3"
                                                    onClick={() => handleUpdateStatus(plan.id, "HARVESTED")}
                                                >
                                                    Récolté
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {plan.status === "HARVESTED" && (
                                    <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {(() => {
                                            const { totalExpenses, revenue, margin, roi } = calculateMargins(plan);
                                            return (
                                                <>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coût Total</span>
                                                        <div className="text-[13px] font-bold text-slate-900">{totalExpenses.toLocaleString()} <span className="text-[9px] text-slate-400">DH</span></div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenu Brut</span>
                                                        <div className="text-[13px] font-bold text-slate-900">{revenue.toLocaleString()} <span className="text-[9px] text-slate-400">DH</span></div>
                                                    </div>
                                                    <div className="space-y-1 group/margin">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marge Nette</span>
                                                        <div className={cn("text-[13px] font-black", margin >= 0 ? "text-emerald-600" : "text-red-600")}>
                                                            {margin > 0 ? "+" : ""}{margin.toLocaleString()} <span className="text-[9px]">DH</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance (ROI)</span>
                                                        <div>
                                                            <Badge variant="outline" className={cn(
                                                                "text-[10px] font-black border-none px-2 py-0.5 rounded-lg",
                                                                roi >= 0 ? "bg-[#f0f8f4] text-[#4a8c5c]" : "bg-red-50 text-red-600"
                                                            )}>
                                                                {roi > 0 ? "+" : ""}{roi.toFixed(1)}%
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddHarvestPlanModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
            />

            <HarvestResultModal
                isOpen={resultModalState.isOpen}
                onOpenChange={(open) => setResultModalState(prev => ({ ...prev, isOpen: open }))}
                planId={resultModalState.planId}
                onSuccess={() => {
                    setResultModalState(prev => ({ ...prev, isOpen: false }));
                    router.refresh();
                }}
            />
        </div>
    );
}
