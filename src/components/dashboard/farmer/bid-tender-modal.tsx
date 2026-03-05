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
import { Textarea } from "@/components/ui/textarea";
import { createBidAction } from "@/actions/tenders.actions";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";

const bidSchema = z.object({
    offeredPrice: z.string().min(1, "Le prix est requis"),
    offeredQuantity: z.string().min(1, "La quantité est requise"),
    availabilityDate: z.string().min(1, "La date de disponibilité est requise"),
    message: z.string().optional(),
});

type BidFormValues = z.infer<typeof bidSchema>;

interface BidTenderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tender: any;
}

export function BidTenderModal({ isOpen, onOpenChange, tender }: BidTenderModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BidFormValues>({
        resolver: zodResolver(bidSchema),
        defaultValues: {
            offeredPrice: "",
            offeredQuantity: tender?.quantity || "",
            availabilityDate: "",
            message: "",
        },
    });

    const onSubmit = async (values: BidFormValues) => {
        if (!tender?.id) return;
        setIsSubmitting(true);
        try {
            const result = await createBidAction(tender.id, {
                proposedPrice: values.offeredPrice,
                proposedQuantity: values.offeredQuantity,
                availableDate: new Date(values.availabilityDate),
                message: values.message,
            });

            if (result.success) {
                toast.success("Votre offre a été envoyée avec succès !");
                form.reset();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'envoi de l'offre");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!tender) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Soumettre une Offre</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Répondez à l&apos;appel d&apos;offre pour <span className="text-slate-900 font-bold">{tender.title}</span> de <span className="text-slate-900 font-bold">{tender.company?.companyName}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Besoin Client</div>
                            <div className="text-[14px] font-bold text-slate-900">{tender.quantity} {tender.unit}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Visé</div>
                            <div className="text-[14px] font-bold text-slate-900">{tender.targetPrice ? `${tender.targetPrice} MAD/u` : "Non spécifié"}</div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="offeredPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Votre Prix (MAD/{tender.unit})</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="offeredQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantité Proposée ({tender.unit})</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="availabilityDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date de Disponibilité</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                                <Input type="date" {...field} className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message (Facultatif)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Précisez la variété, le calibre, ou toute autre information utile..."
                                                className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none resize-none p-4"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

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
                                            Envoi...
                                        </>
                                    ) : (
                                        "Envoyer l'Offre"
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
