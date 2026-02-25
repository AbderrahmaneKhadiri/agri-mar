"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, ArrowUpRightIcon, MapPin, Droplets, Building2, LandPlot, ShieldCheck, Waves, Truck, Store, LayoutGrid, Phone, Mail, Globe, Calendar, Briefcase, Boxes, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { IncomingRequestDTO, PartnerDTO } from "@/data-access/connections.dal";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { calculateFarmerScore } from "@/lib/utils/profile-score";

interface FarmerDashboardTabsProps {
    profile: any;
    initialRequests: IncomingRequestDTO[];
    initialPartners: PartnerDTO[];
    initialProducts: ProductSelectDTO[];
}

export function FarmerDashboardTabs({
    profile,
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
                        <TabsTrigger
                            value="profile"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all border-none data-[state=active]:text-slate-900"
                        >
                            Mon Profil
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

                <TabsContent value="profile" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Farm Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <LandPlot className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Informations Exploitation</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{profile.farmName}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-500">
                                        {profile.farmLocation}, {profile.city}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <MapPin className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Localisation</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.city}, {profile.region}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Waves className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Irrigation</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {Array.isArray(profile.irrigationType) ? profile.irrigationType.map((t: string) => (
                                                            <Badge key={t} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[10px] uppercase">{t}</Badge>
                                                        )) : <span className="text-[13px] font-semibold text-slate-900">{profile.irrigationType || "Non spécifié"}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Zap className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Méthodes de Culture</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {Array.isArray(profile.farmingMethods) && profile.farmingMethods.length > 0 ? profile.farmingMethods.map((m: string) => (
                                                            <Badge key={m} variant="outline" className="border-emerald-100 text-emerald-600 font-bold text-[10px] uppercase">{m}</Badge>
                                                        )) : <span className="text-[13px] font-medium text-slate-400 italic">Non spécifié</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Building2 className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taille Exploitation</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.totalArea} Hectares</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <ShieldCheck className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certifications</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {profile.onssaCert && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-bold text-[10px] uppercase">ONSSA: {profile.onssaCert}</Badge>}
                                                        {Array.isArray(profile.certifications) && profile.certifications.length > 0 ? profile.certifications.map((c: string) => (
                                                            <Badge key={c} variant="secondary" className="bg-slate-50 text-slate-600 hover:bg-slate-50 border-none font-bold text-[10px] uppercase">{c}</Badge>
                                                        )) : !profile.onssaCert && <span className="text-[13px] font-medium text-slate-500 italic">Aucune certification</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {profile.livestockType && (
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                        <Briefcase className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Élevage</div>
                                                        <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{profile.livestockType}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                                        <Boxes className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Production & Disponibilité</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Capacités de Production</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Volume de Production</div>
                                                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                                                    <div className="text-[15px] font-bold text-amber-900">{profile.avgAnnualProduction}</div>
                                                    <div className="text-[10px] font-bold text-amber-600 uppercase mt-1">Production Annuelle Moyenne</div>
                                                </div>
                                                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="text-[13px] font-bold text-slate-700">{profile.availableProductionVolume}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Volume Actuellement Disponible</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Saisonnalité</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(profile.seasonAvailability) && profile.seasonAvailability.length > 0 ? profile.seasonAvailability.map((month: string) => (
                                                        <Badge key={month} variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[9px] uppercase">{month}</Badge>
                                                    )) : <span className="text-[13px] font-medium text-slate-400 italic">Toute l&apos;année</span>}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Export</span>
                                                    <Badge variant={profile.exportCapacity ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase", profile.exportCapacity ? "bg-blue-500" : "bg-slate-100 text-slate-400")}>
                                                        {profile.exportCapacity ? "CAPABLE" : "NON"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Logistique</span>
                                                    <Badge variant={profile.logisticsCapacity ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase", profile.logisticsCapacity ? "bg-blue-500" : "bg-slate-100 text-slate-400")}>
                                                        {profile.logisticsCapacity ? "OUI" : "NON"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">Contrat Long Terme</span>
                                                    <Badge variant={profile.longTermContractAvailable ? "default" : "secondary"} className={cn("text-[9px] font-bold uppercase", profile.longTermContractAvailable ? "bg-emerald-500" : "bg-slate-100 text-slate-400")}>
                                                        {profile.longTermContractAvailable ? "DISPONIBLE" : "NON"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <Building2 className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Modèle Économique & Logistique</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Capacités Commerciales</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Modes de Vente</div>
                                                <div className="space-y-2">
                                                    {Array.isArray(profile.businessModel) && profile.businessModel.includes("Direct Sales") && (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                                            <Store className="size-4 text-emerald-600" />
                                                            <div className="text-[13px] font-bold text-slate-900">Vente Directe (Au Kilo)</div>
                                                        </div>
                                                    )}
                                                    {Array.isArray(profile.businessModel) && profile.businessModel.includes("Contracts") && (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                                            <LayoutGrid className="size-4 text-blue-600" />
                                                            <div className="text-[13px] font-bold text-slate-900">Contrats (Industriel)</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Options Logistiques</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                                            <Truck className="size-4 text-slate-400" /> Livraison
                                                        </div>
                                                        <Badge variant={profile.deliveryCapacity ? "default" : "secondary"} className={cn("text-[10px] font-bold uppercase", profile.deliveryCapacity ? "bg-emerald-500" : "bg-slate-100 text-slate-400")}>
                                                            {profile.deliveryCapacity ? "OUI" : "NON"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                                            <Droplets className="size-4 text-slate-400" /> Froid
                                                        </div>
                                                        <Badge variant={profile.hasColdStorage ? "default" : "secondary"} className={cn("text-[10px] font-bold uppercase", profile.hasColdStorage ? "bg-emerald-500" : "bg-slate-100 text-slate-400")}>
                                                            {profile.hasColdStorage ? "OUI" : "NON"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Producer Summary */}
                        <div className="space-y-6">
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center ring-4 ring-slate-100">
                                        <Building2 className="size-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
                                        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{profile.iceNumber || "Sans ICE"}</p>
                                    </div>
                                    <div className="pt-4 flex flex-wrap justify-center gap-2">
                                        {Array.isArray(profile.cropTypes) && profile.cropTypes.map((crop: string) => (
                                            <Badge key={crop} className="bg-slate-900 text-white hover:bg-slate-800 border-none font-bold text-[9px] uppercase tracking-tighter">{crop}</Badge>
                                        ))}
                                    </div>
                                    <div className="pt-6 space-y-4 text-left border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                                <Phone className="size-3.5" />
                                            </div>
                                            <div className="text-[13px] font-bold text-slate-900 tabular-nums">{profile.phone}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                                <Mail className="size-3.5" />
                                            </div>
                                            <div className="text-[13px] font-bold text-slate-900 transition-all truncate hover:text-emerald-600">{profile.businessEmail}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={cn(
                                "border-none shadow-xl shadow-emerald-100 p-8 text-white relative overflow-hidden group",
                                calculateFarmerScore(profile) >= 80 ? "bg-emerald-900" : "bg-slate-900"
                            )}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="size-24" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">
                                    {calculateFarmerScore(profile) >= 80 ? "Statut Vérifié" : "Profil Essentiel"}
                                </h3>
                                <p className="text-emerald-100/80 text-[13px] leading-relaxed mb-6 font-medium">
                                    {calculateFarmerScore(profile) >= 80
                                        ? "Votre profil est certifié Agry-Mar. Vous avez accès aux contrats institutionnels."
                                        : "Complétez votre ICE et vos certifications pour accéder aux contrats industriels."}
                                </p>
                                {calculateFarmerScore(profile) < 80 && (
                                    <Button className="w-full bg-white text-slate-900 hover:bg-emerald-50 font-bold rounded-xl h-12 text-[13px]">
                                        Augmenter mon Score
                                    </Button>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
