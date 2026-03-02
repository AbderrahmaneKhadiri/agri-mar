"use client";

import { useState } from "react";
import { PartnerDTO, IncomingRequestDTO } from "@/data-access/connections.dal";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { ProductDetailModal } from "@/components/dashboard/company/product-detail-modal";
import { initiateProductInquiryAction } from "@/actions/contact-direct.actions";
import { useRouter } from "next/navigation";
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
    Search,
    User,
    Building2,
    ShieldCheck,
    Truck,
    Store,
    PackageSearch,
    Factory,
    Scale,
    Receipt,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    ArrowUpRightIcon,
    MapPin,
    Tractor,
    Globe,
    ShoppingBag,
    Flag
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { calculateCompanyScore } from "@/lib/utils/profile-score";

interface CompanyProfile {
    id: string;
    companyName: string;
    companyType: string | null;
    city: string;
    industry: string;
    establishedYear: number;
    iceNumber: string | null;
    rcNumber: string | null;
    purchasingCapacity: string;
    partnershipType: string;
    phone: string;
    businessEmail: string;
    website?: string | null;
    desiredProducts: string[];
    avgDesiredQuantity: string;
    marketType: string;
    exportCountries: string[];
    requiredCertifications: string[];
    targetRegions: string[];
    logoUrl?: string | null;
}

interface CompanyDashboardClientProps {
    companyProfile: CompanyProfile;
    initialSuppliers: PartnerDTO[];
    initialMarketOffers: (ProductSelectDTO & { farmer: any })[];
    initialRequests: IncomingRequestDTO[];
    userImage?: string | null;
}

export function CompanyDashboardClient({
    companyProfile,
    initialSuppliers,
    initialMarketOffers,
    initialRequests,
    userImage
}: CompanyDashboardClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("suppliers");
    const [searchQuery, setSearchQuery] = useState("");

    // Product Detail Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isContacting, setIsContacting] = useState<string | null>(null);

    const handleViewProductDetail = (product: any) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleContactSeller = async (product: any) => {
        const farmerId = product.farmer?.id;
        if (!farmerId || isContacting) return;

        setIsContacting(product.id);
        const result = await initiateProductInquiryAction({
            farmerId,
            product
        });

        if (result.error) {
            alert(result.error);
            setIsContacting(null);
        } else {
            router.push(`/dashboard/company/messages`);
        }
    };

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
                        <TabsTrigger
                            value="profile"
                            className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-slate-900 border-none ml-4"
                        >
                            Mon Profil
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
                            className="h-8 pl-8 text-[12px] bg-slate-50/50 border-border focus:bg-white transition-all shadow-none"
                        />
                    </div>
                </div>
            </div>

            {activeTab === "profile" ? (
                <div className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Company Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-border p-6">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Building2 className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Identité Corporate</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{companyProfile.companyName}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-500">
                                        Type: {companyProfile.companyType} • {companyProfile.city}
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
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siège Social</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.city}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Factory className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secteur</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.industry}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Calendar className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Année Création</div>
                                                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{companyProfile.establishedYear}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                                                    <Scale className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conformité</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        <Badge className="bg-slate-900 text-white hover:bg-slate-800 border-none font-bold text-[10px] uppercase">ICE: {companyProfile.iceNumber}</Badge>
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none font-bold text-[10px] uppercase">RC: {companyProfile.rcNumber}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-border p-6">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <PackageSearch className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Stratégie Sourcing</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Besoins & Logistique</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Volume Annuel</div>
                                                <div className="p-4 rounded-xl bg-slate-50 border border-border">
                                                    <div className="text-[15px] font-semibold text-slate-900">{companyProfile.purchasingCapacity}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Capacité d&apos;achat estimée</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Type de Partenariat</div>
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-border">
                                                    {companyProfile.partnershipType === "Spot Buy" ? (
                                                        <>
                                                            <Store className="size-4 text-slate-600" />
                                                            <div className="text-[13px] font-bold text-slate-900">Achats "Spot"</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Receipt className="size-4 text-slate-600" />
                                                            <div className="text-[13px] font-bold text-slate-900">Contrats Directs</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Sourcing</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                            <Phone className="size-3.5" />
                                                        </div>
                                                        <div className="text-[13px] font-bold text-slate-900 tabular-nums">{companyProfile.phone}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                            <Mail className="size-3.5" />
                                                        </div>
                                                        <div className="text-[13px] font-bold text-slate-900">{companyProfile.businessEmail}</div>
                                                    </div>
                                                    {companyProfile.website && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                                <Globe className="size-3.5" />
                                                            </div>
                                                            <div className="text-[13px] font-bold text-slate-900 truncate">
                                                                <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                    {companyProfile.website.replace(/^https?:\/\//, '')}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-border p-6">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <ShoppingBag className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Activité & Marché</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Besoins Spécifiques</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Produits Recherchés</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(companyProfile.desiredProducts) && companyProfile.desiredProducts.length > 0 ? (
                                                        companyProfile.desiredProducts.map((p: string) => (
                                                            <Badge key={p} variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                                                {p}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[13px] font-medium text-slate-500 italic">Non spécifié</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quantité Moyenne</div>
                                                <div className="text-[14px] font-semibold text-slate-900">{companyProfile.avgDesiredQuantity || "Non spécifiée"}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Portée du Marché</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-none">
                                                            {companyProfile.marketType === "BOTH" ? "Local & International" : companyProfile.marketType}
                                                        </Badge>
                                                    </div>
                                                    {Array.isArray(companyProfile.exportCountries) && companyProfile.exportCountries.length > 0 && (
                                                        <div className="flex items-start gap-2 pt-1">
                                                            <Flag className="size-3.5 text-slate-400 mt-0.5" />
                                                            <div className="text-[12px] font-medium text-slate-600">
                                                                Pays d&apos;export: {companyProfile.exportCountries.join(", ")}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Certifications Requises</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(companyProfile.requiredCertifications) && companyProfile.requiredCertifications.length > 0 ? (
                                                        companyProfile.requiredCertifications.map((c: string) => (
                                                            <Badge key={c} variant="outline" className="border-border text-slate-500 font-bold text-[9px] uppercase">
                                                                {c}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[13px] font-medium text-slate-500 italic">Aucune exigence</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Company Summary */}
                        <div className="space-y-6">
                            <Card className="border-border shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-8 text-center space-y-4">
                                    <Avatar className="mx-auto w-24 h-24 ring-4 ring-slate-100 shadow-sm">
                                        <AvatarImage src={companyProfile.logoUrl || userImage || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-slate-50 text-slate-300 text-2xl font-black">
                                            {companyProfile.companyName?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {calculateCompanyScore(companyProfile) >= 80 ? "Acheteur Certifié" : "Acheteur Business"}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">Actif sur Agri-Mar</p>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Régions Cibles</div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {Array.isArray(companyProfile.targetRegions) && companyProfile.targetRegions.length > 0 ? companyProfile.targetRegions.map((region: string) => (
                                                <Badge key={region} className="bg-slate-900 text-white hover:bg-slate-800 border-none font-bold text-[9px] uppercase tracking-tighter">{region}</Badge>
                                            )) : <span className="text-[12px] font-medium text-slate-400 italic">Toutes les régions</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="border border-border rounded-xl p-5 bg-white border-l-2 border-l-black">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="size-4 text-slate-700" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                        {calculateCompanyScore(companyProfile) >= 80 ? "Compte Certifié" : "Score de Confiance"}
                                    </span>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                                    {calculateCompanyScore(companyProfile) >= 80
                                        ? "Votre badge \"Confiance B2B\" est actif. Il rassure les producteurs sur votre sérieux."
                                        : "Vérifiez votre ICE et votre RC pour obtenir le badge de confiance Agri-Mar."}
                                </p>
                                {calculateCompanyScore(companyProfile) >= 80 && (
                                    <Button size="sm" className="w-full text-[13px]">
                                        Télécharger Attestation
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm min-h-[400px]">
                    <Table>
                        <TableHeader className="bg-slate-50/50 font-bold">
                            <TableRow className="border-border hover:bg-transparent h-10">
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
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-border text-[10px] font-bold rounded-full">Actif</Badge>
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
                                    <TableRow
                                        key={m.id}
                                        className="border-slate-50 hover:bg-slate-50/20 h-14 cursor-pointer"
                                        onClick={() => handleViewProductDetail(m)}
                                    >
                                        <TableCell className="pl-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8 rounded-lg border border-border">
                                                    <AvatarImage src={m.images?.[0] || undefined} className="object-cover" />
                                                    <AvatarFallback className="bg-slate-50">
                                                        <Tractor className="size-4 text-slate-400" />
                                                    </AvatarFallback>
                                                </Avatar>
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
                                            <Badge variant="outline" className="bg-slate-50 border-border text-slate-600 text-[10px] font-bold rounded-full">{m.category}</Badge>
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
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border-none">En attente</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ProductDetailModal
                isOpen={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
                product={selectedProduct}
                onContactSeller={handleContactSeller}
                isContacting={isContacting === selectedProduct?.id}
            />
        </div>
    );
}
