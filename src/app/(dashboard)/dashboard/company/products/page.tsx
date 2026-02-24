"use client";

import { useEffect, useState, useCallback } from "react";
import { getMarketProductsAction } from "@/actions/products.actions";
import { requestConnectionAction } from "@/actions/networking.actions";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, PackageOpen, Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const CATEGORIES = ["Toutes", "Legumes", "Fruits", "Cereales", "Autres"];

export default function MarketplaceProductsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isContacting, setIsContacting] = useState<string | null>(null);

    const loadProducts = async () => {
        setIsLoading(true);
        const category = searchParams.get('category') || "Toutes";
        const search = searchParams.get('search') || "";

        const data = await getMarketProductsAction({ category, search });
        setProducts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, [searchParams]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== "" && value !== "Toutes") {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const updateFilters = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value), { scroll: false });
    };

    const handleContactSeller = async (farmerId: string, productName: string) => {
        setIsContacting(farmerId);

        // 1. Demande de connexion (si elle n'existe pas déjà, sera géré par l'action)
        await requestConnectionAction({ targetId: farmerId });

        // 2. Redirection vers la messagerie avec peut-être un message pré-rempli dans le futur
        // Pour l'instant, on redirige juste vers la page de messagerie
        router.push(`/dashboard/company/messages`);

        setIsContacting(null);
    };

    return (
        <div className="space-y-6 min-h-[800px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[10px] font-bold text-green-600 uppercase tracking-[2px] mb-2">Achat direct</h2>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">CATALOGUE PRODUITS</h1>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un produit..."
                            className="bg-white border-none shadow-sm pl-10 w-[250px] rounded-xl h-11"
                            defaultValue={searchParams.get('search') || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                const timeoutId = setTimeout(() => updateFilters('search', val), 500);
                                return () => clearTimeout(timeoutId);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {CATEGORIES.map(cat => {
                    const isActive = (searchParams.get('category') || "Toutes") === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => updateFilters('category', cat)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-widest",
                                isActive
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm"
                            )}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <PackageOpen className="w-12 h-12 text-slate-300 mx-auto opacity-50" />
                        <p className="text-slate-500 font-medium">Aucun produit ne correspond à votre recherche.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                            {/* Product Image */}
                            <div className="h-56 bg-slate-100 relative overflow-hidden">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PackageOpen className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-[9px] font-black uppercase tracking-widest text-slate-900">
                                    {product.category}
                                </div>
                            </div>

                            {/* Product Details */}
                            <CardContent className="p-5 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1 mb-2">{product.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{product.description}</p>

                                    <div className="flex items-end justify-between mb-4 pb-4 border-b border-slate-50">
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Prix unitaire</p>
                                            <p className="font-black text-green-600 text-xl">{product.price.toString()} <span className="text-xs text-green-700/70">MAD/{product.unit}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Dispo.</p>
                                            <p className="font-bold text-slate-700">{product.stockQuantity.toString()} {product.unit}</p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">Min: {product.minOrderQuantity.toString()} {product.unit}</p>
                                        </div>
                                    </div>

                                    {/* Farmer Info */}
                                    <div className="flex items-center gap-3 mb-6 bg-slate-50 p-2.5 rounded-2xl">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100/50">
                                            <AvatarImage src={product.farmer?.avatarUrl} />
                                            <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">{product.farmer?.fullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">{product.farmer?.fullName}</p>
                                            <div className="flex items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                <MapPin className="h-3 w-3 mr-1" /> {product.farmer?.region}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl h-11 text-xs font-bold tracking-widest uppercase transition-all"
                                    onClick={() => handleContactSeller(product.farmer?.id, product.name)}
                                    disabled={isContacting === product.farmer?.id}
                                >
                                    {isContacting === product.farmer?.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Contacter
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
