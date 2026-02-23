"use client";

import { useState } from "react";
import { updateFarmerProfileAction } from "@/actions/profile.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addFarmerPhotoAction, deleteFarmerPhotoAction } from "@/actions/social.actions";

export function FarmerSettingsForm({ profile, initialPhotos = [] }: { profile: any, initialPhotos?: any[] }) {
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [photos, setPhotos] = useState<any[]>(initialPhotos);
    const [newPhotoUrl, setNewPhotoUrl] = useState("");
    const [isAddingPhoto, setIsAddingPhoto] = useState(false);

    // Local state for complex array fields
    const [cropTypes, setCropTypes] = useState<string[]>(profile.cropTypes || []);
    const [newCrop, setNewCrop] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage(null);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Manual fields
        const payload = {
            ...data,
            cropTypes,
        };

        const result = await updateFarmerProfileAction(payload);

        if (result.success) {
            setSuccessMessage("Profil mis à jour avec succès !");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else if (result.error) {
            setErrors(result.fields || { global: result.error });
        }
        setIsSaving(false);
    };

    const addCrop = () => {
        if (newCrop.trim() && !cropTypes.includes(newCrop.trim())) {
            setCropTypes([...cropTypes, newCrop.trim()]);
            setNewCrop("");
        }
    };

    const removeCrop = (crop: string) => {
        setCropTypes(cropTypes.filter(c => c !== crop));
    };

    const handleAddPhoto = async () => {
        if (!newPhotoUrl.trim()) return;
        setIsAddingPhoto(true);
        const result = await addFarmerPhotoAction(newPhotoUrl);
        if (result.success) {
            setPhotos([{ url: newPhotoUrl, createdAt: new Date() }, ...photos]);
            setNewPhotoUrl("");
            setSuccessMessage("Photo ajoutée !");
            setTimeout(() => setSuccessMessage(null), 3000);
        }
        setIsAddingPhoto(false);
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm("Supprimer cette photo ?")) return;
        const result = await deleteFarmerPhotoAction(photoId);
        if (result.success) {
            setPhotos(photos.filter(p => p.id !== photoId));
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres du Profil</h1>
                    <p className="text-slate-500 mt-2">Gérez les informations de votre exploitation et vos spécialités.</p>
                </div>
                {successMessage && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-2 flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-right-4">
                        <CheckCircle2 className="h-4 w-4" /> {successMessage}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-slate-100/50 p-1 mb-6 rounded-2xl h-14">
                        <TabsTrigger value="general" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Exploitation</TabsTrigger>
                        <TabsTrigger value="crops" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Cultures & Spécialités</TabsTrigger>
                        <TabsTrigger value="gallery" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Galerie Photo</TabsTrigger>
                        <TabsTrigger value="contact" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">Contact B2B</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">INFORMATIONS GÉNÉRALES</CardTitle>
                                <CardDescription>Identité de votre ferme et localisation.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom complet du responsable</Label>
                                        <Input id="fullName" name="fullName" defaultValue={profile.fullName} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                        {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="farmName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de l'exploitation</Label>
                                        <Input id="farmName" name="farmName" defaultValue={profile.farmName} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="region" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Région</Label>
                                        <Input id="region" name="region" defaultValue={profile.region} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ville</Label>
                                        <Input id="city" name="city" defaultValue={profile.city} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="totalAreaHectares" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surface totale (Ha)</Label>
                                        <Input id="totalAreaHectares" name="totalAreaHectares" type="number" step="0.1" defaultValue={profile.totalAreaHectares} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="crops" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">VOTRE CATALOGUE</CardTitle>
                                <CardDescription>Quelles cultures produisez-vous actuellement ?</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CULTURES ACTUELLES (Tags)</Label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl min-h-[60px]">
                                        {cropTypes.map(crop => (
                                            <Badge key={crop} className="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm">
                                                {crop}
                                                <button type="button" onClick={() => removeCrop(crop)} className="p-1 hover:bg-white/20 rounded-md transition-colors"><X className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                        {cropTypes.length === 0 && <span className="text-xs text-slate-400 mt-1 font-medium italic">Ajoutez vos premières cultures...</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ex: Tomates, Clémentines..."
                                            value={newCrop}
                                            onChange={(e) => setNewCrop(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                                            className="h-12 rounded-xl bg-white border border-slate-200 focus-visible:ring-slate-900/10 transition-all font-medium"
                                        />
                                        <Button type="button" onClick={addCrop} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition-all shadow-lg shadow-slate-900/10">
                                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="avgAnnualProduction" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacité de production annuelle</Label>
                                        <Input id="avgAnnualProduction" name="avgAnnualProduction" defaultValue={profile.avgAnnualProduction} placeholder="Ex: 50 tonnes / an" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="availableProductionVolume" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume disponible immédiatement</Label>
                                        <Input id="availableProductionVolume" name="availableProductionVolume" defaultValue={profile.availableProductionVolume} placeholder="Ex: 5 tonnes" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gallery" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">VOTRE GALERIE PHOTO</CardTitle>
                                <CardDescription>Montrez votre exploitation aux acheteurs potentiels.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="Lien de l'image (URL)..."
                                        value={newPhotoUrl}
                                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddPhoto}
                                        disabled={isAddingPhoto || !newPhotoUrl}
                                        className="h-12 bg-slate-900 rounded-xl px-6"
                                    >
                                        {isAddingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Ajouter</>}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {photos.map((photo, i) => (
                                        <div key={i} className="group relative rounded-3xl overflow-hidden aspect-video bg-slate-100">
                                            <img src={photo.url} alt="Exploitation" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => photo.id && handleDeletePhoto(photo.id)}
                                                    className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-xl"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {photos.length === 0 && (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                            <ImageIcon className="w-12 h-12 mb-4 opacity-10" />
                                            <p className="text-xs font-black uppercase tracking-widest">Aucune photo pour le moment</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-6 outline-none">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">ZONE DE CONTACT</CardTitle>
                                <CardDescription>Ces informations seront révélées aux entreprises après acceptation.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessEmail" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Professionnel</Label>
                                        <Input id="businessEmail" name="businessEmail" type="email" defaultValue={profile.businessEmail} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone de contact</Label>
                                        <Input id="phone" name="phone" defaultValue={profile.phone} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:bg-white transition-all font-medium" />
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
                            "METTRE À JOUR LE PROFIL"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
