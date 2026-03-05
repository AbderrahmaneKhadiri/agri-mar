"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Info, MessageSquare, Quote } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BidDetailsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bid: any | null;
}

export function BidDetailsModal({ isOpen, onOpenChange, bid }: BidDetailsModalProps) {
    if (!bid) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg border-none shadow-2xl rounded-3xl p-0 bg-white overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#d4e9dc] to-[#a8d5be]" />

                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#2c5f42] flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#f0f8f4] border border-[#d4e9dc]">
                                <Quote className="size-4 text-[#2c5f42]" />
                            </div>
                            Détails de la Proposition
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Status & Date */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fdf9] border border-[#d4e9dc]/50">
                            <Badge className={cn(
                                "text-[10px] font-black border-none px-3 py-1 rounded-full uppercase tracking-wider",
                                bid.status === "PENDING" ? "bg-[#f0f8f4] text-[#4a8c5c]" :
                                    bid.status === "ACCEPTED" ? "bg-[#2c5f42] text-white" :
                                        "bg-red-50 text-red-600"
                            )}>
                                {bid.status === "PENDING" ? "EN ATTENTE" : bid.status === "ACCEPTED" ? "ACCEPTÉ" : "REFUSÉ"}
                            </Badge>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="size-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">
                                    Envoyé le {format(new Date(bid.createdAt), "d MMMM yyyy", { locale: fr })}
                                </span>
                            </div>
                        </div>

                        {/* Tender Info */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest pl-1">Informations de l&apos;Appel d&apos;Offre</h4>
                            <div className="p-5 rounded-2xl border border-[#d4e9dc] bg-white space-y-3">
                                <div>
                                    <h5 className="font-bold text-[15px] text-slate-900 leading-tight">{bid.title || bid.tender?.title}</h5>
                                    <p className="text-[11px] font-bold text-[#4a8c5c] uppercase mt-1">{bid.companyName || bid.tender?.company?.companyName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#f0f8f4]">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Mon Prix</span>
                                        <p className="text-[14px] font-black text-[#2c5f42] tabular-nums">{bid.price || bid.proposedPrice} <span className="text-[10px] font-medium text-[#4a8c5c]">MAD/u</span></p>
                                    </div>
                                    <div className="space-y-1 border-l border-[#f0f8f4] pl-4">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ma Quantité</span>
                                        <p className="text-[14px] font-black text-[#2c5f42] tabular-nums">{bid.quantity || bid.proposedQuantity} <span className="text-[10px] font-medium text-[#4a8c5c] uppercase">{bid.unit || bid.tender?.unit}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message/Description */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-[#4a8c5c] uppercase tracking-widest pl-1 flex items-center gap-2">
                                <MessageSquare className="size-3" />
                                Message de la Proposition
                            </h4>
                            <div className="p-5 rounded-2xl bg-[#f0f8f4]/50 border border-[#d4e9dc]/30 min-h-[100px]">
                                <p className="text-[13px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                    {bid.message || "Aucune description fournie pour cette proposition."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] bg-[#2c5f42] text-white hover:bg-[#1a3d2a] shadow-lg shadow-[#2c5f42]/20"
                            onClick={() => onOpenChange(false)}
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
