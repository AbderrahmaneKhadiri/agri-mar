"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
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
import { updateProductAction } from "@/actions/products.actions";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { toast } from "sonner";
import { Loader2, ImagePlus, X, Pencil, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

const editProductSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    description: z.string().min(5, "La description est trop courte"),
    price: z.string().min(1, "Le prix est requis"),
    unit: z.enum(["KG", "TONNE", "UNITE", "LITRE"]),
    stockQuantity: z.string().min(1, "La quantité est requise"),
    category: z.string().min(1, "La catégorie est requise"),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductSelectDTO | null;
    onSuccess?: (updated: ProductSelectDTO) => void;
}

export function EditProductModal({ isOpen, onOpenChange, product, onSuccess }: EditProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Support for 3 images: can be a URL string (existing) or a File (newly selected)
    const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
    const [files, setFiles] = useState<(File | null)[]>([null, null, null]);

    const fileInputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const router = useRouter();

    const form = useForm<EditProductFormValues>({
        resolver: zodResolver(editProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            unit: "KG",
            stockQuantity: "",
            category: "Légumes",
        },
    });

    // Pre-fill form when product changes
    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                unit: product.unit as "KG" | "TONNE" | "UNITE" | "LITRE",
                stockQuantity: product.stockQuantity.toString(),
                category: product.category || "Légumes",
            });

            // Initialize previews from existing product images
            const existingImages = product.images || [];
            const initialPreviews = [null, null, null].map((_, i) => existingImages[i] || null);
            setPreviews(initialPreviews);
            setFiles([null, null, null]); // No new files yet
        }
    }, [product, form]);

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const newFiles = [...files];
        newFiles[index] = file;
        setFiles(newFiles);

        const reader = new FileReader();
        reader.onload = (event) => {
            const newPreviews = [...previews];
            newPreviews[index] = event.target?.result as string;
            setPreviews(newPreviews);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPreviews = [...previews];
        newPreviews[index] = null;
        setPreviews(newPreviews);

        const newFiles = [...files];
        newFiles[index] = null;
        setFiles(newFiles);

        if (fileInputRefs[index].current) {
            fileInputRefs[index].current!.value = "";
        }
    };

    const onSubmit = async (values: EditProductFormValues) => {
        if (!product) return;
        setIsSubmitting(true);
        try {
            const finalImages: string[] = [];

            // Process each slot
            for (let i = 0; i < 3; i++) {
                const file = files[i];
                const preview = previews[i];

                if (file) {
                    // New file selected, upload it
                    try {
                        const url = await uploadToCloudinary(file);
                        finalImages.push(url);
                    } catch (err) {
                        console.error("Upload error:", err);
                    }
                } else if (preview && preview.startsWith("http")) {
                    // Existing image maintained
                    finalImages.push(preview);
                }
                // If null, it was removed
            }

            const result = await updateProductAction(product.id, {
                ...values,
                images: finalImages,
            });

            if (result.success) {
                toast.success("Produit mis à jour avec succès !");
                router.refresh();
                onOpenChange(false);
                if (result.data && onSuccess) onSuccess(result.data as ProductSelectDTO);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-none shadow-2xl rounded-3xl p-0 bg-white overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#d4e9dc] to-[#a8d5be]" />

                <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#2c5f42] flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]">
                                <Pencil className="size-4 text-[#2c5f42]" />
                            </div>
                            Modifier le Produit
                        </DialogTitle>
                    </DialogHeader>

                    {/* Multi-Image Upload Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {previews.map((preview, idx) => (
                            <div
                                key={idx}
                                className="relative aspect-square rounded-2xl border-2 border-dashed border-[#d4e9dc] bg-[#f0f8f4] overflow-hidden cursor-pointer group flex items-center justify-center transition-all"
                                onClick={() => fileInputRefs[idx].current?.click()}
                            >
                                {preview ? (
                                    <>
                                        <Image src={preview} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="size-7 rounded-full"
                                                onClick={(e) => removeImage(idx, e)}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-[#4a8c5c]/40 group-hover:text-[#2c5f42] transition-colors p-2 text-center">
                                        <Camera className="size-6 mb-1" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{idx === 0 ? "Principale" : `Photo ${idx + 1}`}</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRefs[idx]}
                                    onChange={(e) => handleImageChange(idx, e)}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        ))}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Nom du Produit</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white focus:border-[#4a8c5c] transition-all shadow-none font-bold" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Catégorie</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Légumes">Légumes</SelectItem>
                                                    <SelectItem value="Fruits">Fruits</SelectItem>
                                                    <SelectItem value="Céréales">Céréales</SelectItem>
                                                    <SelectItem value="Élevage">Élevage</SelectItem>
                                                    <SelectItem value="Autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Unité</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="KG">Kilogramme (Kg)</SelectItem>
                                                    <SelectItem value="TONNE">Tonne (t)</SelectItem>
                                                    <SelectItem value="UNITE">Unité (u)</SelectItem>
                                                    <SelectItem value="LITRE">Litre (L)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Prix (MAD)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none font-bold" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stockQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Stock Disponible</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none font-bold" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="min-h-[70px] rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none resize-none font-medium"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] border-[#d4e9dc] text-[#4a8c5c] hover:bg-[#f0f8f4]"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] bg-[#2c5f42] text-white hover:bg-[#1a3d2a] shadow-lg shadow-[#2c5f42]/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                                    ) : "Enregistrer les modifications"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
