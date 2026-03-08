"use client";

import { useState, useMemo } from "react";
import { PartnerDTO } from "@/data-access/connections.dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    MapPin, Search, Star, MessageSquare,
    CheckCircle2, Users, X, ArrowUpRight,
    Tractor, Calendar, Building2, ChevronRight, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { resignConnectionAction } from "@/actions/networking.actions";
import { toast } from "sonner";
import { SupplierProfileDetail } from "./supplier-profile-detail";
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

export function SupplierTableClient({
    initialSuppliers
}: {
    initialSuppliers: PartnerDTO[]
}) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState<PartnerDTO | null>(null);
    const [isResigning, setIsResigning] = useState<string | null>(null);
    const [supplierToResign, setSupplierToResign] = useState<PartnerDTO | null>(null);

    const handleMessage = (s: PartnerDTO) => {
        router.push(`/dashboard/company/messages?connectionId=${s.id}`);
    };

    const handleResign = async (s: PartnerDTO) => {
        setIsResigning(s.id);
        const result = await resignConnectionAction(s.id);
        setIsResigning(null);
        setSupplierToResign(null);

        if (result.success) {
            toast.success("Contrat résilié avec succès");
            router.refresh();
        } else {
            toast.error(result.error || "Erreur lors de la résiliation");
        }
    };

    const filtered = useMemo(() => {
        return initialSuppliers.filter(s => {
            const query = search.toLowerCase();
            return !query ||
                s.name.toLowerCase().includes(query) ||
                (s.farmName || "").toLowerCase().includes(query) ||
                s.location.toLowerCase().includes(query);
        });
    }, [initialSuppliers, search]);

    if (selectedSupplier) {
        return (
            <SupplierProfileDetail
                supplier={selectedSupplier}
                onBack={() => setSelectedSupplier(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Filter Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#f0f8f4] text-[#2c5f42]">
                            <Users className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none">Mes Fournisseurs</h2>
                            <p className="text-[12px] text-slate-500 font-medium mt-1">Gérez vos relations et contrats directs</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher par nom, exploitation ou localisation..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-10 bg-slate-50/50 border-transparent text-[13px] focus-visible:ring-[#2c5f42]/20 shadow-none transition-all focus:bg-white"
                        />
                    </div>
                    {search && (
                        <Button variant="ghost" size="sm"
                            className="h-10 px-4 text-[12px] font-bold text-slate-400 hover:text-slate-900"
                            onClick={() => setSearch("")}>
                            <X className="size-4 mr-2" /> Réinitialiser
                        </Button>
                    )}
                </div>
            </div>

            {/* Premium Table Container */}
            <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Table>
                    <TableHeader className="bg-[#f8fdf9] border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest pl-8 h-12">Fournisseur</TableHead>
                            <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest h-12">Depuis le</TableHead>
                            <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest h-12">Status</TableHead>
                            <TableHead className="text-[11px] font-bold text-[#2c5f42] uppercase tracking-widest h-12">Localisation</TableHead>
                            <TableHead className="text-right pr-8 h-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Tractor className="size-10 text-slate-200" />
                                        <p className="text-[14px] text-slate-400 font-medium italic">Aucun partenaire trouvé pour cette recherche.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((s) => (
                                <TableRow
                                    key={s.id}
                                    className="border-slate-50 hover:bg-slate-50/30 h-20 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedSupplier(s)}
                                >
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-11 rounded-xl ring-1 ring-border group-hover:ring-[#2c5f42]/20 transition-all shadow-sm">
                                                <AvatarImage src={s.avatarUrl || ""} className="object-cover" />
                                                <AvatarFallback className="text-[14px] font-bold bg-slate-50 text-[#2c5f42]">
                                                    {s.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[14px] text-slate-900 group-hover:text-[#2c5f42] transition-colors">
                                                    {s.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Building2 className="size-3 text-slate-400" />
                                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                                        {s.farmName || "Producteur Direct"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[13px] text-slate-600 font-bold tabular-nums">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-3.5 opacity-30" />
                                            {format(new Date(s.since), "d MMM yyyy", { locale: fr })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-[#f0f8f4] text-[#2c5f42] border-[#c4dece] text-[10px] font-bold rounded-md px-2.5 py-1 uppercase tracking-wider shadow-sm">
                                            <CheckCircle2 className="size-3 mr-1.5" /> Actif
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[13px] text-slate-600 font-semibold">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <MapPin className="size-3.5 opacity-40 text-[#2c5f42]" />
                                            <span className="truncate max-w-[150px]">{s.location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 text-[#2c5f42] hover:text-[#2c5f42] hover:bg-[#f0f8f4] font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMessage(s);
                                                }}
                                            >
                                                <MessageSquare className="size-3.5 mr-2" /> Message
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 text-red-400 hover:text-red-600 hover:bg-red-50 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
                                                disabled={isResigning === s.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSupplierToResign(s);
                                                }}
                                            >
                                                {isResigning === s.id ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <X className="size-3.5 mr-2" />
                                                )}
                                                Résilier
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg group-hover:text-slate-900 transition-all ml-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSupplier(s);
                                                }}
                                            >
                                                <ChevronRight className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Metrics Legend or Additional Info */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="size-2 rounded-full bg-emerald-500" /> Relations Actives ({filtered.length})
                    </div>
                </div>
                <div className="text-[11px] font-medium text-slate-400 italic">
                    Cliquez sur une ligne pour voir le profil détaillé et le monitoring satellite.
                </div>
            </div>

            {/* Premium Confirmation Dialog */}
            <AlertDialog open={!!supplierToResign} onOpenChange={(open) => !open && setSupplierToResign(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md">
                    <div className="h-2 bg-red-500 w-full" />
                    <div className="p-8">
                        <AlertDialogHeader>
                            <div className="size-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                                <X className="size-6" />
                            </div>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                                Résilier le contrat ?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 text-[14px] leading-relaxed pt-2">
                                Êtes-vous sûr de vouloir mettre fin à votre partenariat avec <strong className="text-slate-900">{supplierToResign?.name}</strong> ?
                                <br /><br />
                                Cette action supprimera l'accès au monitoring satellite et aux coordonnées directes. Cette opération est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                            <AlertDialogCancel className="h-11 rounded-xl border-slate-100 text-slate-500 font-bold text-[12px] uppercase tracking-wider hover:bg-slate-50 hover:text-slate-900 transition-all flex-1 sm:flex-none">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => supplierToResign && handleResign(supplierToResign)}
                                className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[12px] uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all border-none flex-1 sm:flex-none"
                            >
                                {isResigning ? <Loader2 className="size-4 animate-spin" /> : "Résilier le contrat"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
