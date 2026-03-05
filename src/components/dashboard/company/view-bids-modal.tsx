"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptBidAction } from "@/actions/tenders.actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, CheckCircle2, User, Calendar, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewBidsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tender: any;
}

export function ViewBidsModal({ isOpen, onOpenChange, tender }: ViewBidsModalProps) {
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    const handleAcceptBid = async (bidId: string) => {
        if (!tender?.id) return;
        setIsAccepting(bidId);
        try {
            const result = await acceptBidAction(bidId, tender.id);
            if (result.success) {
                toast.success("Offre acceptée ! L'appel d'offre est maintenant clôturé.");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'acceptation");
        } finally {
            setIsAccepting(null);
        }
    };

    if (!tender) return null;

    const bids = tender.bids || [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-none shadow-2xl rounded-3xl p-0 bg-white">
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Offres Reçues</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Liste des propositions pour <span className="text-slate-900 font-bold">{tender.title}</span> ({tender.quantity} {tender.unit})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400">
                                <Info className="size-4" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut Actuel</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] rounded-full uppercase">
                                        {tender.status === "OPEN" ? "OUVERT" : tender.status}
                                    </Badge>
                                    <span className="text-[12px] font-bold text-slate-700">{bids.length} offre(s) reçue(s)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-6">Producteur</TableHead>
                                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offre</TableHead>
                                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disponibilité</TableHead>
                                    <TableHead className="text-right pr-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bids.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center text-slate-400 italic">
                                            Aucune offre pour le moment.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bids.map((bid: any) => (
                                        <TableRow key={bid.id} className="border-slate-50 hover:bg-slate-50/20 group">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9 rounded-xl border border-slate-100">
                                                        <AvatarImage src={bid.farmer?.avatarUrl || ""} />
                                                        <AvatarFallback className="bg-slate-50 text-[10px] font-bold text-slate-400 text-slate-900 uppercase">
                                                            {bid.farmer?.fullName?.charAt(0) || "P"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[13px] text-slate-900">{bid.farmer?.fullName}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <MapPin className="size-2.5" /> {bid.farmer?.city || "Maroc"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[14px] text-slate-900">{bid.proposedPrice} MAD/u</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Pour {bid.proposedQuantity} {tender.unit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 font-bold text-[12px] text-slate-600">
                                                {bid.availableDate ? format(new Date(bid.availableDate), "d MMM yyyy", { locale: fr }) : "Immédiate"}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                {tender.status === "OPEN" ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAcceptBid(bid.id)}
                                                        disabled={isAccepting !== null}
                                                        className="h-8 rounded-lg bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider px-4 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                                    >
                                                        {isAccepting === bid.id ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            "Accepter"
                                                        )}
                                                    </Button>
                                                ) : bid.status === "ACCEPTED" ? (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] rounded-full uppercase px-3 py-1">
                                                        Acceptée
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase">Clôturé</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {bids.some((b: any) => b.message) && (
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Messages des Producteurs</h4>
                            <div className="grid gap-3">
                                {bids.filter((b: any) => b.message).map((bid: any) => (
                                    <div key={bid.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[11px] font-bold text-slate-900">{bid.farmer?.fullName} :</span>
                                        </div>
                                        <p className="text-[12px] text-slate-600 leading-relaxed italic">&quot;{bid.message}&quot;</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            variant="ghost"
                            className="h-10 px-6 font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest text-[11px]"
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
