"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { createTenderAction } from "@/actions/tenders.actions";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tenderSchema = z.object({
    title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
    category: z.string().min(1, "La catégorie est requise"),
    quantity: z.string().min(1, "La quantité est requise"),
    unit: z.enum(["KG", "TONNE", "LITRE", "UNITE", "BOITE", "PALETTE"]),
    targetPrice: z.string().optional(),
    region: z.string().optional(),
    description: z.string().min(10, "La description doit faire au moins 10 caractères"),
    deadline: z.string().min(1, "La date limite est requise"),
});

type TenderFormValues = z.infer<typeof tenderSchema>;

interface CreateTenderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTenderModal({ isOpen, onOpenChange }: CreateTenderModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requirement, setRequirement] = useState("");
    const [requirements, setRequirements] = useState<string[]>([]);

    const form = useForm<TenderFormValues>({
        resolver: zodResolver(tenderSchema),
        defaultValues: {
            title: "",
            category: "",
            quantity: "",
            unit: "TONNE",
            targetPrice: "",
            region: "",
            description: "",
            deadline: "",
        },
    });

    const onSubmit = async (values: TenderFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createTenderAction({
                ...values,
                quantity: values.quantity,
                targetPrice: values.targetPrice || null,
                deadline: new Date(values.deadline),
                requirements: requirements,
            });

            if (result.success) {
                toast.success("Appel d'offre publié avec succès !");
                form.reset();
                setRequirements([]);
                onOpenChange(false);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de la publication");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRequirement = () => {
        if (requirement.trim() && !requirements.includes(requirement.trim())) {
            setRequirements([...requirements, requirement.trim()]);
            setRequirement("");
        }
    };

    const removeRequirement = (req: string) => {
        setRequirements(requirements.filter((r) => r !== req));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Publier un Appel d&apos;Offre</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Décrivez vos besoins précis pour recevoir des propositions des meilleurs producteurs.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Titre de la demande</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Sourcing 50 tonnes de Myrtilles (Variété Duke)" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catégorie</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none text-slate-900 font-medium">
                                                        <SelectValue placeholder="Choisir une catégorie" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Fruits">Fruits</SelectItem>
                                                    <SelectItem value="Légumes">Légumes</SelectItem>
                                                    <SelectItem value="Agrumes">Agrumes</SelectItem>
                                                    <SelectItem value="Céréales">Céréales</SelectItem>
                                                    <SelectItem value="Olives">Olives</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantité</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0.00" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold uppercase" />
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
                                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none text-slate-900 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="TONNE">Tonnes</SelectItem>
                                                        <SelectItem value="KG">Kg</SelectItem>
                                                        <SelectItem value="PALETTE">Palettes</SelectItem>
                                                        <SelectItem value="UNITE">Unités</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-bold uppercase" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="targetPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Budget indicatif (MAD/Unité)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 25.50" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date limite d&apos;offre</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <div className="md:col-span-2 space-y-4">
                                    <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exigences spécifiques (Certifications, Qualité...)</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            value={requirement}
                                            onChange={(e) => setRequirement(e.target.value)}
                                            placeholder="Ex: Global GAP, Bio Maroc..."
                                            className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addRequirement();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addRequirement} variant="outline" className="h-11 border-slate-100 rounded-xl px-4 hover:bg-slate-50">
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {requirements.map((req) => (
                                            <Badge key={req} className="bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 border-none font-bold text-[10px] uppercase py-1 pl-3 pr-1 gap-2 rounded-lg">
                                                {req}
                                                <button type="button" onClick={() => removeRequirement(req)} className="p-0.5 rounded-md hover:bg-white/20 transition-colors">
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description détaillée</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Détaillez vos besoins logistiques, d'emballage, de calibre..."
                                                    className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none resize-none p-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[12px] border-slate-100"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[12px] bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 shadow-xl shadow-slate-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Publication en cours...
                                        </>
                                    ) : (
                                        "Publier l'Appel d'Offre"
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
