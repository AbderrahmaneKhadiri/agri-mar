"use client";

import { useEffect, useState } from "react";
import { getMyProductsAction, deleteProductAction } from "@/actions/products.actions";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    PackageOpen,
    Loader2,
    Edit,
    Trash2,
    ChevronDown,
    Filter,
    MoreHorizontal,
    Search,
    CalendarIcon
} from "lucide-react";
import { ProductForm } from "./product-form";
import { cn } from "@/lib/utils";
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FarmerProductsPage() {
    const [products, setProducts] = useState<ProductSelectDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductSelectDTO | null>(null);

    const [selectedTab, setSelectedTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // Memoize unique categories
    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;

        // Tab filtering
        let matchesTab = true;
        if (selectedTab === "critical") {
            matchesTab = Number(p.stockQuantity) < 10;
        } else if (selectedTab === "archives") {
            matchesTab = p.status === "SOLD_OUT" || p.status === "DRAFT";
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesTab;
    });

    const loadProducts = async () => {
        setIsLoading(true);
        const data = await getMyProductsAction();
        setProducts(data as any[]);
        setIsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: ProductSelectDTO) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
        const result = await deleteProductAction(id);
        if (result.success) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert(result.error);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6 pb-12">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE PRODUCTEUR — OFFRES COMMERCIALES</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleAdd}
                        size="sm"
                        className="h-8 text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 gap-1.5 rounded-lg px-4"
                    >
                        <Plus className="size-3.5" />
                        Ajouter un produit
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-border shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)] mb-2">
                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">DYNAMIQUES DE VENTE</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Mes Produits & Offres</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Maximisez vos revenus en diversifiant vos canaux. Vos produits peuvent être destinés à des <strong className="text-slate-700 font-bold underline decoration-emerald-200/50">contrats d&apos;approvisionnement</strong> avec des partenaires industriels ou vendus en <strong className="text-slate-700 font-bold underline decoration-emerald-200/50">direct aux acheteurs locaux</strong> (hôtels, restaurants, marchés).
                </p>
            </div>

            {/* View Controls & Filters Container */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                        <span>Catalogue</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-900 font-semibold">Répertoire Produits</span>
                    </div>
                </div>


                {/* Sub-header Category Tabs */}
                <div className="flex items-center justify-between border-b border-border pb-0">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
                        <TabsList variant="line" className="bg-transparent gap-8 h-auto p-0 border-b-0">
                            <TabsTrigger
                                value="overview"
                                className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all border-none data-[state=active]:text-slate-900"
                            >
                                Vue d&apos;ensemble
                            </TabsTrigger>
                            <TabsTrigger
                                value="critical"
                                className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all flex items-center gap-1.5 border-none data-[state=active]:text-slate-900"
                            >
                                Stocks Critiques
                                {products.filter(p => Number(p.stockQuantity) < 10 && p.status === 'ACTIVE').length > 0 && (
                                    <Badge className="bg-red-50 text-red-600 rounded-full text-[10px] px-1.5 py-0 font-bold border-none ml-1">
                                        {products.filter(p => Number(p.stockQuantity) < 10 && p.status === 'ACTIVE').length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="archives"
                                className="text-[13px] font-semibold text-slate-500 p-0 pb-4 rounded-none bg-transparent shadow-none transition-all border-none data-[state=active]:text-slate-900"
                            >
                                Archives
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-border flex flex-col sm:flex-row gap-2 items-center justify-between mt-2">
                    <div className="relative flex-1 w-full min-w-[200px] group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Rechercher un produit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 border-border bg-white/50 text-[12px] font-medium focus:bg-white transition-all shadow-none rounded-lg w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-8 w-full sm:w-[140px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                {uniqueCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-8 w-full sm:w-[120px] bg-white/50 border-border shadow-none text-[12px] font-medium rounded-lg">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="ACTIVE">En vente</SelectItem>
                                <SelectItem value="SOLD_OUT">Épuisé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="border border-border border-dashed rounded-xl bg-slate-50/50 min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <p className="text-[14px] font-semibold text-slate-900">Aucun produit trouvé</p>
                            <p className="text-[12px] text-slate-500 font-medium">Commencez par ajouter votre premier produit au catalogue.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleAdd}
                            className="h-9 text-[11px] font-bold text-slate-900 border-border"
                        >
                            Créer une offre
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-border hover:bg-transparent h-10">
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox className="translate-y-[2px] border-border data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight pl-0">Produit</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Catégorie</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Prix (MAD)</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Stock</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Statut</TableHead>
                                <TableHead className="w-[80px] text-right pr-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id} className="border-slate-50 hover:bg-slate-50/20 h-11 group">
                                    <TableCell className="px-4 py-2">
                                        <Checkbox className="translate-y-[2px] border-border data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 group-hover:border-border transition-colors" />
                                    </TableCell>
                                    <TableCell className="pl-0 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded-lg ring-1 ring-slate-100">
                                                <AvatarImage src={product.images?.[0] as string || undefined} />
                                                <AvatarFallback className="text-[10px] font-bold bg-slate-50">
                                                    <PackageOpen className="size-3 text-slate-300" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-[13px] text-slate-900">{product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium py-2">
                                        {product.category}
                                    </TableCell>
                                    <TableCell className="text-[12px] font-bold text-slate-900 py-2">
                                        {product.price.toString()} <span className="text-[10px] text-slate-400 font-medium">/{product.unit}</span>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-semibold text-slate-900 py-2">
                                        {product.stockQuantity.toString()} {product.unit}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                            product.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" :
                                                product.status === "SOLD_OUT" ? "bg-red-50 text-red-600" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>
                                            {product.status === "ACTIVE" ? "En vente" : "Épuisé"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-4 py-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-border w-40">
                                                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(product)} className="text-[12px] font-semibold text-slate-700 py-2 cursor-pointer">
                                                    <Edit className="size-3.5 mr-2 text-slate-400" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-[12px] font-semibold text-red-600 py-2 cursor-pointer hover:bg-red-50">
                                                    <Trash2 className="size-3.5 mr-2" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    loadProducts();
                }}
                product={selectedProduct}
            />
        </main>
    );
}
