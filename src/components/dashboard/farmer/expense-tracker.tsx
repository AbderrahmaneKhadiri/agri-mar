"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Wallet,
    TrendingUp,
    Receipt,
    Trash2,
    ChevronRight,
    Search,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AddExpenseModal } from "./add-expense-modal";
import { deleteExpenseAction } from "@/actions/expenses.actions";
import { toast } from "sonner";

interface ExpenseTrackerProps {
    initialExpenses: any[];
    harvestPlans: any[];
}

const CATEGORY_LABELS: Record<string, string> = {
    INPUTS: "Intrants",
    LABOR: "Main-d'œuvre",
    FUEL: "Carburant",
    LOGISTICS: "Logistique",
    OTHERS: "Autres",
};

const CATEGORY_COLORS: Record<string, string> = {
    INPUTS: "bg-[#f0f8f4] text-[#4a8c5c] border-[#c4dece]",
    LABOR: "bg-blue-50 text-blue-600 border-blue-100",
    FUEL: "bg-amber-50 text-amber-600 border-amber-100",
    LOGISTICS: "bg-purple-50 text-purple-600 border-purple-100",
    OTHERS: "bg-slate-50 text-slate-600 border-slate-100",
};

export function ExpenseTracker({ initialExpenses, harvestPlans }: ExpenseTrackerProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    // Sync state with props when server data changes
    useEffect(() => {
        setExpenses(initialExpenses);
    }, [initialExpenses]);

    const totalSpent = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

    // Group by category for a simple summary
    const statsByCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
        return acc;
    }, {} as Record<string, number>);

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette dépense ?")) return;
        setIsDeleting(id);
        try {
            await deleteExpenseAction(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            toast.success("Dépense supprimée");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestion des Coûts</h2>
                    <p className="text-[12px] font-medium text-slate-500">Suivez vos dépenses d'exploitation en temps réel.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-10 rounded-xl bg-[#2c5f42] text-white font-bold text-[11px] uppercase tracking-widest px-5 shadow-lg shadow-slate-200 hover:scale-105 transition-transform"
                >
                    <Plus className="size-3.5 mr-2" />
                    Nouvelle Dépense
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#2c5f42] rounded-xl p-5 flex flex-col gap-3 shadow-sm group">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#a8d5be] uppercase tracking-wider">Total Dépensé</p>
                        <Wallet className="size-3.5 text-[#a8d5be]" />
                    </div>
                    <span className="text-[30px] font-light text-white tabular-nums leading-none">
                        {totalSpent.toLocaleString()} <span className="text-[12px] font-bold text-white/50">DH</span>
                    </span>
                    <p className="text-[10px] text-white/50">Cumul des dépenses</p>
                </div>

                {Object.entries(statsByCategory).slice(0, 3).map(([cat, amount]) => (
                    <div key={cat} className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm group hover:border-[#a8d5be] transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{CATEGORY_LABELS[cat]}</p>
                            <TrendingUp className="size-3.5 text-[#2c5f42]" />
                        </div>
                        <span className="text-[24px] font-light text-slate-800 tabular-nums leading-none">
                            {Number(amount).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">DH</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Par catégorie</p>
                    </div>
                ))}
            </div>

            {/* Main List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Historique des Dépenses</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <input
                            placeholder="Rechercher..."
                            className="bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2 text-[12px] font-medium focus:ring-1 focus:ring-slate-200 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {expenses.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                                <Receipt className="size-8 text-slate-200" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Aucune dépense enregistrée</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px] mx-auto">
                                Commencez à suivre vos coûts pour optimiser votre rentabilité.
                            </p>
                        </div>
                    ) : (
                        expenses.map((expense) => (
                            <div key={expense.id} className="p-6 hover:bg-slate-50/50 transition-colors group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center border ${CATEGORY_COLORS[expense.category]}`}>
                                        <Wallet className="size-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-bold text-slate-900">{expense.amount.toLocaleString()} DH</span>
                                            <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0 border-none ${CATEGORY_COLORS[expense.category]}`}>
                                                {CATEGORY_LABELS[expense.category]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {format(new Date(expense.date), "dd MMMM yyyy", { locale: fr })}
                                            </span>
                                            {expense.harvestPlan && (
                                                <>
                                                    <div className="size-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                        <TrendingUp className="size-3" />
                                                        {expense.harvestPlan.cropName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {expense.description && (
                                            <p className="text-[11px] text-slate-400 mt-2 italic">"{expense.description}"</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(expense.id)}
                                        className="size-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        disabled={isDeleting === expense.id}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-300">
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                harvestPlans={harvestPlans}
            />
        </div>
    );
}
