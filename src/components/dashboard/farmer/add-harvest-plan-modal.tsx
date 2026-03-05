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
import { createHarvestPlanAction } from "@/actions/harvests.actions";
import { toast } from "sonner";
import { Loader2, CalendarIcon, Sprout } from "lucide-react";

const harvestPlanSchema = z.object({
    cropName: z.string().min(1, "Le nom de la culture est requis"),
    variety: z.string().optional(),
    plantingDate: z.string().min(1, "La date de semis est requise"),
    estimatedHarvestDate: z.string().min(1, "La date de récolte estimée est requise"),
    area: z.string().min(1, "La surface est requise"),
    estimatedYield: z.string().min(1, "Le rendement estimé est requis"),
    unit: z.enum(["KG", "TONNE"]),
    notes: z.string().optional(),
});

type HarvestPlanFormValues = z.infer<typeof harvestPlanSchema>;

interface AddHarvestPlanModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddHarvestPlanModal({ isOpen, onOpenChange }: AddHarvestPlanModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<HarvestPlanFormValues>({
        resolver: zodResolver(harvestPlanSchema),
        defaultValues: {
            cropName: "",
            variety: "",
            plantingDate: "",
            estimatedHarvestDate: "",
            area: "",
            estimatedYield: "",
            unit: "TONNE",
            notes: "",
        },
    });

    const onSubmit = async (values: HarvestPlanFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createHarvestPlanAction({
                ...values,
                plantingDate: new Date(values.plantingDate),
                estimatedHarvestDate: new Date(values.estimatedHarvestDate),
                area: values.area,
                estimatedYield: values.estimatedYield,
                status: "PLANNED",
            });

            if (result.success) {
                toast.success("Plan de récolte créé avec succès !");
                form.reset();
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de la création du plan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                            <Sprout className="size-6 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Nouvelle Planification</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Enregistrez un nouveau cycle de culture pour suivre votre production.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="cropName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Culture (ex: Tomate)</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" placeholder="Ex: Tomate Ronde" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="variety"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Variété (Optionnel)</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" placeholder="Ex: Daniela" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="plantingDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date de Semis</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estimatedHarvestDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Récolte Estimée</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surface (Ha)</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" step="0.1" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estimatedYield"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rendement Ét.</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unité</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white">
                                                        <SelectValue placeholder="Unité" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="KG">KG</SelectItem>
                                                    <SelectItem value="TONNE">TONNE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes Additionnelles</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[100px] rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500" />
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
                                    className="flex-[2] h-12 rounded-xl bg-[#2c5f42] text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Lancer la Culture"
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
