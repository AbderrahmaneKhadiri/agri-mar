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

    const handleResign = async (connectionId: string) => {
        if (!confirm("Voulez-vous vraiment résilier ce contrat ? Cette action est irréversible.")) return;

        setIsResigning(connectionId);
        const result = await resignConnectionAction(connectionId);
        if (result.success) {
            setPartners(prev => prev.filter(p => p.id !== connectionId));
        } else {
            alert(result.error || "Erreur lors de la résiliation");
        }
        setIsResigning(null);
    };

    const handleViewProfile = (partner: PartnerDTO) => {
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Contextual Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 mb-2">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Partenariats</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Répertoire Partenaires</span>
                    </div>
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-2 items-center justify-between mt-2">
                    <div className="relative flex-1 w-full min-w-[200px] group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher par nom ou ville..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 border-slate-200 bg-white/50 text-[12px] font-medium focus:bg-white transition-all shadow-none rounded-lg w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="h-8 w-full sm:w-[180px] bg-white/50 border-slate-200 shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Secteur" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
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
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 mt-4">
                    <Building2 className="w-12 h-12 mb-4 opacity-20 text-slate-400" />
                    <div className="text-center space-y-1">
                        <p className="text-[14px] font-semibold text-slate-900">Aucun partenaire trouvé</p>
                        <p className="text-[12px] text-slate-500 font-medium">Modifiez vos filtres ou explorez le catalogue pour trouver de nouveaux partenaires.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
                    {filteredPartners.map((partner) => (
                        <Card key={partner.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all bg-white group rounded-xl overflow-hidden hover:border-emerald-100 border-b-2 border-b-emerald-500/5">
                            <CardContent className="p-0">
                                <div className="h-1 bg-emerald-100 w-full group-hover:bg-emerald-500 transition-colors" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-12 w-12 border border-slate-100 rounded-lg">
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
                                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 w-48">
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
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{partner.industry || "Acheteur Or"}</p>
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
                                            className="w-full rounded-lg border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 h-9 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-colors"
                                            onClick={() => handleViewProfile(partner)}
                                        >
                                            Accéder aux Devis
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
                    {selectedPartner && (
                        <>
                            <div className="bg-slate-900 p-6 text-white flex flex-col justify-end min-h-[100px] rounded-t-2xl">
                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1 leading-none">Collaboration</h3>
                                    <h2 className="text-xl font-bold tracking-tight leading-none text-white">Fiche Partenaire</h2>
                                </div>
                            </div>

                            <div className="px-8 pb-8 -mt-8 relative z-20">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-xl rounded-2xl mb-6">
                                    <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                    <AvatarFallback className="bg-slate-50 text-slate-900 text-2xl font-bold rounded-2xl">
                                        {selectedPartner.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{selectedPartner.name}</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedPartner.industry || "Secteur d&apos;activité"}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Siège Social</p>
                                            <p className="text-[13px] font-bold text-slate-700">{selectedPartner.location}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Début Contrat</p>
                                            <p className="text-[13px] font-bold text-slate-700">{format(new Date(selectedPartner.since), "d MMMM yyyy", { locale: fr })}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="size-4 text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Identité B2B</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="font-bold text-slate-400 uppercase">Numéro ICE</span>
                                            <span className="font-black text-slate-900 tabular-nums">{selectedPartner.iceNumber || "Non renseigné"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="font-bold text-slate-400 uppercase">Registre Commerce</span>
                                            <span className="font-black text-slate-900 tabular-nums">{selectedPartner.rcNumber || "En attente"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="font-bold text-slate-400 uppercase">Type d'Entité</span>
                                            <span className="font-black text-emerald-600">{selectedPartner.companyType || selectedPartner.industry || "Professionnel"}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsModalOpen(false)}
                                            className="h-11 px-6 text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-transparent -ml-4"
                                        >
                                            Fermer
                                        </Button>
                                        <Button
                                            asChild
                                            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold"
                                        >
                                            <Link href="/dashboard/farmer/messages">
                                                Ouvrir Discussion
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
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
