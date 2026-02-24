"use client";

import { useState, useEffect } from "react";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { createProductAction, updateProductAction } from "@/actions/products.actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: ProductSelectDTO | null;
}

export function ProductForm({ isOpen, onClose, onSuccess, product }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        unit: "KG",
        minOrderQuantity: "1",
        stockQuantity: "",
        category: "Legumes",
        status: "ACTIVE" as any
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                unit: product.unit,
                minOrderQuantity: product.minOrderQuantity.toString(),
                stockQuantity: product.stockQuantity.toString(),
                category: product.category,
                status: product.status
            });
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                unit: "KG",
                minOrderQuantity: "1",
                stockQuantity: "",
                category: "Legumes",
                status: "ACTIVE"
            });
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            unit: formData.unit as any,
            minOrderQuantity: formData.minOrderQuantity,
            stockQuantity: formData.stockQuantity,
            category: formData.category,
            status: formData.status as any,
            images: []
        };

        const result = product
            ? await updateProductAction(product.id, payload)
            : await createProductAction(payload);

        setIsLoading(false);

        if (result.success) {
            onSuccess();
        } else {
            alert(result.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="bg-slate-900 p-6 text-white flex flex-col justify-end min-h-[100px] rounded-t-2xl">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1 leading-none">Catalogue</h3>
                        <h2 className="text-xl font-bold tracking-tight leading-none text-white">
                            {product ? "Modifier le Produit" : "Nouveau Produit"}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nom de l&apos;Offre</Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                            className="bg-white border-slate-200 rounded-xl h-11 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 text-[13px] font-medium text-slate-700"
                            placeholder="Ex: Tomates Cerises Bio"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Description Catalogue</Label>
                        <Textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                            className="bg-white border-slate-200 rounded-xl min-h-[90px] shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 text-[13px] font-medium text-slate-700 resize-none"
                            placeholder="Détails, qualité, mode de culture..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col pt-[18px]">
                            <Select
                                value={formData.category}
                                onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}
                            >
                                <SelectTrigger className="bg-white border-slate-200 rounded-xl h-11 shadow-sm focus:ring-1 focus:ring-slate-300 text-[13px] font-medium text-slate-700">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    <SelectItem value="Legumes">Légumes</SelectItem>
                                    <SelectItem value="Fruits">Fruits</SelectItem>
                                    <SelectItem value="Cereales">Céréales</SelectItem>
                                    <SelectItem value="Autres">Autres</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Prix (MAD)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                                className="bg-white border-slate-200 rounded-xl h-11 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 text-[13px] font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Unité</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(v) => setFormData(f => ({ ...f, unit: v as any }))}
                            >
                                <SelectTrigger className="bg-white border-slate-200 rounded-xl h-11 shadow-sm focus:ring-1 focus:ring-slate-300 text-[13px] font-medium text-slate-700">
                                    <SelectValue placeholder="Unité" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    <SelectItem value="KG">Kilogramme (kg)</SelectItem>
                                    <SelectItem value="TONNE">Tonne (t)</SelectItem>
                                    <SelectItem value="LITRE">Litre (L)</SelectItem>
                                    <SelectItem value="UNITE">Unité (u)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Stock Disponible</Label>
                            <Input
                                type="number"
                                required
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData(f => ({ ...f, stockQuantity: e.target.value }))}
                                className="bg-white border-slate-200 rounded-xl h-11 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300 text-[13px] font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-11 px-6 text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-transparent -ml-4"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold"
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : (product ? 'Mettre à jour' : 'Publier au catalogue')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
