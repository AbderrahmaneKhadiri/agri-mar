"use client";

import { useEffect, useState } from "react";
import { getMyProductsAction, deleteProductAction } from "@/actions/products.actions";
import { ProductSelectDTO } from "@/data-access/products.dal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, PackageOpen, Loader2, Edit, Trash2 } from "lucide-react";
import { ProductForm } from "./product-form";
import { cn } from "@/lib/utils";

export default function FarmerProductsPage() {
    const [products, setProducts] = useState<ProductSelectDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductSelectDTO | null>(null);

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[10px] font-bold text-green-600 uppercase tracking-[2px] mb-2">Catalogue</h2>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">MES PRODUITS</h1>
                </div>
                <Button
                    onClick={handleAdd}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold tracking-widest uppercase text-[10px] h-11 px-6 shadow-xl shadow-slate-900/10"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
                        <div>
                            <p className="text-slate-600 font-medium">Votre catalogue est vide.</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Ajoutez vos premiers produits pour vendre au détail
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleAdd}
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        >
                            Créer une offre
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
                            <div className="h-48 bg-slate-100 relative">
                                {product.images?.[0] ? (
                                    <img src={product.images[0] as string} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PackageOpen className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                <div className={cn(
                                    "absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    product.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                                        product.status === "SOLD_OUT" ? "bg-red-100 text-red-700" :
                                            "bg-slate-100 text-slate-700"
                                )}>
                                    {product.status}
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="mb-4">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                                    <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1">{product.name}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Prix</p>
                                        <p className="font-black text-slate-900">{product.price.toString()} MAD <span className="text-xs text-slate-500 font-medium">/ {product.unit}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Stock</p>
                                        <p className="font-bold text-slate-700">{product.stockQuantity.toString()} {product.unit}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 rounded-xl text-slate-600 hover:text-blue-600 border-slate-100 bg-slate-50 hover:bg-slate-100"
                                    >
                                        <Edit className="w-4 h-4 mr-2" /> Modifier
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDelete(product.id)}
                                        className="rounded-xl text-slate-400 hover:text-red-600 border-slate-100 bg-slate-50 hover:bg-red-50"
                                        size="icon"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
        </div>
    );
}
