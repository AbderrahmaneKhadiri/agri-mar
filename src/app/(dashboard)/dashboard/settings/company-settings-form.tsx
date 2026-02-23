"use client";

import { useState } from "react";
import { updateCompanyProfileAction } from "@/actions/profile.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, CheckCircle2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompanySettingsForm({ profile }: { profile: any }) {
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    // Local state for complex array fields
    const [desiredProducts, setDesiredProducts] = useState<string[]>(profile.desiredProducts || []);
    const [targetRegions, setTargetRegions] = useState<string[]>(profile.targetRegions || []);

    const [newProduct, setNewProduct] = useState("");
    const [newRegion, setNewRegion] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage(null);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const payload = {
            ...data,
            desiredProducts,
            targetRegions,
            establishedYear: parseInt(data.establishedYear as string),
        };

        const result = await updateCompanyProfileAction(payload);

        if (result.success) {
            setSuccessMessage("Profil entreprise mis à jour !");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else if (result.error) {
            setErrors(result.fields || { global: result.error });
        }
        setIsSaving(false);
    };

    const addProduct = () => {
        if (newProduct.trim() && !desiredProducts.includes(newProduct.trim())) {
            setDesiredProducts([...desiredProducts, newProduct.trim()]);
            setNewProduct("");
        }
    };

    const addRegion = () => {
        if (newRegion.trim() && !targetRegions.includes(newRegion.trim())) {
            setTargetRegions([...targetRegions, newRegion.trim()]);
            setNewRegion("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuration Entreprise</h1>
                    <p className="text-slate-500 mt-2">Gérez votre présence sur le marché et vos critères de sourcing.</p>
                </div>
                {successMessage && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-2 flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-right-4">
                        <CheckCircle2 className="h-4 w-4" /> {successMessage}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="business" className="w-full">
                    <TabsList className="bg-slate-100/50 p-1 mb-6 rounded-2xl h-14">
                        <TabsTrigger value="business" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Identité B2B</TabsTrigger>
                        <TabsTrigger value="sourcing" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Sourcing & Marché</TabsTrigger>
                        <TabsTrigger value="contact" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Coordonnées</TabsTrigger>
                    </TabsList>

                    <TabsContent value="business" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">ENTITÉ COMMERCIALE</CardTitle>
                                <CardDescription>Informations officielles de votre entreprise.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="companyName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dénomination Sociale</Label>
                                        <Input id="companyName" name="companyName" defaultValue={profile.companyName} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="industry" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secteur d'activité</Label>
                                        <Input id="industry" name="industry" defaultValue={profile.industry} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="establishedYear" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Année de création</Label>
                                        <Input id="establishedYear" name="establishedYear" type="number" defaultValue={profile.establishedYear} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siège (Pays)</Label>
                                        <Input id="country" name="country" defaultValue={profile.country} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siège (Ville)</Label>
                                        <Input id="city" name="city" defaultValue={profile.city} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sourcing" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">BESOINS & STRATÉGIE</CardTitle>
                                <CardDescription>Définissez les produits et zones que vous ciblez.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRODUITS RECHERCHÉS</Label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
                                        {desiredProducts.map(p => (
                                            <Badge key={p} className="bg-blue-900 text-white pl-4 pr-2 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-all shadow-sm">
                                                {p}
                                                <button type="button" onClick={() => setDesiredProducts(desiredProducts.filter(x => x !== p))} className="p-1 hover:bg-white/20 rounded-md"><X className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="Ajouter un produit..." value={newProduct} onChange={(e) => setNewProduct(e.target.value)} className="h-12 rounded-xl" />
                                        <Button type="button" onClick={addProduct} className="h-12 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-lg shadow-blue-900/10">Ajouter</Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RÉGIONS CIBLÉES</Label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
                                        {targetRegions.map(r => (
                                            <Badge key={r} className="bg-slate-100 text-slate-700 pl-4 pr-2 py-2 rounded-xl flex items-center gap-2 border-none">
                                                {r}
                                                <button type="button" onClick={() => setTargetRegions(targetRegions.filter(x => x !== r))} className="p-1 hover:bg-slate-200 rounded-md text-slate-400"><X className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="Ajouter une région..." value={newRegion} onChange={(e) => setNewRegion(e.target.value)} className="h-12 rounded-xl" />
                                        <Button type="button" onClick={addRegion} className="h-12 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-sm">Ajouter</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">CONTACT & WEB</CardTitle>
                                <CardDescription>Comment les partenaires peuvent vous joindre.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessEmail" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email d'achat</Label>
                                        <Input id="businessEmail" name="businessEmail" type="email" defaultValue={profile.businessEmail} className="h-12 rounded-xl bg-slate-50 border-none font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone Professional</Label>
                                        <Input id="phone" name="phone" defaultValue={profile.phone} className="h-12 rounded-xl bg-slate-50 border-none font-medium" />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="website" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Web / Portfolio B2B</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input id="website" name="website" defaultValue={profile.website} className="h-12 rounded-xl bg-slate-50 border-none pl-12 font-medium" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-10 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-[2px] shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                    >
                        {isSaving ? (
                            <><Loader2 className="h-4 w-4 mr-3 animate-spin" /> ENREGISTREMENT...</>
                        ) : (
                            "SAUVEGARDER LES MODIFICATIONS"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
