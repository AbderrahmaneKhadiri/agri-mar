"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getHistoricalNDVIAction } from "@/actions/agromonitoring.actions";
import { NdviChart } from "@/components/dashboard/ndvi-chart";
import {
    MapPin,
    PackageOpen,
    Loader2,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Tractor,
    Info,
    BadgeDollarSign,
    Box,
    Scale,
    ShieldCheck,
    Layers,
    Activity,
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
    const [ndviData, setNdviData] = useState<any[]>([]);
    const [isLoadingNdvi, setIsLoadingNdvi] = useState(false);

    useEffect(() => {
        setSelectedImageIndex(0);
        setNdviData([]);

        const fetchNdvi = async () => {
            const polygonId = product?.farmer?.parcels?.[0]?.polygonId;
            if (isOpen && polygonId && polygonId !== "WAITING_API_SYNC") {
                setIsLoadingNdvi(true);
                const { data } = await getHistoricalNDVIAction(polygonId);
                setNdviData(data);
                setIsLoadingNdvi(false);
            }
        };

        if (isOpen) fetchNdvi();
    }, [product?.id, isOpen]);

    if (!product) return null;

    const images = product.images || [];
    const mainImage = images[selectedImageIndex] || null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border border-[#d4e9dc] shadow-2xl rounded-2xl">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Image Gallery — green tinted when no image */}
                    <div className="bg-[#f0f8f4] flex flex-col items-center justify-center relative shrink-0 aspect-video overflow-hidden">
                        {mainImage ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-opacity duration-300"
                                />
                                {images.length > 1 && (
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="size-10 rounded-full shadow-lg pointer-events-auto bg-white/90 border-none hover:bg-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                            }}
                                        >
                                            <ChevronLeft className="size-5 text-[#2c5f42]" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="size-10 rounded-full shadow-lg pointer-events-auto bg-white/90 border-none hover:bg-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                            }}
                                        >
                                            <ChevronRight className="size-5 text-[#2c5f42]" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-[#4a8c5c]/30">
                                <PackageOpen className="size-16 mb-3" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4a8c5c]/40">Pas d&apos;image</span>
                            </div>
                        )}

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                                {images.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={cn(
                                            "size-12 rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-300 shadow-sm",
                                            selectedImageIndex === idx
                                                ? "border-[#2c5f42] scale-110 shadow-lg opacity-100"
                                                : "border-white/70 opacity-60 hover:opacity-90"
                                        )}
                                    >
                                        <Image src={img} alt="" width={48} height={48} className="object-cover h-full w-full" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Green accent bar at bottom of image */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4e9dc] to-[#a8d5be]" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col overflow-y-auto bg-[#f8fdf9] gap-5">
                        {/* Header */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-[#2c5f42] text-white border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">
                                    <Layers className="size-3 mr-1.5" />
                                    {product.category}
                                </Badge>
                                {(product.farmer?.region || product.farmer?.city) && (
                                    <div className="flex items-center gap-1.5 text-[#4a8c5c]/60">
                                        <MapPin className="size-3" />
                                        <span className="text-[10px] font-semibold uppercase tracking-widest">{product.farmer?.region || product.farmer?.city}</span>
                                    </div>
                                )}
                            </div>
                            <DialogTitle className="text-2xl font-black text-[#2c5f42] tracking-tight leading-tight">
                                {product.name}
                            </DialogTitle>
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-white border border-[#d4e9dc] space-y-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">
                                    <BadgeDollarSign className="size-3" />
                                    Prix Unitaire
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-[#2c5f42] tabular-nums">{product.price}</span>
                                    <span className="text-[10px] font-bold text-[#4a8c5c]/70 uppercase">MAD / {product.unit}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-[#d4e9dc] space-y-1 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">
                                    <Box className="size-3" />
                                    Stock Dispo.
                                </div>
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className="text-2xl font-black text-slate-800 tabular-nums">{product.stockQuantity}</span>
                                    <span className="text-[10px] font-bold text-[#4a8c5c]/70 uppercase">{product.unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-4 rounded-2xl bg-white border border-[#d4e9dc] space-y-2">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">
                                <Info className="size-3" />
                                Description & Culture
                            </div>
                            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                                {product.description || "Aucune description fournie pour ce produit."}
                            </p>
                        </div>

                        {/* Seller */}
                        <div className="p-4 rounded-2xl bg-white border border-[#d4e9dc] flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="size-11 rounded-xl border border-[#d4e9dc]">
                                    <AvatarImage src={product.farmer?.avatarUrl || undefined} className="object-cover" />
                                    <AvatarFallback className="bg-[#f0f8f4] text-[#4a8c5c] font-black text-sm uppercase">
                                        {product.farmer?.fullName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {product.farmer?.iceNumber && (
                                    <div className="absolute -right-1 -bottom-1 size-4 bg-[#2c5f42] rounded-full border border-white flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="size-2.5 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest mb-0.5">Producteur Certifié</p>
                                <h4 className="text-[14px] font-bold text-slate-900 truncate">{product.farmer?.fullName || "--"}</h4>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 rounded-xl bg-[#f0f8f4] hover:bg-[#2c5f42] hover:text-white text-[#2c5f42] font-bold text-[9px] uppercase tracking-widest transition-all"
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

                        {/* NDVI */}
                        {product.farmer?.parcels?.[0]?.polygonId && product.farmer?.parcels?.[0]?.polygonId !== "WAITING_API_SYNC" && (
                            <div className="p-4 rounded-2xl bg-white border border-[#d4e9dc] space-y-3">
                                <div className="flex items-center gap-2 text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">
                                    <Activity className="size-3 animate-pulse" />
                                    Intelligence Satellite
                                </div>
                                <div className="rounded-xl overflow-hidden border border-[#d4e9dc]">
                                    {isLoadingNdvi ? (
                                        <div className="h-40 flex items-center justify-center gap-2">
                                            <Loader2 className="size-5 text-[#2c5f42] animate-spin" />
                                            <span className="text-[12px] font-medium text-[#4a8c5c]">Scan satellite en cours...</span>
                                        </div>
                                    ) : (
                                        <NdviChart data={ndviData} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Min Order + CTA */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#d4e9dc]">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#4a8c5c] uppercase tracking-widest">
                                    <Scale className="size-3" />
                                    Vente Minimale
                                </div>
                                <Badge className="bg-[#f0f8f4] text-[#2c5f42] border border-[#d4e9dc] font-black text-[11px] px-3 py-1">
                                    {product.minOrderQuantity} {product.unit}
                                </Badge>
                            </div>
                            <Button
                                onClick={() => onContactSeller(product)}
                                disabled={isContacting}
                                className="w-full h-12 text-[11px] font-black uppercase tracking-widest rounded-xl bg-[#2c5f42] text-white hover:bg-[#1a3d2a] transition-all shadow-lg shadow-[#2c5f42]/20 flex items-center justify-center gap-3"
                            >
                                {isContacting ? <Loader2 className="size-4 animate-spin" /> : (
                                    <>
                                        <MessageSquare className="size-4" />
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
