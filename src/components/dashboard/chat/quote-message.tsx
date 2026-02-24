"use client";

import { useState } from "react";
import { respondToQuoteAction } from "@/actions/quotes.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    Package,
    Banknote,
    Loader2,
    Download,
    Check
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
            notes: quote.notes
        });
    };

    return (
        <Card className="w-full max-w-[340px] rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden bg-white">
            <div className={cn(
                "h-1.5 w-full",
                status === "ACCEPTED" ? "bg-emerald-500" :
                    status === "DECLINED" ? "bg-red-500" : "bg-slate-900"
            )} />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-950 p-2 rounded-xl text-white shadow-lg shadow-slate-900/20">
                            <FileText className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[1.5px] text-slate-950">Offre Commerciale</span>
                            <span className="text-[9px] font-bold text-slate-400">RÉF: {quote.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                        status === "PENDING" ? "bg-amber-50 text-amber-700" :
                            status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}>
                        {status === "PENDING" ? "En attente" :
                            status === "ACCEPTED" ? "Acceptée" : "Refusée"}
                    </Badge>
                </div>

                <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                            <Package className="size-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Produit / Service</p>
                            <p className="text-[14px] font-bold text-slate-900 truncate tracking-tight">{quote.productName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantité</p>
                            <p className="text-[15px] font-black text-slate-900 tracking-tight">{quote.quantity}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix Unitaire</p>
                            <p className="text-[15px] font-black text-slate-900 tracking-tight">{quote.unitPrice} <span className="text-[10px] font-bold text-slate-400 ml-0.5">MAD</span></p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 flex items-center justify-between text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-white/10" />
                        <div className="flex flex-col relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-500 mb-1">Total Net à payer</span>
                            <span className="text-2xl font-black tracking-tighter text-emerald-400">
                                {parseFloat(quote.totalAmount).toLocaleString()}
                                <span className="text-[12px] font-bold text-slate-500 ml-2 tracking-widest">MAD</span>
                            </span>
                        </div>
                        <Banknote className="size-6 text-slate-700 relative z-10" />
                    </div>

                    {quote.notes && (
                        <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 flex flex-col gap-1.5">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Notes du partenaire</p>
                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic">{quote.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 bg-white border-t border-slate-50 flex flex-col gap-4">
                {status === "PENDING" && !isSender ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRespond("DECLINED")}
                            disabled={!!loading}
                            className="h-11 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            {loading === "DECLINED" ? <Loader2 className="size-4 animate-spin" /> : "Décliner"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleRespond("ACCEPTED")}
                            disabled={!!loading}
                            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            {loading === "ACCEPTED" ? <Loader2 className="size-4 animate-spin" /> : "Accepter l'offre"}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 shadow-sm transition-all"
                    >
                        <Download className="size-4" /> Télécharger mon devis
                    </Button>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                        {format(new Date(quote.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                    {status === "ACCEPTED" && (
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                            <Check className="size-3" /> Officiel
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
