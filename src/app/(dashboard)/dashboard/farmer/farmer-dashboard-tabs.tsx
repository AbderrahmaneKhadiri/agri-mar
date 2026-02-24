"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, ArrowUpRightIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { IncomingRequestDTO, PartnerDTO } from "@/data-access/connections.dal";
import { ProductSelectDTO } from "@/data-access/products.dal";

interface FarmerDashboardTabsProps {
    initialRequests: IncomingRequestDTO[];
    initialPartners: PartnerDTO[];
    initialProducts: ProductSelectDTO[];
}

export function FarmerDashboardTabs({
    initialRequests,
    initialPartners,
    initialProducts
}: FarmerDashboardTabsProps) {
    const [activeTab, setActiveTab] = useState("requests");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRequests = initialRequests.filter(req =>
        req.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPartners = initialPartners.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredProducts = initialProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-0 mt-2">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchQuery(""); }} className="w-auto">
                    <TabsList variant="line" className="bg-transparent gap-8 h-auto p-0 border-b-0">
                        <TabsTrigger
                            value="requests"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none flex items-center gap-2 transition-all border-none data-[state=active]:text-slate-900"
                        >
                            Dernières Demandes <Badge className="bg-slate-100 text-slate-600 rounded-full text-[10px] px-1.5 py-0 font-bold border-none">{initialRequests.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="partners"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all border-none data-[state=active]:text-slate-900"
                        >
                            Partenaires Actifs
                        </TabsTrigger>
                        <TabsTrigger
                            value="products"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all border-none data-[state=active]:text-slate-900"
                        >
                            Mon Catalogue
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 pb-4">
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

            <Tabs value={activeTab} className="mt-2">
                <TabsContent value="requests" className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm m-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 hover:bg-transparent">
                            <TableRow className="border-slate-100 hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-0">Entreprise</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Date</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right pr-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500 text-[12px] font-medium">Aucune demande trouvée.</TableCell>
                                </TableRow>
                            ) : filteredRequests.map((req) => (
                                <TableRow key={req.id} className="border-slate-50 hover:bg-slate-50/20 h-10 group">
                                    <TableCell className="px-4 py-2">
                                        <Checkbox className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-slate-300 transition-colors" />
                                    </TableCell>
                                    <TableCell className="font-semibold text-[13px] text-slate-900 pl-0 py-2">
                                        {req.senderName}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className={cn(
                                            "flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit",
                                            req.status === "PENDING" ? "bg-blue-50 text-blue-600" :
                                                req.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600" :
                                                    "bg-slate-50 text-slate-400"
                                        )}>
                                            <Clock className="size-2.5" />
                                            {req.status === "PENDING" ? "En attente" : req.status === "ACCEPTED" ? "Autorisé" : "Refusé"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-semibold text-slate-500 py-2">
                                        {format(new Date(req.sentAt), "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="pr-4 py-2 text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-7 text-slate-400 hover:text-slate-900">
                                            <Link href="/dashboard/farmer/requests">
                                                Détails <ArrowUpRightIcon className="size-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="partners" className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm m-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 hover:bg-transparent">
                            <TableRow className="border-slate-100 hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-0">Partenaire</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Secteur</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Membre depuis</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right pr-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPartners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500 text-[12px] font-medium">Aucun partenaire actif.</TableCell>
                                </TableRow>
                            ) : filteredPartners.map((partner) => (
                                <TableRow key={partner.id} className="border-slate-50 hover:bg-slate-50/20 h-10 group">
                                    <TableCell className="px-4 py-2">
                                        <Checkbox className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-slate-300 transition-colors" />
                                    </TableCell>
                                    <TableCell className="font-semibold text-[13px] text-slate-900 pl-0 py-2">
                                        {partner.name}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium py-2">
                                        {partner.industry || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-[12px] font-semibold text-slate-500 py-2">
                                        {format(new Date(partner.since), "MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="pr-4 py-2 text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-7 text-slate-400 hover:text-slate-900">
                                            <Link href="/dashboard/farmer/partners">
                                                Voir Profil <ArrowUpRightIcon className="size-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="products" className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm m-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 hover:bg-transparent">
                            <TableRow className="border-slate-100 hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-0">Produit</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Prix Moyen</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Stock</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right pr-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500 text-[12px] font-medium">Aucun produit au catalogue.</TableCell>
                                </TableRow>
                            ) : filteredProducts.map((product) => (
                                <TableRow key={product.id} className="border-slate-50 hover:bg-slate-50/20 h-10 group">
                                    <TableCell className="px-4 py-2">
                                        <Checkbox className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-slate-300 transition-colors" />
                                    </TableCell>
                                    <TableCell className="font-semibold text-[13px] text-slate-900 pl-0 py-2">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-[12px] font-bold text-slate-900 py-2">
                                        {product.price.toString()} <span className="text-[10px] text-slate-400 font-medium">MAD/{product.unit}</span>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-semibold text-slate-900 py-2">
                                        {product.stockQuantity.toString()} {product.unit}
                                    </TableCell>
                                    <TableCell className="pr-4 py-2 text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-7 text-slate-400 hover:text-slate-900">
                                            <Link href="/dashboard/farmer/products">
                                                Modifier <ArrowUpRightIcon className="size-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    );
}
