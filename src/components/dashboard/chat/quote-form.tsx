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
import { Loader2, FileText, Send, ChevronDown, Package, Banknote, HelpCircle } from "lucide-react";

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
            onSuccess(result.data);
            onClose();
            setFormData({ productName: "", quantity: "", unitPrice: "", notes: "" });
        } else {
            alert(result.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[440px] rounded-2xl border border-slate-200 shadow-2xl bg-white p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="bg-slate-900 p-6 text-white flex flex-col justify-end min-h-[100px] rounded-t-2xl">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1 leading-none">Commerce</h3>
                            <h2 className="text-xl font-bold tracking-tight leading-none text-white">Nouvelle Proposition</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Produit ou Service</Label>
                            <div className="relative">
                                <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    placeholder="Ex: Tomates de Chtouka (Calibre G)..."
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    required
                                    className="h-11 bg-white border-slate-200 rounded-xl pl-10 pr-4 text-[13px] font-medium text-slate-700 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:border-slate-300 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quantité</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-100/80 rounded-xl px-4 text-[13px] font-medium text-slate-700 focus-visible:ring-1 focus-visible:ring-slate-200 transition-all placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prix Unit. (MAD)</Label>
                                <div className="relative">
                                    <Banknote className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                        required
                                        className="h-11 bg-slate-50/50 border-slate-100/80 rounded-xl pl-4 pr-10 text-[13px] font-medium text-slate-700 focus-visible:ring-1 focus-visible:ring-slate-200 transition-all placeholder:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Observations</Label>
                            <Textarea
                                placeholder="Conditions de livraison, délais, emballage..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="min-h-[90px] bg-white border-slate-100 rounded-xl p-4 text-[13px] font-medium text-slate-700 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-200 transition-all resize-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-2 flex items-center justify-between">
                        <div className="flex-1 text-center sm:text-left">
                            <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-transparent -ml-4">
                                Annuler
                            </Button>
                        </div>
                        <Button type="submit" disabled={loading} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : "Expédier l'offre"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
