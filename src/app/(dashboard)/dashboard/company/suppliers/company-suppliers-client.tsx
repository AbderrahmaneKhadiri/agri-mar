"use client";

import { useState, useMemo } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Calendar,
    MessageSquare,
    Phone,
    Tractor,
    Eye,
    Trash2,
    Loader2,
    Gauge,
    ShieldCheck,
    Sprout,
    Clock,
    MoreHorizontal,
    Search,
    Filter,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { resignConnectionAction } from "@/actions/networking.actions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CompanySuppliersClient({ initialPartners }: { initialPartners: PartnerDTO[] }) {
    const [partners, setPartners] = useState<PartnerDTO[]>(initialPartners);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegion, setSelectedRegion] = useState<string>("all");
    const [selectedCrop, setSelectedCrop] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [isResigning, setIsResigning] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const uniqueRegions = useMemo(() => {
        const regions = new Set<string>();
        partners.forEach(p => {
            if (p.location) {
                const parts = p.location.split(',').map(s => s.trim());
                const region = parts.length > 1 ? parts[1] : parts[0];
                if (region) regions.add(region);
            }
        });
        return Array.from(regions).sort();
    }, [partners]);

    const uniqueCrops = useMemo(() => {
        const crops = new Set<string>();
        partners.forEach(p => {
            if (p.cropTypes) {
                p.cropTypes.forEach(c => crops.add(c));
            }
        });
        return Array.from(crops).sort();
    }, [partners]);

    const filteredPartners = partners
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.location.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesRegion = true;
            if (selectedRegion !== "all") {
                matchesRegion = p.location.includes(selectedRegion);
            }

            let matchesCrop = true;
            if (selectedCrop !== "all") {
                matchesCrop = p.cropTypes?.includes(selectedCrop) ?? false;
            }

            return matchesSearch && matchesRegion && matchesCrop;
        })
        .sort((a, b) => {
            const dateA = new Date(a.since).getTime();
            const dateB = new Date(b.since).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
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

    if (partners.length === 0) {
        return (
            <div className="border border-slate-200 border-dashed rounded-xl bg-slate-50/50 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Tractor className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-[14px] font-semibold text-slate-900">Aucun fournisseur actif</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center gap-2 flex-1 w-full lg:max-w-3xl">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un agriculteur ou une ferme..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 shadow-sm h-10 pl-9 rounded-lg text-[13px] hover:border-slate-300 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="hidden md:block w-px h-6 bg-slate-200 mx-1" />

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger className="w-full md:w-[180px] h-10 bg-white border-slate-200 shadow-sm rounded-lg text-[13px] font-medium text-slate-700 hover:border-slate-300">
                                <SelectValue placeholder="Toutes les régions" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                <SelectItem value="all" className="text-[13px] font-medium cursor-pointer">Toutes les régions</SelectItem>
                                {uniqueRegions.map(region => (
                                    <SelectItem key={region} value={region} className="text-[13px] font-medium cursor-pointer">
                                        {region}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger className="w-full md:w-[180px] h-10 bg-white border-slate-200 shadow-sm rounded-lg text-[13px] font-medium text-slate-700 hover:border-slate-300">
                                <SelectValue placeholder="Toutes les cultures" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                <SelectItem value="all" className="text-[13px] font-medium cursor-pointer">Toutes les cultures</SelectItem>
                                {uniqueCrops.map(crop => (
                                    <SelectItem key={crop} value={crop} className="text-[13px] font-medium cursor-pointer">
                                        {crop}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 px-4 text-[13px] font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-2 rounded-lg shadow-sm">
                                <Filter className="size-4" />
                                Trier par
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-xl rounded-xl">
                            <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Ordre d'ajout</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                <DropdownMenuRadioItem value="newest" className="text-[13px] font-medium text-slate-700 cursor-pointer">
                                    Plus récents
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="oldest" className="text-[13px] font-medium text-slate-700 cursor-pointer">
                                    Plus anciens
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent h-10">
                            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-4">Fournisseur</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Depuis le</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Status</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Localisation</TableHead>
                            <TableHead className="w-[120px] text-right pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPartners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                                    Aucun fournisseur ne correspond à votre recherche.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPartners.map((partner) => (
                                <TableRow key={partner.id} className="border-slate-50 hover:bg-slate-50/20 h-12">
                                    <TableCell className="pl-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={partner.avatarUrl || ""} />
                                                <AvatarFallback className="text-[10px] font-bold bg-slate-50">{partner.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13px] text-slate-900">{partner.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Producteur Agricole</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-medium text-slate-500 py-2">
                                        {format(new Date(partner.since), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full">
                                            <Clock className="size-2.5 mr-1" /> Actif
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-medium text-slate-500 py-2">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="size-3 opacity-50" />
                                            {partner.location}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewProfile(partner)}
                                                className="h-7 px-3 border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                                            >
                                                Profil
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleResign(partner.id)}
                                                disabled={isResigning === partner.id}
                                                className="h-7 px-3 bg-white text-red-500 border border-red-50 hover:bg-red-50 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                                            >
                                                {isResigning === partner.id ? <Loader2 className="size-3 animate-spin" /> : "Résilier"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-2xl">
                        {selectedPartner && (
                            <div className="flex flex-col">
                                <div className="h-24 bg-slate-50 w-full relative border-b border-slate-100">
                                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,var(--slate-200)_1px,transparent_1px)] [background-size:20px_20px]" />
                                </div>
                                <div className="px-8 pb-8 -mt-8 relative">
                                    <div className="flex items-end gap-6 mb-8">
                                        <Avatar className="size-24 rounded-2xl border-4 border-white shadow-2xl bg-white ring-1 ring-slate-100">
                                            <AvatarImage src={selectedPartner.avatarUrl || ""} />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-50 text-slate-900">
                                                {selectedPartner.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="pb-2 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedPartner.name}</h2>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold uppercase">Partenaire Certifié</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400" /> {selectedPartner.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Production</p>
                                            <span className="text-sm font-bold text-slate-900">{selectedPartner.production || "Non spécifiée"}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Surface</p>
                                            <span className="text-sm font-bold text-slate-900">{selectedPartner.totalArea ? `${selectedPartner.totalArea} HA` : "Non spécifiée"}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <Tractor className="size-4 text-emerald-600" /> Exploitation de {selectedPartner.name}
                                            </h4>
                                            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 italic text-[13px] text-slate-600 leading-relaxed font-medium">
                                                &ldquo;{selectedPartner.farmName || "Producteur Agricole stratégique"}. Spécialiste en production de haute qualité.&rdquo;
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Direct</p>
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                                                    <Phone className="size-4 text-emerald-500" />
                                                    <p className="text-[12px] font-bold text-slate-700">{selectedPartner.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partenaire depuis</p>
                                                <div className="flex items-center justify-end gap-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                                    <Calendar className="size-4 text-slate-400" />
                                                    <p className="text-[11px] font-bold text-slate-700">{format(new Date(selectedPartner.since), "d MMM yyyy", { locale: fr })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedPartner.cropTypes && selectedPartner.cropTypes.length > 0 && (
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expertises</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedPartner.cropTypes.map(c => (
                                                            <Badge key={c} variant="secondary" className="text-[9px] font-semibold bg-white border-slate-100">{c}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                {selectedPartner.farmingMethods && selectedPartner.farmingMethods.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Méthodes</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedPartner.farmingMethods.map(m => (
                                                                <Badge key={m} variant="secondary" className="text-[9px] font-semibold bg-white border-slate-100">{m}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedPartner.certifications && selectedPartner.certifications.length > 0 && (
                                            <div className="space-y-3 pt-2">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certifications</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPartner.certifications.map((cert, i) => (
                                                        <Badge key={i} variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100 text-[10px] font-bold rounded-lg px-2">
                                                            <ShieldCheck className="size-3 mr-1.5" /> {cert}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 pt-6 border-t flex justify-end">
                                        <Button onClick={() => setIsModalOpen(false)} className="h-10 px-8 font-semibold">
                                            Fermer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
