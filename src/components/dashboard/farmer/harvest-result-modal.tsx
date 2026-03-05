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
import { updateHarvestActualsAction } from "@/actions/harvests.actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const harvestResultSchema = z.object({
    actualYield: z.string().min(1, "Le rendement réel est requis"),
    actualSalePrice: z.string().min(1, "Le prix de vente est requis"),
    actualHarvestDate: z.string().min(1, "La date de récolte est requise"),
});

type HarvestResultFormValues = z.infer<typeof harvestResultSchema>;

interface HarvestResultModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string;
    onSuccess: () => void;
}

export function HarvestResultModal({ isOpen, onOpenChange, planId, onSuccess }: HarvestResultModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<HarvestResultFormValues>({
        resolver: zodResolver(harvestResultSchema),
        defaultValues: {
            actualYield: "",
            actualSalePrice: "",
            actualHarvestDate: new Date().toISOString().split("T")[0],
        },
    });

    const onSubmit = async (values: HarvestResultFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updateHarvestActualsAction(planId, {
                actualYield: values.actualYield,
                actualSalePrice: values.actualSalePrice,
                actualHarvestDate: new Date(values.actualHarvestDate),
            });

            if (result.success) {
                toast.success("Récolte enregistrée avec succès !");
                form.reset();
                router.refresh();
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="size-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Terminer la Récolte</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Saisissez les résultats réels pour calculer votre marge nette.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="actualYield"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rendement Réel (Quantité)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500" placeholder="Ex: 5.5" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="actualSalePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prix de Vente Moyen (DH / unité)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500" placeholder="Ex: 4.50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="actualHarvestDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date de Récolte Réelle</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500" />
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
                                    className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Confirmer la Récolte"
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
