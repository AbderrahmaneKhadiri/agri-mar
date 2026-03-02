"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    MapPin,
    PackageOpen,
    Loader2,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Tractor,
    ShoppingCart,
    Info,
    X,
    BadgeDollarSign,
    Box,
    Layers,
    Scale,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
    onContactSeller: (product: any) => void;
    isContacting?: boolean;
}

export function ProductDetailModal({
    isOpen,
    onOpenChange,
    product,
    onContactSeller,
    isContacting = false
}: ProductDetailModalProps) {
    const router = useRouter();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Reset index when product changes
    useEffect(() => {
        setSelectedImageIndex(0);
    }, [product?.id]);

    if (!product) return null;

    const images = product.images || [];
    const mainImage = images[selectedImageIndex] || null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Image Gallery Top */}
                    <div className="bg-slate-50 flex flex-col items-center justify-center relative shrink-0 aspect-video">
                        {mainImage ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-opacity duration-300"
                                />
                                {images.length > 1 && (
                                    <>
                                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="size-10 rounded-full shadow-lg pointer-events-auto bg-white/80 backdrop-blur-sm border-none hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                                }}
                                            >
                                                <ChevronLeft className="size-6 text-slate-900" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="size-10 rounded-full shadow-lg pointer-events-auto bg-white/80 backdrop-blur-sm border-none hover:bg-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                                }}
                                            >
                                                <ChevronRight className="size-6 text-slate-900" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-200">
                                <PackageOpen className="size-20 mb-4" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pas d'images</span>
                            </div>
                        )}

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4">
                                {images.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={cn(
                                            "size-14 rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-300 shadow-sm",
                                            selectedImageIndex === idx
                                                ? "border-slate-900 scale-110 shadow-xl opacity-100"
                                                : "border-white/50 opacity-60 hover:opacity-90 grayscale-[0.5] hover:grayscale-0"
                                        )}
                                    >
                                        <Image src={img} alt="" width={56} height={56} className="object-cover h-full w-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content Bottom */}
                    <div className="p-8 md:p-10 flex flex-col overflow-y-auto bg-white">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-slate-900 text-white border-none font-semibold text-[11px] uppercase tracking-[0.15em] px-3 py-1 rounded-md">
                                        <Layers className="size-3.5 mr-1.5" />
                                        {product.category}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">{product.farmer?.region || product.farmer?.city || "Maroc"}</span>
                                    </div>
                                </div>
                                <DialogTitle className="text-[32px] font-bold text-foreground tracking-tight leading-tight">
                                    {product.name}
                                </DialogTitle>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                                        <BadgeDollarSign className="size-3.5" />
                                        Prix Unitaire
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{product.price}</span>
                                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">MAD / {product.unit}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1 text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                                        <Box className="size-3.5" />
                                        Stock Dispo.
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-foreground">
                                        <span className="text-2xl font-bold tabular-nums tracking-tight">{product.stockQuantity}</span>
                                        <span className="text-[11px] font-medium uppercase tracking-tight text-muted-foreground">{product.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-muted/50 border border-border space-y-2.5">
                                <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">
                                    <Info className="size-3.5" />
                                    Description & Culture
                                </div>
                                <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
                                    {product.description || "Aucune description détaillée n'a été fournie pour ce produit."}
                                </p>
                            </div>

                            {/* Seller Info */}
                            <div className="p-4 rounded-xl border border-dashed border-border flex items-center gap-4 hover:bg-muted/30 transition-colors">
                                <div className="relative">
                                    <Avatar className="size-10 rounded-lg shrink-0 border border-border">
                                        <AvatarImage src={product.farmer?.avatarUrl || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-muted font-bold text-muted-foreground text-xs uppercase">
                                            {product.farmer?.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {product.farmer?.iceNumber && (
                                        <div className="absolute -right-1 -bottom-1 size-4 bg-foreground rounded-full border border-background flex items-center justify-center shadow-sm">
                                            <ShieldCheck className="size-2.5 text-background" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-0.5">Producteur Certifié</p>
                                    <h4 className="text-[14px] font-bold text-foreground truncate tracking-tight">{product.farmer?.fullName}</h4>
                                </div>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        if (product.farmer?.id) {
                                            router.push(`/dashboard/company/market?farmerId=${product.farmer.id}`);
                                            onOpenChange(false);
                                        }
                                    }}
                                >
                                    Consulter Profil
                                </Button>
                            </div>
                        </div>

                        <div className="pt-8 space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                                <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                                    <Scale className="size-3.5" />
                                    Vente Minimale
                                </div>
                                <Badge variant="outline" className="bg-background text-foreground border-border font-bold text-[12px] tracking-tight px-3 py-0.5 shadow-sm">
                                    {product.minOrderQuantity} {product.unit}
                                </Badge>
                            </div>
                            <Button
                                onClick={() => onContactSeller(product)}
                                disabled={isContacting}
                                className="w-full h-14 text-[13px] font-bold uppercase tracking-[0.2em] rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
                            >
                                {isContacting ? <Loader2 className="size-5 animate-spin" /> : (
                                    <>
                                        <MessageSquare className="size-4.5" />
                                        Établir Devis & Négocier
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
