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
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generateQuotePDF } from "@/lib/pdf-manager";
import { Download } from "lucide-react";

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
        <Card className={cn(
            "w-full max-w-[320px] rounded-3xl border-none shadow-xl overflow-hidden transition-all",
            status === "PENDING" ? "bg-white" : "opacity-80"
        )}>
            <CardHeader className={cn(
                "p-4 flex flex-row items-center justify-between",
                status === "ACCEPTED" ? "bg-green-600" :
                    status === "DECLINED" ? "bg-red-600" : "bg-slate-900"
            )}>
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 p-1.5 rounded-lg">
                        <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">OFFRE COMMERCIALE</span>
                </div>
                <Badge variant="outline" className="border-white/20 text-white font-bold text-[9px] uppercase tracking-tighter">
                    {status === "PENDING" ? "En attente" :
                        status === "ACCEPTED" ? "Acceptée" : "Refusée"}
                </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <Package className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Produit</p>
                            <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{quote.productName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-50 p-2 rounded-xl">
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Quantité</p>
                                <p className="text-sm font-bold text-slate-900">{quote.quantity}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-50 p-2 rounded-xl">
                                <Banknote className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Prix Unit.</p>
                                <p className="text-sm font-bold text-slate-900">{quote.unitPrice} {quote.currency}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 flex justify-between items-center border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Total</span>
                    <span className="text-base font-black text-slate-900 tracking-tighter">{parseFloat(quote.totalAmount).toLocaleString()} {quote.currency}</span>
                </div>

                {quote.notes && (
                    <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                        <p className="text-[9px] font-bold text-orange-800 uppercase tracking-widest mb-1 italic">Note du vendeur</p>
                        <p className="text-[11px] text-orange-900/80 font-medium leading-relaxed italic">{quote.notes}</p>
                    </div>
                )}
            </CardContent>

            {status === "PENDING" && !isSender && (
                <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRespond("DECLINED")}
                        disabled={!!loading}
                        className="rounded-xl h-10 font-bold text-red-600 uppercase tracking-widest text-[9px] hover:bg-red-50 hover:text-red-700 bg-red-50/50"
                    >
                        {loading === "DECLINED" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refuser"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleRespond("ACCEPTED")}
                        disabled={!!loading}
                        className="rounded-xl h-10 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-green-200"
                    >
                        {loading === "ACCEPTED" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accepter l'offre"}
                    </Button>
                </CardFooter>
            )}

            {(status === "ACCEPTED" || status === "DECLINED") && (
                <CardFooter className="p-5 pt-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                        className="w-full rounded-xl h-10 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="h-3 w-3" />
                        Télécharger le document PDF
                    </Button>
                </CardFooter>
            )}

            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-1.5 overflow-hidden">
                <Clock className="h-3 w-3 text-slate-300" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Envoyé {format(new Date(quote.createdAt), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                </span>
            </div>
        </Card>
    );
}
