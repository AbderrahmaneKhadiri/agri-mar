"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Package, Tag, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductInquiryCardProps {
    metadata: {
        productId: string;
        name: string;
        price: string;
        unit: string;
        stock: string;
        minOrder: string;
        category: string;
        image: string | null;
    };
    isMe: boolean;
}

export function ProductInquiryCard({ metadata, isMe }: ProductInquiryCardProps) {
    return (
        <Card className={cn(
            "w-full max-w-[340px] rounded-2xl border-none shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01]",
            isMe ? "bg-slate-900 text-white" : "bg-white border border-slate-100 text-slate-900"
        )}>
            {/* Header / Category */}
            <div className={cn(
                "px-4 py-2 flex items-center justify-between",
                isMe ? "bg-white/5 border-b border-white/5" : "bg-slate-50 border-b border-slate-100"
            )}>
                <div className="flex items-center gap-2">
                    <Tag className={cn("size-3", isMe ? "text-emerald-400" : "text-emerald-600")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-[1.5px]", isMe ? "text-slate-400" : "text-slate-500")}>
                        {metadata.category}
                    </span>
                </div>
                <Badge variant="outline" className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-none",
                    isMe ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-700"
                )}>
                    Demande Catalogue
                </Badge>
            </div>

            <CardContent className="p-0">
                <div className="flex p-4 gap-4">
                    {/* Image Placeholder or Actual Image */}
                    <div className={cn(
                        "size-24 rounded-xl overflow-hidden relative shrink-0 border",
                        isMe ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"
                    )}>
                        {metadata.image ? (
                            <Image
                                src={metadata.image}
                                alt={metadata.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className={cn("size-8 opacity-20", isMe ? "text-white" : "text-slate-400")} />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className={cn("text-[16px] font-black leading-tight mb-2 truncate", isMe ? "text-white" : "text-slate-950")}>
                            {metadata.name}
                        </h4>

                        <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn("text-xl font-black tracking-tight", isMe ? "text-emerald-400" : "text-emerald-600")}>
                                    {metadata.price}
                                </span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", isMe ? "text-slate-500" : "text-slate-400")}>
                                    MAD/{metadata.unit}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Layers className={cn("size-3", isMe ? "text-slate-500" : "text-slate-400")} />
                                    <span className={cn("text-[10px] font-bold", isMe ? "text-slate-300" : "text-slate-600")}>
                                        Stock: {metadata.stock}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Package className={cn("size-3", isMe ? "text-slate-500" : "text-slate-400")} />
                                    <span className={cn("text-[10px] font-bold", isMe ? "text-slate-300" : "text-slate-600")}>
                                        Min: {metadata.minOrder}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className={cn("p-3 border-t", isMe ? "border-white/5" : "border-slate-50")}>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "w-full h-9 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                            isMe
                                ? "text-white hover:bg-white/10"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Link href={`/dashboard/company/market`}>
                            Voir les détails du produit <ArrowRight className="ml-2 size-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
