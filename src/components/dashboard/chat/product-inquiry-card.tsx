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
            "w-full max-w-[340px] rounded-xl border shadow-sm overflow-hidden",
            isMe ? "bg-muted/30 border-border text-foreground" : "bg-card border-border text-foreground"
        )}>
            {/* Header / Category */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between border-b",
                isMe ? "bg-muted/50 border-border/50" : "bg-slate-50/50 border-border"
            )}>
                <div className="flex items-center gap-2">
                    <Tag className="size-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {metadata.category}
                    </span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border-border/50">
                    Intérêt Produit
                </Badge>
            </div>

            <CardContent className="p-0">
                <div className="flex p-4 gap-4">
                    {/* Image Placeholder or Actual Image */}
                    <div className="size-20 rounded-lg overflow-hidden relative shrink-0 border border-border/50 bg-muted/50">
                        {metadata.image ? (
                            <Image
                                src={metadata.image}
                                alt={metadata.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="size-6 text-muted-foreground/30" />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-[14px] font-semibold leading-tight mb-2 truncate text-foreground">
                            {metadata.name}
                        </h4>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-semibold tracking-tight text-emerald-600">
                                    {metadata.price}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                    MAD/{metadata.unit}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <Layers className="size-3 text-muted-foreground" />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        Stock: <span className="font-semibold text-foreground">{metadata.stock}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Package className="size-3 text-muted-foreground" />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        Min: <span className="font-semibold text-foreground">{metadata.minOrder}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 border-t border-border/50 bg-muted/20">
                    <Button
                        asChild
                        size="sm"
                        className="w-full h-8 text-[11px] font-semibold uppercase tracking-widest rounded-lg transition-all bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm"
                    >
                        <Link href={`/dashboard/company/products`}>
                            Voir le catalogue <ArrowRight className="ml-2 size-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
