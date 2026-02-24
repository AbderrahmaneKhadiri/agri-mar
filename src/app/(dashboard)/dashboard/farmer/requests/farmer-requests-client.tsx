"use client";

import { useState } from "react";
import { IncomingRequestDTO } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Building2, Calendar, ChevronDown, MoreHorizontal, Eye, Clock, ShieldCheck, Loader2, Search } from "lucide-react";
import { respondConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export function FarmerRequestsClient({ initialRequests }: { initialRequests: IncomingRequestDTO[] }) {
    const [requests, setRequests] = useState<IncomingRequestDTO[]>(initialRequests);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<IncomingRequestDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("PENDING");

    // Memoize unique filters
    const uniqueIndustries = Array.from(new Set(requests.map(r => r.senderIndustry).filter(Boolean)));
    const uniqueLocations = Array.from(new Set(requests.map(r => r.location).filter(Boolean)));

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = selectedIndustry === "all" || r.senderIndustry === selectedIndustry;
        const matchesLocation = selectedLocation === "all" || r.location === selectedLocation;
        const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;

        return matchesSearch && matchesIndustry && matchesLocation && matchesStatus;
    });

    const handleAction = async (connectionId: string, status: "ACCEPTED" | "REJECTED") => {
        setIsProcessing(connectionId);
        const result = await respondConnectionAction({ connectionId, response: status });

        if (result.error) {
            alert(result.error);
        } else {
            setRequests(prev => prev.map(r => r.id === connectionId ? { ...r, status } : r));
        }
        setIsProcessing(null);
    };

    const handleViewProfile = (request: IncomingRequestDTO) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Contextual Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 mb-2">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Partenariats</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Demandes de Connexion</span>
                    </div>
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-2 items-center justify-between mt-2">
                    <div className="relative flex-1 w-full min-w-[200px] group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher une entreprise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 border-slate-200 bg-white/50 text-[12px] font-medium focus:bg-white transition-all shadow-none rounded-lg w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="h-8 w-full sm:w-[130px] bg-white/50 border-slate-200 shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Secteur" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">Tous secteurs</SelectItem>
                                {uniqueIndustries.map(ind => (
                                    <SelectItem key={ind} value={ind!}>{ind}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger className="h-8 w-full sm:w-[130px] bg-white/50 border-slate-200 shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Ville" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">Toutes villes</SelectItem>
                                {uniqueLocations.map(loc => (
                                    <SelectItem key={loc} value={loc!}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-8 w-full sm:w-[110px] bg-white/50 border-slate-200 shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">Tous statuts</SelectItem>
                                <SelectItem value="PENDING">En attente</SelectItem>
                                <SelectItem value="ACCEPTED">Autorisé</SelectItem>
                                <SelectItem value="REJECTED">Refusé</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold text-slate-900 gap-1.5 border-slate-200 bg-white shadow-none rounded-lg px-3 ml-1">
                            <Clock className="size-3.5" />
                            Historique
                        </Button>
                    </div>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="border border-slate-200 border-dashed rounded-xl bg-slate-50/50 min-h-[300px] flex items-center justify-center mt-4">
                    <div className="text-center space-y-4">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1} />
                        <div className="space-y-1">
                            <p className="text-[14px] font-semibold text-slate-900">Aucune demande trouvée</p>
                            <p className="text-[12px] text-slate-500 font-medium">Les nouvelles demandes apparaîtront ici.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mt-2">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100 hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-0">Entreprise</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Secteur</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Date Demande</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Status</TableHead>
                                <TableHead className="w-[120px] text-right pr-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request.id} className="border-slate-50 hover:bg-slate-50/20 h-11 group">
                                    <TableCell className="px-4 py-2">
                                        <Checkbox className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-slate-300 transition-colors" />
                                    </TableCell>
                                    <TableCell className="pl-0 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={request.senderLogo || ""} />
                                                <AvatarFallback className="text-[10px] font-bold bg-slate-50">
                                                    {request.senderName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-[13px] text-slate-900">{request.senderName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium py-2">
                                        {request.senderIndustry || "Acheteur"}
                                    </TableCell>
                                    <TableCell className="text-[12px] font-semibold text-slate-900 py-2">
                                        {format(new Date(request.sentAt), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {request.status === "PENDING" ? (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full w-fit border border-blue-100/50">
                                                <Clock className="size-2.5" />
                                                En attente
                                            </div>
                                        ) : request.status === "ACCEPTED" ? (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full w-fit border border-emerald-100/50">
                                                <Check className="size-2.5" />
                                                Autorisé
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full w-fit border border-red-100/50">
                                                <X className="size-2.5" />
                                                Refusé
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-4 py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            {request.status === "PENDING" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction(request.id, "ACCEPTED")}
                                                    disabled={!!isProcessing}
                                                    className="h-7 px-2.5 bg-emerald-600 text-white border-none hover:bg-emerald-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                                >
                                                    {isProcessing === request.id ? <Loader2 className="size-3 animate-spin" /> : "Autoriser"}
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-100 w-48">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Options Demande</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewProfile(request)} className="text-[12px] font-semibold text-slate-700 py-2 cursor-pointer">
                                                        <Eye className="size-3.5 mr-2 text-slate-400" /> Voir détails profil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                    <DropdownMenuItem onClick={() => handleAction(request.id, "REJECTED")} className="text-[12px] font-semibold text-red-600 py-2 cursor-pointer hover:bg-red-50">
                                                        <X className="size-3.5 mr-2" /> Refuser la demande
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
                    {selectedRequest && (
                        <>
                            <div className="bg-slate-900 p-6 text-white flex flex-col justify-end min-h-[100px] rounded-t-2xl">
                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1 leading-none">Mise en Relation</h3>
                                    <h2 className="text-xl font-bold tracking-tight leading-none text-white">Profil Acheteur</h2>
                                </div>
                            </div>

                            <div className="px-8 pb-8 -mt-8 relative z-20">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-xl rounded-2xl mb-6">
                                    <AvatarImage src={selectedRequest.senderLogo || ""} />
                                    <AvatarFallback className="bg-slate-50 text-slate-900 text-2xl font-bold rounded-2xl">
                                        {selectedRequest.senderName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{selectedRequest.senderName}</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedRequest.senderIndustry || "Secteur non défini"}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type de Compte</p>
                                            <p className="text-[13px] font-bold text-slate-700">Acheteur Officiel</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Enregistré le</p>
                                            <p className="text-[13px] font-bold text-slate-700">{format(new Date(selectedRequest.sentAt), "d MMMM yyyy", { locale: fr })}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100/30">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck className="size-4 text-blue-400" />
                                            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-widest">Protocol de Connexion</span>
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
                                            &quot;Cette entreprise souhaite entamer une discussion commerciale et établir un contrat avec votre exploitation. Autorisez-la pour ouvrir la discussion.&quot;
                                        </p>
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
                                            onClick={() => handleAction(selectedRequest.id, "ACCEPTED")}
                                            disabled={!!isProcessing}
                                            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold flex items-center gap-2"
                                        >
                                            {isProcessing === selectedRequest.id ? <Loader2 className="size-4 animate-spin" /> : "Autoriser l'Accès"}
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
