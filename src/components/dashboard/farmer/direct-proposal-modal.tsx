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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createQuoteAction } from "@/actions/quotes.actions";
import { toast } from "sonner";
import { Loader2, ArrowRight, UserPlus, Package } from "lucide-react";

const proposalSchema = z.object({
    connectionId: z.string().min(1, "Le partenaire est requis"),
    productName: z.string().min(1, "Le produit est requis"),
    quantity: z.string().min(1, "La quantité est requise"),
    unitPrice: z.string().min(1, "Le prix est requis"),
    notes: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface DirectProposalModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    partners: any[];
    products: any[];
}

export function DirectProposalModal({ isOpen, onOpenChange, partners, products }: DirectProposalModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            connectionId: "",
            productName: "",
            quantity: "",
            unitPrice: "",
            notes: "",
        },
    });

    const onSubmit = async (values: ProposalFormValues) => {
        setIsSubmitting(true);
        try {
            const totalAmount = (Number(values.quantity) * Number(values.unitPrice)).toString();
            const result = await createQuoteAction({
                ...values,
                totalAmount,
            });

            if (result.success) {
                toast.success("Votre proposition a été envoyée !");
                form.reset();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la proposition");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProductChange = (val: string) => {
        const product = products.find(p => p.name === val);
        if (product) {
            form.setValue("unitPrice", product.price.toString());
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-900 text-white">
                                <Package className="size-5" />
                            </div>
                            Nouvelle Proposition
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Envoyez une offre commerciale directe à l'un de vos partenaires enregistrés.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="connectionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <UserPlus className="size-3" /> Partenaire Destinataire
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-1 focus:ring-slate-900 transition-all">
                                                    <SelectValue placeholder="Choisir un partenaire..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                {partners.map((p) => (
                                                    <SelectItem key={p.id} value={p.id} className="rounded-lg">
                                                        <span className="font-bold">{p.name}</span>
                                                        <span className="ml-2 text-[10px] text-slate-400 uppercase tracking-tighter">({p.industry || "Entreprise"})</span>
                                                    </SelectItem>
                                                ))}
                                                {partners.length === 0 && (
                                                    <div className="p-4 text-center text-[12px] text-slate-400 italic">
                                                        Aucun partenaire trouvé. Connectez-vous d'abord à d'autres entreprises.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="productName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produit du Catalogue</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    handleProductChange(val);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-1 focus:ring-slate-900 transition-all">
                                                        <SelectValue placeholder="Produit..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    {products.map((p) => (
                                                        <SelectItem key={p.id} value={p.name} className="rounded-lg">
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="AUTRE" className="rounded-lg italic text-slate-400">Autre...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prix Unitaire (MAD)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantité Proposée</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="Entrez la quantité..." {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message ou Précisions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez les conditions, la qualité ou la logistique..."
                                                className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-none resize-none p-4 text-sm"
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
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] border-slate-100 text-slate-500 hover:bg-slate-50"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 shadow-xl shadow-slate-200 group"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            Envoyer la Proposition
                                            <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
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
