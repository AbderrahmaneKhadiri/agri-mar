"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuoteAction } from "@/actions/quotes.actions";
import { Loader2, FileText, Send } from "lucide-react";

interface QuoteFormProps {
    connectionId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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
        setLoading(true);

        const totalAmount = (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toString();

        const result = await createQuoteAction({
            connectionId,
            ...formData,
            totalAmount,
            currency: "MAD"
        });

        setLoading(false);
        if (result.success) {
            onSuccess();
            onClose();
            setFormData({ productName: "", quantity: "", unitPrice: "", notes: "" });
        } else {
            alert(result.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl bg-white overflow-hidden p-0">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-8 bg-slate-900 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-black tracking-tight uppercase">Nouvelle Proposition</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-400 font-medium">
                            Remplissez les détails de votre offre commerciale pour formaliser votre collaboration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
                        <div className="space-y-2">
                            <Label htmlFor="productName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom du produit</Label>
                            <Input
                                id="productName"
                                placeholder="ex: Tomates Cerises Bio"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                required
                                className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12 font-bold text-slate-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantité</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="ex: 500"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12 font-bold text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unitPrice" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix Unit. (MAD)</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    placeholder="ex: 12.5"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                    required
                                    className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12 font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes additionnelles (Optionnel)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Détails sur la livraison, conditions..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all min-h-[100px] font-medium text-slate-900 resize-none"
                            />
                        </div>

                        {(formData.quantity && formData.unitPrice) && (
                            <div className="p-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Estimé</span>
                                <span className="text-lg font-black tracking-tighter">
                                    {(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString()} MAD
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-8 pt-0 bg-white">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl h-12 font-bold text-slate-500 uppercase tracking-widest text-[10px] hover:bg-slate-50"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] items-center gap-2 group w-full sm:w-auto"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Envoyer la proposition
                                    <Send className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
