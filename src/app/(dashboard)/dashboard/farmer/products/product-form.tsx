"use client";

import { useState, useEffect } from "react";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { createProductAction, updateProductAction } from "@/actions/products.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

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
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-none bg-white shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                        {product ? "MODIFIER LE PRODUIT" : "NOUVEAU PRODUIT"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Nom du produit</label>
                        <Input
                            required value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                            className="bg-slate-50 border-slate-100 rounded-xl h-12"
                            placeholder="Ex: Tomates Cerises Bio"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Description</label>
                        <Textarea
                            required value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                            className="bg-slate-50 border-slate-100 rounded-xl min-h-[100px]"
                            placeholder="Détails, qualité, mode de culture..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Catégorie</label>
                            <select
                                className="w-full bg-slate-50 border-slate-100 rounded-xl h-12 px-3 text-sm focus:ring-green-500/20 outline-none"
                                value={formData.category} onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                            >
                                <option value="Legumes">Légumes</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Cereales">Céréales</option>
                                <option value="Autres">Autres</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Statut</label>
                            <select
                                className="w-full bg-slate-50 border-slate-100 rounded-xl h-12 px-3 text-sm focus:ring-green-500/20 outline-none"
                                value={formData.status} onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as any }))}
                            >
                                <option value="ACTIVE">Actif</option>
                                <option value="SOLD_OUT">Epuisé</option>
                                <option value="DRAFT">Brouillon</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Prix (MAD)</label>
                            <Input
                                type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                                className="bg-slate-50 border-slate-100 rounded-xl h-12"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Unité</label>
                            <select
                                className="w-full bg-slate-50 border-slate-100 rounded-xl h-12 px-3 text-sm focus:ring-green-500/20 outline-none"
                                value={formData.unit} onChange={(e) => setFormData(f => ({ ...f, unit: e.target.value as any }))}
                            >
                                <option value="KG">Kilogramme</option>
                                <option value="TONNE">Tonne</option>
                                <option value="LITRE">Litre</option>
                                <option value="UNITE">Unité</option>
                                <option value="BOITE">Boîte</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Qté Min. Commande</label>
                            <Input
                                type="number" required value={formData.minOrderQuantity} onChange={(e) => setFormData(f => ({ ...f, minOrderQuantity: e.target.value }))}
                                className="bg-slate-50 border-slate-100 rounded-xl h-12"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Stock / Dispo</label>
                            <Input
                                type="number" required value={formData.stockQuantity} onChange={(e) => setFormData(f => ({ ...f, stockQuantity: e.target.value }))}
                                className="bg-slate-50 border-slate-100 rounded-xl h-12"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-black h-12 rounded-xl text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-green-900/10"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (product ? 'Enregistrer les modifications' : 'Publier le produit')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
