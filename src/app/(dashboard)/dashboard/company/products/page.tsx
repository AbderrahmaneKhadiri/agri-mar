"use client";

import { useEffect, useState, useCallback } from "react";
import { getMarketProductsAction } from "@/actions/products.actions";
import { requestConnectionAction } from "@/actions/networking.actions";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    MapPin,
    PackageOpen,
    Loader2,
    MessageSquare,
    ChevronDown,
    Filter,
    Plus,
    LayoutGrid,
    List,
    MoreHorizontal,
    ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["Toutes", "Legumes", "Fruits", "Cereales", "Autres"];

export default function MarketplaceProductsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isContacting, setIsContacting] = useState<string | null>(null);

    // Local filter state for the new "complet" filter bar
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [selectedCrop, setSelectedCrop] = useState("all");

    const loadProducts = async () => {
        setIsLoading(true);
        // Fetch all products to allow snappy client-side filtering via the new UI
        const data = await getMarketProductsAction({});
        setProducts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const updateFilters = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "" && value !== "Toutes") {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        router.push(pathname + '?' + params.toString(), { scroll: false });
    }, [router, pathname, searchParams]);

    const handleContactSeller = async (farmerId: string) => {
        setIsContacting(farmerId);
        await requestConnectionAction({ targetId: farmerId });
        router.push(`/dashboard/company/messages`);
        setIsContacting(null);
    };

    const uniqueRegions = Array.from(new Set(
        products.map(p => p.farmer?.region).filter(Boolean)
    )).sort();

    const uniqueCrops = Array.from(new Set(
        products.map(p => p.name).filter(Boolean)
    )).sort();

    const currentTabCategory = searchParams.get('category') || "Toutes";

    const filteredProducts = products.filter(p => {
        // Tab Category Filter
        if (currentTabCategory !== "Toutes" && p.category !== currentTabCategory) return false;

        // Search Query Filter
        if (localSearchQuery) {
            const query = localSearchQuery.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(query) ||
                (p.farmer?.fullName || "").toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Region Filter
        if (selectedRegion !== "all" && p.farmer?.region !== selectedRegion) return false;

        // Crop Filter (using product name as 'culture' for marketplace)
        if (selectedCrop !== "all" && p.name !== selectedCrop) return false;

        return true;
    });

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE ACHETEUR — CENTRE DE COMMANDE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">MON ENTREPRISE</span>
                    <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">CERTIFIÉ</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">SOURCING STRATÉGIQUE</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Catalogue Produits</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Accédez aux catalogues complets de nos producteurs. Si vous souhaitez <strong className="text-slate-700 font-bold underline decoration-blue-200/50">acheter en petite quantité</strong>, vous pouvez contacter directement le vendeur pour négocier des conditions flexibles et un approvisionnement sur-mesure.
                </p>
            </div>

            {/* Header contextuel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Catalogue</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Catalogue Produits</span>
                </div>
            </div>

            {/* Sub-header Content */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                {/* Category Tabs */}
                <div className="flex items-center gap-6">
                    {CATEGORIES.map(cat => {
                        const isActive = currentTabCategory === cat;
                        return (
                            <span
                                key={cat}
                                onClick={() => updateFilters('category', cat)}
                                className={cn(
                                    "text-[13px] font-semibold cursor-pointer pb-2 transition-all border-b-2",
                                    isActive ? "text-slate-900 border-slate-900" : "text-slate-500 hover:text-slate-900 border-transparent"
                                )}
                            >
                                {cat}
                            </span>
                        );
                    })}
                </div>

                {/* Main Search and Filter Bar */}
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col xl:flex-row items-start xl:items-center gap-2 w-full">
                    <div className="relative flex-1 w-full min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un agriculteur ou un produit..."
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 shadow-sm h-10 pl-9 rounded-lg text-[13px] hover:border-slate-300 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="hidden xl:block w-px h-6 bg-slate-200 mx-1" />

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-slate-200 shadow-sm rounded-lg text-[13px] font-medium text-slate-700 hover:border-slate-300">
                                <SelectValue placeholder="Toutes les régions" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                <SelectItem value="all" className="text-[13px] font-medium cursor-pointer">Toutes les régions</SelectItem>
                                {uniqueRegions.map(region => (
                                    <SelectItem key={region as string} value={region as string} className="text-[13px] font-medium cursor-pointer">
                                        {region as string}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-slate-200 shadow-sm rounded-lg text-[13px] font-medium text-slate-700 hover:border-slate-300">
                                <SelectValue placeholder="Toutes les cultures" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                <SelectItem value="all" className="text-[13px] font-medium cursor-pointer">Toutes les cultures</SelectItem>
                                {uniqueCrops.map(crop => (
                                    <SelectItem key={crop as string} value={crop as string} className="text-[13px] font-medium cursor-pointer">
                                        {crop as string}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-slate-200 animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="border border-slate-200 border-dashed rounded-xl bg-slate-50/50 min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <PackageOpen className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-[14px] font-semibold text-slate-900">Aucun produit ne correspond à vos filtres</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden bg-white group">
                            {/* Product Image Section */}
                            <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <PackageOpen className="size-12 text-slate-200" />
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 border-none text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                                        {product.category}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-4 space-y-4">
                                {/* Seller & Basic Info */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[15px] text-slate-900 truncate leading-tight mb-1">{product.name}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <MapPin className="size-3" />
                                            <span className="text-[11px] font-medium truncate">{product.farmer?.region}</span>
                                        </div>
                                    </div>
                                    <Avatar className="size-8 rounded-full ring-2 ring-white shadow-sm shrink-0">
                                        <AvatarImage src={product.farmer?.avatarUrl || undefined} />
                                        <AvatarFallback className="text-[10px] font-bold bg-slate-100">
                                            {product.farmer?.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* Price & Stock */}
                                <div className="pt-2 border-t border-slate-50 flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix Unitaire</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-slate-900">{product.price.toString()}</span>
                                            <span className="text-[10px] font-semibold text-slate-400">MAD/{product.unit}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Dispo</span>
                                        <span className="text-[12px] font-bold text-slate-700">{product.stockQuantity.toString()} {product.unit}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50/80 text-[10px] font-semibold text-slate-500">
                                        <span>Min commande:</span>
                                        <span className="text-slate-900">{product.minOrderQuantity.toString()} {product.unit}</span>
                                    </div>
                                    <Button
                                        onClick={() => handleContactSeller(product.farmer?.id)}
                                        disabled={isContacting === product.farmer?.id}
                                        className="w-full h-10 font-semibold"
                                    >
                                        {isContacting === product.farmer?.id ? <Loader2 className="size-4 animate-spin" /> : "Contacter le vendeur"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
