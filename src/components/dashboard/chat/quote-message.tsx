"use client";

import { useState } from "react";
import { respondToQuoteAction } from "@/actions/quotes.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    Loader2,
    Download,
    Check,
    Package,
    Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generateQuotePDF } from "@/lib/pdf-manager";

interface QuoteMessageProps {
    quote: any;
    currentUserId: string;
}

export function QuoteMessage({ quote, currentUserId }: QuoteMessageProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [status, setStatus] = useState(quote.status);

    const isSender = quote.senderUserId === currentUserId;

    const handleRespond = async (response: "ACCEPTED" | "DECLINED") => {
        setLoading(response);
        const result = await respondToQuoteAction(quote.id, response);
        setLoading(null);
        if (result.success) {
            setStatus(response);
        } else {
            alert(result.error);
        }
    };

    const handleDownload = () => {
        generateQuotePDF({
            quoteNumber: quote.id.slice(0, 8).toUpperCase(),
            date: quote.createdAt,
            senderName: isSender ? "Moi" : (quote.sender?.name || "Partenaire"),
            recipientName: !isSender ? "Moi" : "Partenaire",
            productName: quote.productName,
            quantity: quote.quantity,
            unitPrice: quote.unitPrice,
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            status: status,
            notes: quote.notes,
        });
    };

    const statusBadge = {
        PENDING: { label: "En attente", className: "bg-muted text-muted-foreground border-none" },
        ACCEPTED: { label: "Acceptée", className: "bg-green-600 text-white border-none" },
        DECLINED: { label: "Refusée", className: "bg-muted text-muted-foreground border-none" },
    }[status as string] ?? { label: status, className: "" };

    return (
        <Card className="w-full max-w-[340px] rounded-xl border border-border shadow-md overflow-hidden bg-background">

            {/* Header */}
            <CardHeader className="px-5 py-4 pb-3 flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="bg-foreground text-background p-1.5 rounded-lg">
                        <FileText className="size-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground leading-none">
                            Offre Commerciale
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                            Réf: {quote.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>
                <Badge variant="outline" className={cn("text-[10px] font-medium px-2.5 py-0.5 rounded-md", statusBadge.className)}>
                    {statusBadge.label}
                </Badge>
            </CardHeader>

            <Separator />

            {/* Body */}
            <CardContent className="px-5 py-4 space-y-3">

                {/* Produit */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <Package className="size-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                            Produit / Service
                        </p>
                        <p className="text-[13px] font-medium text-foreground truncate">
                            {quote.productName}
                        </p>
                    </div>
                </div>

                {/* Quantité + Prix */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                            Quantité
                        </p>
                        <p className="text-[14px] font-semibold text-foreground">
                            {quote.quantity}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                            Prix Unitaire
                        </p>
                        <p className="text-[14px] font-semibold text-foreground">
                            {quote.unitPrice}{" "}
                            <span className="text-[10px] font-medium text-muted-foreground">MAD</span>
                        </p>
                    </div>
                </div>

                {/* Total */}
                <div className="p-4 rounded-lg border border-border bg-foreground text-background flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                            Total Net à Payer
                        </p>
                        <p className="text-[22px] font-bold tracking-tight text-background leading-none">
                            {parseFloat(quote.totalAmount).toLocaleString()}
                            <span className="text-[11px] font-medium text-muted-foreground ml-1.5">MAD</span>
                        </p>
                    </div>
                    <Banknote className="size-5 text-muted-foreground" />
                </div>

                {/* Notes */}
                {quote.notes && (
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Notes du partenaire
                        </p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                            {quote.notes}
                        </p>
                    </div>
                )}
            </CardContent>

            <Separator />

            {/* Footer */}
            <CardFooter className="px-5 py-4 flex flex-col gap-3">
                {status === "PENDING" && !isSender ? (
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRespond("DECLINED")}
                            disabled={!!loading}
                            className="h-9 text-[12px] font-medium"
                        >
                            {loading === "DECLINED" ? <Loader2 className="size-4 animate-spin" /> : "Décliner"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleRespond("ACCEPTED")}
                            disabled={!!loading}
                            className="h-9 text-[12px] font-medium"
                        >
                            {loading === "ACCEPTED" ? <Loader2 className="size-4 animate-spin" /> : "Accepter"}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="w-full h-9 text-[12px] font-medium gap-2"
                    >
                        <Download className="size-4" />
                        Télécharger mon devis
                    </Button>
                )}

                <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] text-muted-foreground">
                        {format(new Date(quote.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                    {status === "ACCEPTED" && (
                        <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-medium">
                            <Check className="size-3" />
                            Officiel
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
