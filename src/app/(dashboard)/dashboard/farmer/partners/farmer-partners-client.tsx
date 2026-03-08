"use client";

import { useState } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, MessageSquare, Phone, Building2, Eye, Trash2, Loader2, ChevronDown, Filter, MoreHorizontal, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { resignConnectionAction } from "@/actions/networking.actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function FarmerPartnersClient({ initialPartners }: { initialPartners: PartnerDTO[] }) {
    const [partners, setPartners] = useState<PartnerDTO[]>(initialPartners);
    const [isResigning, setIsResigning] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("all");

    // Memoize unique industries
    const uniqueIndustries = Array.from(new Set(partners.map(p => p.industry || "Autre"))).filter(Boolean);

    // Filter partners
    const filteredPartners = partners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location.toLowerCase().includes(searchQuery.toLowerCase());
        const ind = p.industry || "Autre";
        const matchesIndustry = selectedIndustry === "all" || ind === selectedIndustry;
        return matchesSearch && matchesIndustry;
    });

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const handleResign = async (connectionId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Résilier le partenariat ?",
            description: "Voulez-vous vraiment résilier ce contrat ? Cette action est irréversible et mettra fin à votre collaboration officielle.",
            onConfirm: async () => {
                setIsResigning(connectionId);
                try {
                    const result = await resignConnectionAction(connectionId);
                    if (result.success) {
                        setPartners(prev => prev.filter(p => p.id !== connectionId));
                        toast.success("Partenariat résilié avec succès");
                    } else {
                        toast.error(result.error || "Erreur lors de la résiliation");
                    }
                } catch (error) {
                    toast.error("Erreur réseau");
                } finally {
                    setIsResigning(null);
                }
            }
        });
    };

    const handleViewProfile = (partner: PartnerDTO) => {
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Contextual Header */}
            <div className="flex flex-col gap-4 border-b border-border pb-4 mb-2">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Partenariats</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Répertoire Partenaires</span>
                    </div>
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-border flex flex-col sm:flex-row gap-2 items-center justify-between mt-2">
                    <div className="relative flex-1 w-full min-w-[200px] group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher par nom ou ville..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 border-border bg-white/50 text-[12px] font-medium focus:bg-white transition-all shadow-none rounded-lg w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="h-8 w-full sm:w-[180px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Secteur" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Tous les secteurs</SelectItem>
                                {uniqueIndustries.map(ind => (
                                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filteredPartners.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border border-border border-dashed rounded-xl bg-slate-50/50 mt-4">
                    <Building2 className="w-12 h-12 mb-4 opacity-20 text-slate-400" />
                    <div className="text-center space-y-1">
                        <p className="text-[14px] font-semibold text-slate-900">Aucun partenaire trouvé</p>
                        <p className="text-[12px] text-slate-500 font-medium">Modifiez vos filtres ou explorez le catalogue pour trouver de nouveaux partenaires.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
                    {filteredPartners.map((partner) => (
                        <Card key={partner.id} className="border-border shadow-sm hover:shadow-md transition-all bg-white group rounded-xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="h-px bg-emerald-500 w-full" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-12 w-12 border border-border rounded-lg">
                                            <AvatarImage src={partner.avatarUrl || ""} alt={partner.name} />
                                            <AvatarFallback className="bg-slate-50 text-slate-900 font-bold text-lg rounded-lg">
                                                {partner.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-border w-48">
                                                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Options Partenaire</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewProfile(partner)} className="text-[12px] font-semibold text-slate-700 py-2 cursor-pointer">
                                                    <User className="size-3.5 mr-2 text-slate-400" /> Profil complet
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-[12px] font-semibold text-slate-700 py-2 cursor-pointer">
                                                    <MessageSquare className="size-3.5 mr-2 text-slate-400" /> Envoyer un message
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem onClick={() => handleResign(partner.id)} className="text-[12px] font-semibold text-red-600 py-2 cursor-pointer hover:bg-red-50">
                                                    <Trash2 className="size-3.5 mr-2" /> Réclamer résiliation
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-0.5">
                                        <h4 className="text-[14px] font-bold text-slate-900 truncate">{partner.name}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{partner.industry || "Acheteur"}</p>
                                    </div>

                                    <div className="space-y-2.5 mt-5">
                                        <div className="flex items-center text-[11px] font-semibold text-slate-500">
                                            <MapPin className="size-3.5 mr-2 text-slate-400" />
                                            {partner.location}
                                        </div>
                                        <div className="flex items-center text-[11px] font-semibold text-slate-500">
                                            <Calendar className="size-3.5 mr-2 text-slate-400" />
                                            Depuis {format(new Date(partner.since), "MMM yyyy", { locale: fr })}
                                        </div>
                                    </div>

                                    <div className="pt-5 mt-5 border-t border-slate-50">
                                        <Button
                                            variant="outline"
                                            className="w-full h-9 text-[10px] font-bold uppercase tracking-widest"
                                            onClick={() => handleViewProfile(partner)}
                                        >
                                            Voir la Fiche
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[460px] p-0 overflow-hidden border border-border shadow-xl rounded-xl bg-white">
                    {selectedPartner && (
                        <>
                            {/* Header */}
                            <DialogHeader className="px-6 pt-6 pb-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Collaboration</p>
                                <DialogTitle className="text-[18px] font-semibold text-foreground leading-none">Fiche Partenaire</DialogTitle>
                            </DialogHeader>

                            <div className="border-t border-border" />

                            <div className="px-6 py-5 space-y-5">
                                {/* Identity row */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-border rounded-xl flex-shrink-0">
                                        <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                        <AvatarFallback className="bg-slate-50 text-slate-900 text-lg font-bold rounded-xl">
                                            {selectedPartner.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-[15px] font-bold text-slate-900 leading-none mb-1">{selectedPartner.name}</h3>
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{selectedPartner.industry || "Secteur d'activité"}</p>
                                    </div>
                                </div>

                                {/* Info boxes */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-slate-50 border border-border">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Siège Social</p>
                                        <p className="text-[13px] font-semibold text-slate-800">{selectedPartner.location}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 border border-border">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Début Contrat</p>
                                        <p className="text-[13px] font-semibold text-slate-800">{format(new Date(selectedPartner.since), "d MMMM yyyy", { locale: fr })}</p>
                                    </div>
                                </div>

                                {/* B2B block */}
                                <div className="p-4 rounded-lg border border-border space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                        <ShieldCheck className="size-3.5 text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Identité B2B</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="font-semibold text-slate-400 uppercase text-[11px]">Numéro ICE</span>
                                        <span className="font-bold text-slate-900">{selectedPartner.iceNumber || "Non renseigné"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="font-semibold text-slate-400 uppercase text-[11px]">Registre Commerce</span>
                                        <span className="font-bold text-slate-900">{selectedPartner.rcNumber || "En attente"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="font-semibold text-slate-400 uppercase text-[11px]">Type d&apos;Entité</span>
                                        <span className="font-bold text-slate-900">{selectedPartner.companyType || selectedPartner.industry || "Professionnel"}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border" />

                                {/* Footer */}
                                <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-0">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[13px] text-muted-foreground">
                                        Fermer
                                    </Button>
                                    <Button asChild className="text-[13px]">
                                        <Link href="/dashboard/farmer/messages">
                                            Ouvrir Discussion
                                        </Link>
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white max-w-[400px]">
                    <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
                    <div className="p-8 space-y-6">
                        <AlertDialogHeader>
                            <div className="size-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-2">
                                <AlertCircle className="size-6 text-red-600" />
                            </div>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                                {confirmConfig.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                                {confirmConfig.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 sm:gap-3">
                            <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px] hover:bg-slate-50">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmConfig.onConfirm}
                                className="flex-1 h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                            >
                                Résilier
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
