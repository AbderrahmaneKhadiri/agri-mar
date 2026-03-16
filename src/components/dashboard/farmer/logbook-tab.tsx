"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ClipboardCheck,
    Plus,
    Mic,
    Send,
    Loader2,
    FileText,
    Droplets,
    Sprout,
    Zap,
    Clock,
    Search,
    History,
    Settings
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { parseLogAction, createLogAction } from "@/actions/traceability.actions";
import { toast } from "sonner";
import { generateTraceabilityPDF } from "@/lib/utils/reporting";

interface LogbookTabProps {
    initialLogs: any[];
    farmerId: string;
    parcels: any[];
    farmName: string;
}

export function LogbookTab({ initialLogs, farmerId, parcels, farmName }: LogbookTabProps) {
    const [logs, setLogs] = useState(initialLogs);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const actionIcons: any = {
        IRRIGATION: <Droplets className="size-4 text-emerald-600" />,
        FERTILIZATION: <Zap className="size-4 text-emerald-600" />,
        TREATMENT: <ShieldCheck className="size-4 text-emerald-600" />,
        SOWING: <Sprout className="size-4 text-emerald-600" />,
        HARVEST: <History className="size-4 text-emerald-600" />,
        MAINTENANCE: <Settings className="size-4 text-neutral-400" />,
        OTHER: <ClipboardCheck className="size-4 text-neutral-500" />
    };

    const handleQuickEntry = async () => {
        if (!inputValue.trim()) return;

        setIsParsing(true);
        const parseResult = await parseLogAction(inputValue);
        setIsParsing(false);

        if (parseResult.success && parseResult.data) {
            const data = parseResult.data;

            setIsSaving(true);
            const createResult = await createLogAction({
                farmerId,
                parcelId: parcels[0]?.id, // Default to first parcel for now, can be improved
                actionType: data.actionType,
                description: data.description,
                quantity: data.quantity ? data.quantity.toString() : null,
                unit: data.unit,
                productUsed: data.productUsed,
                date: new Date()
            });
            setIsSaving(false);

            if (createResult.success && createResult.data && createResult.data[0]) {
                toast.success("Action enregistrée !");
                setLogs([createResult.data[0], ...logs]);
                setInputValue("");
            } else {
                toast.error("Erreur lors de l'enregistrement.");
            }
        } else {
            toast.error("L'IA n'a pas pu analyser votre message.");
        }
    };

    const filteredLogs = logs.filter(log =>
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actionType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* AI Quick Input - SIMPLE & PROFESSIONAL STYLE */}
            <div className="rounded-[2rem] bg-white border border-[#d4e9dc] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f8f4] rounded-full -mr-16 -mt-16 opacity-50" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="size-14 rounded-2xl bg-[#f0f8f4] border border-[#d4e9dc] flex items-center justify-center flex-shrink-0">
                        <Mic className="size-6 text-[#2c5f42]" />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Saisie Rapide IA</h3>
                        <p className="text-[12px] font-medium text-slate-500">Enregistrez vos travaux en langage naturel (Français ou Darija).</p>
                    </div>
                    <div className="w-full md:w-auto flex-[1.5] relative">
                        <Input
                            placeholder='Ex: "J&apos;ai irrigué la parcelle Nord pendant 2h" ...'
                            className="h-14 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 pl-6 pr-16 focus:bg-white focus:ring-[#2c5f42]/20 focus:border-[#2c5f42] transition-all font-medium text-[15px] shadow-none"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickEntry()}
                        />
                        <div className="absolute right-1.5 top-1.5">
                            <Button
                                className="h-11 rounded-lg bg-[#2c5f42] text-white hover:bg-[#1a3d2a] px-5 font-bold uppercase text-[10px] tracking-widest shadow-md transition-all active:scale-95"
                                onClick={handleQuickEntry}
                                disabled={isParsing || isSaving || !inputValue}
                            >
                                {isParsing || isSaving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List - Refined Premium */}
            <Card className="border-border shadow-sm overflow-hidden bg-white rounded-3xl">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-neutral-50 bg-neutral-50/30">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <CardTitle className="text-lg font-bold text-neutral-900 tracking-tight">Registre de Traçabilité</CardTitle>
                        </div>
                        <CardDescription className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Archive des travaux agricoles</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                            <Input
                                placeholder="Filtrer..."
                                className="pl-9 h-9 rounded-xl bg-white border-neutral-200 text-[12px] shadow-none focus:ring-neutral-100"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="h-9 rounded-xl border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 px-4 shadow-none hover:bg-neutral-50"
                            onClick={() => generateTraceabilityPDF(logs, farmName)}
                        >
                            <FileText className="size-3.5" />
                            Rapport PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-neutral-100">
                                <TableHead className="w-[180px] text-[10px] font-bold uppercase tracking-widest text-neutral-400 pl-8 h-12">Date & Heure</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 h-12">Action</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 h-12">Détails</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 h-12">Volume/Qté</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 h-12">Intrant</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 pr-8 h-12 text-right">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id} className="border-neutral-50 group hover:bg-neutral-50/50 transition-colors h-16">
                                    <TableCell className="pl-8">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-neutral-900">{format(new Date(log.date), "dd MMM yyyy", { locale: fr })}</span>
                                            <span className="text-[10px] font-medium text-neutral-400 uppercase tabular-nums">{format(new Date(log.date), "HH:mm")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-neutral-100/50 flex items-center justify-center border border-neutral-100">
                                                {actionIcons[log.actionType]}
                                            </div>
                                            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">{log.actionType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[13px] font-medium text-neutral-600 line-clamp-1">{log.description}</span>
                                    </TableCell>
                                    <TableCell>
                                        {log.quantity ? (
                                            <span className="text-[13px] font-bold text-neutral-900 tabular-nums">
                                                {log.quantity} <span className="text-[10px] font-medium text-neutral-400 uppercase">{log.unit}</span>
                                            </span>
                                        ) : <span className="text-neutral-300">--</span>}
                                    </TableCell>
                                    <TableCell>
                                        {log.productUsed ? (
                                            <Badge variant="outline" className="rounded-lg bg-neutral-50 border-neutral-200 text-neutral-600 font-bold text-[10px] uppercase shadow-none ring-0">
                                                {log.productUsed}
                                            </Badge>
                                        ) : <span className="text-neutral-300">--</span>}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Certifié</span>
                                            <div className="size-1 w-1 h-1 rounded-full bg-emerald-500" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <div className="p-4 rounded-3xl bg-neutral-50">
                                                <ClipboardCheck className="size-8 text-neutral-300" />
                                            </div>
                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Aucune donnée archivée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// Sub-component for icons if needed (placeholder for ShieldCheck)
function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
