"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpenseAction } from "@/actions/expenses.actions";
import { toast } from "sonner";
import { Loader2, Receipt, Wallet } from "lucide-react";

const expenseSchema = z.object({
    harvestPlanId: z.string().optional(),
    category: z.enum(["INPUTS", "LABOR", "FUEL", "LOGISTICS", "OTHERS"]),
    amount: z.string().min(1, "Le montant est requis"),
    description: z.string().optional(),
    date: z.string().min(1, "La date est requise"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    harvestPlans: { id: string; cropName: string; variety?: string | null }[];
}

export function AddExpenseModal({ isOpen, onOpenChange, harvestPlans }: AddExpenseModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            harvestPlanId: "none",
            category: "INPUTS",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
        },
    });

    const onSubmit = async (values: ExpenseFormValues) => {
        setIsSubmitting(true);
        try {
            await createExpenseAction({
                ...values,
                harvestPlanId: values.harvestPlanId === "none" ? null : values.harvestPlanId,
                date: new Date(values.date),
            });

            toast.success("Dépense enregistrée avec succès !");
            form.reset();
            router.refresh();
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement de la dépense");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                            <Wallet className="size-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Nouvelle Dépense</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Suivez vos coûts de production pour calculer votre rentabilité.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catégorie</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white">
                                                        <SelectValue placeholder="Choisir une catégorie" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="INPUTS">Intrants (Semences, Engrais)</SelectItem>
                                                    <SelectItem value="LABOR">Main-d'œuvre</SelectItem>
                                                    <SelectItem value="FUEL">Carburant / Énergie</SelectItem>
                                                    <SelectItem value="LOGISTICS">Transport / Logistique</SelectItem>
                                                    <SelectItem value="OTHERS">Autres frais</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Montant (DH)</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" step="0.01" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" placeholder="0.00" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date de la dépense</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="harvestPlanId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cycle de culture (Optionnel)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white">
                                                        <SelectValue placeholder="Lier à une récolte" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Non spécifié</SelectItem>
                                                    {harvestPlans.map(plan => (
                                                        <SelectItem key={plan.id} value={plan.id}>
                                                            {plan.cropName} {plan.variety ? `(${plan.variety})` : ""}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description / Détails</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[100px] rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" placeholder="Ex: Achat de 5 sacs d'engrais NPK..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 h-12 rounded-xl border border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-[11px] hover:text-slate-900"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Enregistrer la Dépense"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
