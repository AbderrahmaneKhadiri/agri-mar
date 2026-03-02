"use client";

import { useState, useEffect } from "react";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { createProductAction, updateProductAction } from "@/actions/products.actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

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
        status: "ACTIVE" as any,
        images: [] as string[],
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
                status: product.status,
                images: product.images || [],
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
                status: "ACTIVE",
                images: [],
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
            images: formData.images,
        };

        const result = product
            ? await updateProductAction(product.id, payload)
            : await createProductAction(payload);

        setIsLoading(false);

        if (result.success) {
            toast.success(product ? "Produit mis à jour" : "Produit ajouté au catalogue");
            onSuccess();
        } else {
            toast.error(result.error || "Une erreur est survenue");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-border shadow-xl rounded-xl bg-white">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Catalogue
                    </DialogDescription>
                    <DialogTitle className="text-[18px] font-semibold text-foreground leading-none">
                        {product ? "Modifier le Produit" : "Nouveau Produit"}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Nom */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Nom de l&apos;offre
                        </Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                            placeholder="Ex: Tomates Cerises Bio"
                            className="h-9 text-[13px]"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Description
                        </Label>
                        <Textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                            placeholder="Détails, qualité, mode de culture..."
                            className="min-h-[80px] text-[13px] resize-none"
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Photos du produit
                        </Label>
                        <ImageUpload
                            value={formData.images}
                            onChange={(urls) => setFormData(f => ({ ...f, images: urls }))}
                            onRemove={(urlToRemove) => setFormData(f => ({
                                ...f,
                                images: f.images.filter(url => url !== urlToRemove)
                            }))}
                            maxFiles={4}
                        />
                    </div>

                    {/* Category + Prix */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Catégorie
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}
                            >
                                <SelectTrigger className="h-9 text-[13px]">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Legumes">Légumes</SelectItem>
                                    <SelectItem value="Fruits">Fruits</SelectItem>
                                    <SelectItem value="Cereales">Céréales</SelectItem>
                                    <SelectItem value="Autres">Autres</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Prix (MAD)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                                placeholder="0.00"
                                className="h-9 text-[13px]"
                            />
                        </div>
                    </div>

                    {/* Unité + Stock */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Unité
                            </Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(v) => setFormData(f => ({ ...f, unit: v as any }))}
                            >
                                <SelectTrigger className="h-9 text-[13px]">
                                    <SelectValue placeholder="Unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KG">Kilogramme (kg)</SelectItem>
                                    <SelectItem value="TONNE">Tonne (t)</SelectItem>
                                    <SelectItem value="LITRE">Litre (L)</SelectItem>
                                    <SelectItem value="UNITE">Unité (u)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Stock disponible
                            </Label>
                            <Input
                                type="number"
                                required
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData(f => ({ ...f, stockQuantity: e.target.value }))}
                                placeholder="0"
                                className="h-9 text-[13px]"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Footer */}
                    <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-[13px] text-muted-foreground">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading} className="text-[13px]">
                            {isLoading
                                ? <Loader2 className="size-4 animate-spin" />
                                : product ? "Mettre à jour" : "Publier au catalogue"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
