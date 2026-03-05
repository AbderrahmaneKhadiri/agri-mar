"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { createProductAction } from "@/actions/products.actions";
import { toast } from "sonner";
import { Loader2, Store, ImagePlus, X, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

const productSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    description: z.string().min(5, "La description est requise"),
    price: z.string().min(1, "Le prix est requis"),
    unit: z.enum(["KG", "TONNE", "UNITE", "LITRE"]),
    stockQuantity: z.string().min(1, "La quantité est requise"),
    category: z.string().min(1, "La catégorie est requise"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddProductModal({ isOpen, onOpenChange }: AddProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Support for 3 images
    const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
    const [files, setFiles] = useState<(File | null)[]>([null, null, null]);

    const fileInputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const router = useRouter();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            unit: "KG",
            stockQuantity: "",
            category: "Légumes",
        },
    });

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

    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];

            // Upload all selected files
            for (const file of files) {
                if (file) {
                    try {
                        const url = await uploadToCloudinary(file);
                        uploadedUrls.push(url);
                    } catch (err) {
                        console.error("Upload error for a file:", err);
                    }
                }
            }

            const result = await createProductAction({
                ...values,
                status: "ACTIVE",
                images: uploadedUrls,
                minOrderQuantity: "1",
            });

            if (result.success) {
                toast.success("Produit ajouté avec succès !");
                resetAndClose();
                router.refresh();
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout du produit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        form.reset();
        setPreviews([null, null, null]);
        setFiles([null, null, null]);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="max-w-xl border-none shadow-2xl rounded-3xl p-0 bg-white overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#d4e9dc] to-[#a8d5be]" />

                <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#2c5f42] flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]">
                                <Store className="size-5 text-[#2c5f42]" />
                            </div>
                            Ajouter un Produit
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-[#4a8c5c]/70">
                            Publiez une nouvelle offre. Vous pouvez ajouter jusqu&apos;à 3 photos.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Multi-Image Upload Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {previews.map((preview, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "relative aspect-square rounded-2xl border-2 border-dashed border-[#d4e9dc] bg-[#f0f8f4] overflow-hidden cursor-pointer group flex items-center justify-center transition-all",
                                    idx === 0 ? "col-span-1" : "col-span-1"
                                )}
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
                                        <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Nom du Produit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Tomate Cerise..." {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none font-bold" />
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
                                            <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Catégorie</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] font-bold">
                                                        <SelectValue placeholder="Catégorie..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-[#d4e9dc]">
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
                                            <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Unité</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] font-bold">
                                                        <SelectValue placeholder="Unité..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-[#d4e9dc]">
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
                                            <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Prix (MAD)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none font-bold" />
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
                                            <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Stock initial</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="Quantité..." {...field} className="h-11 rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none font-bold" />
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
                                        <FormLabel className="text-[10px] font-black text-[#4a8c5c] uppercase tracking-widest">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Détails sur la qualité, variété..."
                                                className="min-h-[80px] rounded-xl bg-[#f8fdf9] border-[#d4e9dc] focus:bg-white transition-all shadow-none resize-none p-3 text-sm font-medium"
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
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] border-[#d4e9dc] text-[#4a8c5c] hover:bg-[#f8fdf9]"
                                    onClick={resetAndClose}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] bg-[#2c5f42] text-white hover:bg-[#1a3d2a] shadow-lg shadow-[#2c5f42]/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publication...</>
                                    ) : (
                                        "Ajouter au Catalogue"
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
