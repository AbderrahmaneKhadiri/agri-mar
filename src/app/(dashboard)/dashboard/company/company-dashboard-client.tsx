"use client";

import { useState } from "react";
import { PartnerDTO, IncomingRequestDTO } from "@/data-access/connections.dal";
import { ProductSelectDTO } from "@/data-access/products.dal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Filter,
    ChevronDown,
    MapPin,
    Tractor,
    ClipboardCheck,
    Search,
    User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";

interface CompanyDashboardClientProps {
    initialSuppliers: PartnerDTO[];
    initialMarketOffers: (ProductSelectDTO & { farmer: any })[];
    initialRequests: IncomingRequestDTO[];
}

export function CompanyDashboardClient({
    initialSuppliers,
    initialMarketOffers,
    initialRequests
}: CompanyDashboardClientProps) {
    const [activeTab, setActiveTab] = useState("suppliers");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSuppliers = initialSuppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMarket = initialMarketOffers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.farmer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRequests = initialRequests.filter(r =>
        r.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList variant="line" className="bg-transparent gap-8 h-auto p-0 border-b-0">
                        <TabsTrigger
                            value="suppliers"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-slate-900 border-none"
                        >
                            Mes Fournisseurs
                        </TabsTrigger>
                        <TabsTrigger
                            value="market"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-slate-900 border-none"
                        >
                            Offres du Marché
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none flex items-center gap-1.5 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-slate-900 border-none"
                        >
                            Demandes en cours <Badge className="bg-slate-100 text-slate-600 rounded-full text-[10px] px-1.5 py-0 font-bold border-none ml-1">{initialRequests.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <div className="relative w-64 group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-[12px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-none"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm min-h-[400px]">
                <Table>
                    <TableHeader className="bg-slate-50/50 font-bold">
                        <TableRow className="border-slate-100 hover:bg-transparent h-10">
                            {activeTab === "suppliers" && (
                                <>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-4">Partenaire</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Depuis le</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Status</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Localisation</TableHead>
                                </>
                            )}
                            {activeTab === "market" && (
                                <>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-4">Produit</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Producteur</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Prix</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Catégorie</TableHead>
                                </>
                            )}
                            {activeTab === "pending" && (
                                <>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-4">Destinataire</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Envoyée le</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Localisation</TableHead>
                                    <TableHead className="text-right pr-4 font-bold"></TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeTab === "suppliers" && (
                            filteredSuppliers.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-400 italic">Aucun fournisseur trouvé.</TableCell></TableRow>
                            ) : filteredSuppliers.map((s) => (
                                <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/20 h-14">
                                    <TableCell className="pl-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={s.avatarUrl || ""} />
                                                <AvatarFallback className="text-[10px] bg-slate-50">{s.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13px] text-slate-900">{s.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Partenaire</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium">
                                        {format(new Date(s.since), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold rounded-full">Actif</Badge>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5"><MapPin className="size-3 opacity-40" /> {s.location}</div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}

                        {activeTab === "market" && (
                            filteredMarket.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-400 italic">Aucune offre disponible.</TableCell></TableRow>
                            ) : filteredMarket.map((m) => (
                                <TableRow key={m.id} className="border-slate-50 hover:bg-slate-50/20 h-14">
                                    <TableCell className="pl-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Tractor className="size-4 text-slate-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13px] text-slate-900">{m.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{m.unit}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-medium text-slate-500">
                                        {m.farmer.fullName}
                                    </TableCell>
                                    <TableCell className="text-[13px] font-bold text-slate-900">
                                        {m.price} MAD
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{m.category}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}

                        {activeTab === "pending" && (
                            filteredRequests.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-400 italic">Aucune demande en cours.</TableCell></TableRow>
                            ) : filteredRequests.map((r) => (
                                <TableRow key={r.id} className="border-slate-50 hover:bg-slate-50/20 h-14">
                                    <TableCell className="pl-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={r.senderLogo || ""} />
                                                <AvatarFallback className="text-[10px] bg-slate-50">{r.senderName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13px] text-slate-900">{r.senderName}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Demande de contrat</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium">
                                        {format(new Date(r.sentAt), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5"><MapPin className="size-3 opacity-40" /> {r.location}</div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] font-bold rounded-full">En attente</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
