"use client";

import { useState } from "react";
import { createCounterOfferAction } from "@/actions/quotes.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Banknote, Package } from "lucide-react";
import { toast } from "sonner";

interface CounterOfferModalProps {
    quote: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CounterOfferModal({ quote, open, onOpenChange }: CounterOfferModalProps) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(quote.quantity);
    const [unitPrice, setUnitPrice] = useState(quote.unitPrice);
    const [notes, setNotes] = useState("");

    const totalAmount = (parseFloat(quantity) * parseFloat(unitPrice)).toString();

    const handleSubmit = async () => {
        if (!quantity || !unitPrice) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        const result = await createCounterOfferAction({
            parentQuoteId: quote.id,
            quantity,
            unitPrice,
            totalAmount,
            notes
        });
        setLoading(false);

        if (result.success) {
            toast.success("Contre-offre envoyée !");
            onOpenChange(false);
        } else {
            toast.error(result.error || "Erreur lors de l'envoi");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Faire une contre-offre</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Proposez de nouveaux termes pour cette offre commerciale.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="product" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Produit
                        </Label>
                        <Input
                            id="product"
                            value={quote.productName}
                            disabled
                            className="h-11 bg-muted/50 border-border rounded-xl px-4 text-[13px] font-semibold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                <Package className="size-3 inline mr-1" /> Quantité
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="h-11 bg-white border-border rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                <Banknote className="size-3 inline mr-1" /> Prix Unitaire (MAD)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="h-11 bg-white border-border rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                                Nouveau Total Estimé
                            </p>
                            <p className="text-xl font-bold tracking-tight text-white leading-none">
                                {parseFloat(totalAmount || "0").toLocaleString()}
                                <span className="text-[11px] font-medium text-slate-400 ml-1.5">MAD</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Notes / Justification (Optionnel)
                        </Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Frais logistiques inclus..."
                            className="h-11 bg-white border-border rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-11 px-6 text-[13px] font-bold"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl h-11 px-8 text-[13px] font-bold bg-slate-900"
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : "Envoyer la contre-offre"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
