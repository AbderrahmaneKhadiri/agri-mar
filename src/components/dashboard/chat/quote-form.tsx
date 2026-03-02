"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createQuoteAction } from "@/actions/quotes.actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteFormProps {
    connectionId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (quote: any) => void;
}

export function QuoteForm({ connectionId, isOpen, onClose, onSuccess }: QuoteFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productName: "",
        quantity: "",
        unitPrice: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        const totalAmount = (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toString();
        const result = await createQuoteAction({
            connectionId,
            ...formData,
            totalAmount,
            currency: "MAD"
        });
        setLoading(false);
        if (result.success && result.data) {
            toast.success("Proposition envoyée avec succès");
            onSuccess(result.data);
            onClose();
            setFormData({ productName: "", quantity: "", unitPrice: "", notes: "" });
        } else {
            toast.error(result.error || "Erreur lors de l'envoi de la proposition");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-border shadow-xl rounded-xl bg-white">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Commerce
                    </DialogDescription>
                    <DialogTitle className="text-[18px] font-semibold text-foreground leading-none">
                        Nouvelle Proposition
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Produit */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Produit ou Service
                        </Label>
                        <Input
                            required
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            placeholder="Ex: Tomates de Chtouka (Calibre G)..."
                            className="h-9 text-[13px]"
                        />
                    </div>

                    {/* Quantité + Prix */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Quantité
                            </Label>
                            <Input
                                type="number"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0.00"
                                className="h-9 text-[13px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Prix Unit. (MAD)
                            </Label>
                            <Input
                                type="number"
                                required
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="0.00"
                                className="h-9 text-[13px]"
                            />
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Observations
                        </Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Conditions de livraison, délais, emballage..."
                            className="min-h-[80px] text-[13px] resize-none"
                        />
                    </div>

                    <Separator />

                    {/* Footer */}
                    <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-[13px] text-muted-foreground"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="text-[13px]">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : "Expédier l'offre"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
