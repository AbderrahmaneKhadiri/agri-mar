"use client";

import { useState } from "react";
import { IncomingRequestDTO } from "@/data-access/connections.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Building2, Calendar, ChevronDown, MoreHorizontal, Eye, Clock, ShieldCheck, Loader2, Search, MessageSquare, MapPin } from "lucide-react";
import { respondConnectionAction } from "@/actions/networking.actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        confirmText?: string;
        variant?: "destructive" | "default" | "success";
        icon?: React.ElementType;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

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
        setConfirmConfig({
            isOpen: true,
            title: status === "ACCEPTED" ? "Accepter la demande ?" : "Refuser la demande ?",
            description: status === "ACCEPTED"
                ? "En acceptant, cette entreprise pourra accéder à vos données d'exploitation et vous envoyer des propositions."
                : "Voulez-vous vraiment refuser cette demande de connexion ? Cette action est irréversible.",
            confirmText: status === "ACCEPTED" ? "Accepter" : "Refuser",
            variant: status === "ACCEPTED" ? "success" : "destructive",
            icon: status === "ACCEPTED" ? ShieldCheck : X,
            onConfirm: async () => {
                setIsProcessing(connectionId);
                const result = await respondConnectionAction({ connectionId, response: status });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    setRequests(prev => prev.map(r => r.id === connectionId ? { ...r, status } : r));
                    toast.success(status === "ACCEPTED" ? "Demande acceptée" : "Demande refusée");
                }
                setIsProcessing(null);
            }
        });
    };

    const handleViewProfile = (request: IncomingRequestDTO) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Contextual Header */}
            <div className="flex flex-col gap-4 border-b border-border pb-4 mb-2">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Partenariats</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Demandes de Connexion</span>
                    </div>
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-border flex flex-col sm:flex-row gap-2 items-center justify-between mt-2">
                    <div className="relative flex-1 w-full min-w-[200px] group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher une entreprise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 border-border bg-white/50 text-[12px] font-medium focus:bg-white transition-all shadow-none rounded-lg w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="h-8 w-full sm:w-[130px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Secteur" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Tous secteurs</SelectItem>
                                {uniqueIndustries.map(ind => (
                                    <SelectItem key={ind} value={ind!}>{ind}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger className="h-8 w-full sm:w-[130px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Ville" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Toutes villes</SelectItem>
                                {uniqueLocations.map(loc => (
                                    <SelectItem key={loc} value={loc!}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-8 w-full sm:w-[110px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Tous statuts</SelectItem>
                                <SelectItem value="PENDING">En attente</SelectItem>
                                <SelectItem value="ACCEPTED">Autorisé</SelectItem>
                                <SelectItem value="REJECTED">Refusé</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold text-slate-900 gap-1.5 border-border bg-white shadow-none rounded-lg px-3 ml-1">
                            <Clock className="size-3.5" />
                            Historique
                        </Button>
                    </div>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="border border-border border-dashed rounded-xl bg-slate-50/50 min-h-[300px] flex items-center justify-center mt-4">
                    <div className="text-center space-y-4">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1} />
                        <div className="space-y-1">
                            <p className="text-[14px] font-semibold text-slate-900">Aucune demande trouvée</p>
                            <p className="text-[12px] text-slate-500 font-medium">Les nouvelles demandes apparaîtront ici.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm mt-2">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-border hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-border data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
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
                                        <Checkbox className="translate-y-[2px] border-border data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-border transition-colors" />
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
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#f0f8f4] text-[#2c5f42] px-2.5 py-0.5 rounded-full w-fit border border-[#e0ede5]">
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
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAction(request.id, "ACCEPTED")}
                                                        disabled={!!isProcessing}
                                                        className="h-7 px-2.5 bg-[#2c5f42] text-white border-none hover:bg-[#2c5f42]/90 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                                    >
                                                        {isProcessing === request.id ? <Loader2 className="size-3 animate-spin" /> : "Accepter"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleAction(request.id, "REJECTED")}
                                                        disabled={!!isProcessing}
                                                        className="h-7 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                                    >
                                                        Refuser
                                                    </Button>
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-border w-48">
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
                            <DialogHeader className="px-8 pt-8 pb-4">
                                <DialogDescription className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                                    Mise en Relation
                                </DialogDescription>
                                <DialogTitle className="text-[22px] font-bold tracking-tight text-foreground">
                                    Profil Acheteur
                                </DialogTitle>
                            </DialogHeader>

                            <Separator className="bg-border/60" />

                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border border-border shadow-sm rounded-2xl">
                                        <AvatarImage src={selectedRequest.senderLogo || ""} className="object-cover" />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold rounded-2xl uppercase">
                                            {selectedRequest.senderName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1.5">
                                        <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none">{selectedRequest.senderName}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">{selectedRequest.senderIndustry || "Secteur non défini"}</p>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                                                <MapPin className="size-3" />
                                                {selectedRequest.location || "Maroc"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Type de Compte</label>
                                        <div className="h-10 px-4 rounded-lg border border-border flex items-center bg-muted/20 text-[13px] font-semibold text-foreground">
                                            Acheteur Officiel
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Enregistré le</label>
                                        <div className="h-10 px-4 rounded-lg border border-border flex items-center bg-muted/20 text-[13px] font-semibold text-foreground tabular-nums">
                                            {format(new Date(selectedRequest.sentAt), "d MMMM yyyy", { locale: fr })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="size-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Message d'accompagnement</span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border border-dashed bg-muted/5">
                                        <p className="text-[13px] font-medium text-foreground leading-relaxed italic">
                                            "{selectedRequest.initialMessage || "Aucun message d'accompagnement"}"
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] leading-none">Identité B2B</span>
                                    </div>
                                    <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                                        <div className="flex justify-between items-center px-4 py-3 bg-white hover:bg-muted/5 transition-colors">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Vérification ICE</span>
                                            <span className="text-[13px] font-bold text-foreground tabular-nums">{selectedRequest.iceNumber || "Non renseigné"}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3 bg-white hover:bg-muted/5 transition-colors">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Registre de Commerce</span>
                                            <span className="text-[13px] font-bold text-foreground tabular-nums">{selectedRequest.rcNumber || "En attente"}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3 bg-muted/20">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Segment d'Activité</span>
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-wide">{selectedRequest.companyType || selectedRequest.senderIndustry || "Professionnel"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-12 px-6 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleAction(selectedRequest.id, "ACCEPTED");
                                            setIsModalOpen(false);
                                        }}
                                        disabled={!!isProcessing}
                                        className="h-12 flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-[13px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        {isProcessing === selectedRequest.id ? <Loader2 className="size-4 animate-spin" /> : "Autoriser l'Accès"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white max-w-[400px]">
                    <div className={cn(
                        "h-1.5 bg-gradient-to-r",
                        confirmConfig.variant === "destructive" ? "from-red-500 to-orange-500" :
                            confirmConfig.variant === "success" ? "from-emerald-500 to-teal-500" : "from-slate-500 to-slate-700"
                    )} />
                    <div className="p-8 space-y-6">
                        <AlertDialogHeader>
                            <div className={cn(
                                "size-12 rounded-2xl border flex items-center justify-center mb-2",
                                confirmConfig.variant === "destructive" ? "bg-red-50 border-red-100" :
                                    confirmConfig.variant === "success" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                            )}>
                                {confirmConfig.icon ? (
                                    <confirmConfig.icon className={cn(
                                        "size-6",
                                        confirmConfig.variant === "destructive" ? "text-red-600" :
                                            confirmConfig.variant === "success" ? "text-emerald-600" : "text-slate-600"
                                    )} />
                                ) : (
                                    <AlertCircle className={cn(
                                        "size-6",
                                        confirmConfig.variant === "destructive" ? "text-red-600" : "text-slate-600"
                                    )} />
                                )}
                            </div>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                                {confirmConfig.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                                {confirmConfig.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 sm:gap-3">
                            <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px] hover:bg-slate-50 shadow-none">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    confirmConfig.onConfirm();
                                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                }}
                                className={cn(
                                    "flex-1 h-12 rounded-2xl font-bold uppercase tracking-wider text-[11px] shadow-lg transition-all active:scale-[0.98]",
                                    confirmConfig.variant === "destructive"
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
                                        : confirmConfig.variant === "success"
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                                            : "bg-[#2c5f42] text-white hover:bg-[#2c5f42]/90 shadow-slate-200"
                                )}
                            >
                                {confirmConfig.confirmText || "Confirmer"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
