"use client";

import { useState } from "react";

import { updateFarmerProfileAction } from "@/actions/profile.actions";
import { deleteFarmerPhotoAction } from "@/actions/social.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    User,
    MapPin,
    Sprout,
    Image as ImageIcon,
    Trash2,
    Upload,
    Loader2,
    ChevronDown,
    Settings,
    ShieldCheck,
    Info,
    Camera
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const MAROC_REGIONS = [
    "Souss-Massa",
    "Gharb-Chrarda-Béni Hssen",
    "Doukkala-Abda",
    "Oriental",
    "Safi",
    "Marrakech-Tensift-Al Haouz",
    "Fès-Boulemane"
];

export function FarmerSettingsForm({ profile, initialPhotos }: { profile: any, initialPhotos: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [photos, setPhotos] = useState(initialPhotos);
    const [uploading, setUploading] = useState(false);

    // Calcul de complétion du profil
    const calculateCompletion = () => {
        let score = 0;
        if (profile.fullName) score += 5;
        if (profile.phone) score += 5;
        if (profile.region) score += 5;
        if (profile.city) score += 5;
        if (profile.farmName) score += 5;
        if (profile.avatarUrl) score += 5;
        if (photos && photos.length > 0) score += 10;
        if (profile.iceNumber) score += 30;
        if (profile.onssaCert) score += 30;
        return Math.min(score, 100);
    };

    const completion = calculateCompletion();

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        const data = {
            fullName: formData.get("fullName") as string,
            city: formData.get("city") as string,
            region: formData.get("region") as string,
            phone: formData.get("phone") as string,
            businessEmail: formData.get("businessEmail") as string,
            farmName: formData.get("farmName") as string,
            iceNumber: formData.get("iceNumber") as string,
            onssaCert: formData.get("onssaCert") as string,
            totalAreaHectares: formData.get("totalAreaHectares") as string,
            cropTypes: (formData.get("cropTypes") as string || "").split(",").map(s => s.trim()).filter(Boolean),
            livestockType: formData.get("livestockType") as string,
            avgAnnualProduction: formData.get("avgAnnualProduction") as string,
            certifications: (formData.get("certifications") as string || "").split(",").map(s => s.trim()).filter(Boolean),
            farmingMethods: (formData.get("farmingMethods") as string || "").split(",").map(s => s.trim()).filter(Boolean),
            availableProductionVolume: formData.get("availableProductionVolume") as string,
            seasonAvailability: (formData.get("seasonAvailability") as string || "").split(",").map(s => s.trim()).filter(Boolean),
            exportCapacity: formData.get("exportCapacity") === "on",
            logisticsCapacity: formData.get("logisticsCapacity") === "on",
            longTermContractAvailable: formData.get("longTermContractAvailable") === "on",
            irrigationType: formData.get("irrigationType") as string,
            businessModel: (formData.get("businessModel") as string || "").split(",").map(s => s.trim()).filter(Boolean),
            hasColdStorage: formData.get("hasColdStorage") === "on",
            deliveryCapacity: formData.get("deliveryCapacity") === "on",
        };

        const res = await updateFarmerProfileAction(data);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Profil mis à jour avec succès");
        }
        setIsLoading(false);
    }

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        toast.info("L'upload de photos sera disponible prochainement.");
    };

    const handleDeletePhoto = async (id: string) => {
        const res = await deleteFarmerPhotoAction(id);
        if (res.success) {
            setPhotos(prev => prev.filter(p => p.id !== id));
            toast.success("Photo supprimée");
        } else {
            toast.error(res.error || "Erreur suppression");
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Header contextuel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Paramètres</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Mon Compte Agriculteur</span>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm min-w-[280px]">
                    <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Complétion du profil</span>
                            <span className="text-emerald-600">{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-1.5 bg-slate-100 [&>div]:bg-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mt-2">
                {/* Profile Form Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                        <CardHeader className="p-6 border-b bg-slate-50/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg shadow-slate-900/10">
                                    <User className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-[14px] font-black uppercase tracking-widest text-slate-900">Informations Personnelles</CardTitle>
                                    <CardDescription className="text-[12px] font-medium text-slate-400">Gérez vos coordonnées et informations de base.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form action={onSubmit} className="space-y-8">
                                {/* SECTION 1: Informations Personnelles & Base */}
                                <div className="space-y-6">
                                    <h4 className="text-[12px] font-bold text-slate-900 border-b pb-2">Informations Personnelles</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom Complet</Label>
                                            <Input
                                                name="fullName"
                                                defaultValue={profile.fullName}
                                                placeholder="Ex: Ahmed El Mansouri"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Téléphone</Label>
                                            <Input
                                                name="phone"
                                                defaultValue={profile.phone}
                                                placeholder="+212 6... "
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Professionnel</Label>
                                            <Input
                                                type="email"
                                                name="businessEmail"
                                                defaultValue={profile.businessEmail}
                                                placeholder="contact@ferme.ma"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Région</Label>
                                            <Select name="region" defaultValue={profile.region}>
                                                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold shadow-none">
                                                    <SelectValue placeholder="Sélectionner une région" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                                    {MAROC_REGIONS.map(r => <SelectItem key={r} value={r} className="text-[13px] font-medium h-10">{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ville</Label>
                                            <Input
                                                name="city"
                                                defaultValue={profile.city}
                                                placeholder="Agadir, Meknès..."
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: L'Exploitation Agricole */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <h4 className="text-[12px] font-bold text-slate-900 border-b pb-2">Détails de l'Exploitation</h4>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom de l&apos;Exploitation</Label>
                                            <Input
                                                name="farmName"
                                                defaultValue={profile.farmName || ""}
                                                placeholder="Ex: Ferme Verte"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Surface Totale (Hectares)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                name="totalAreaHectares"
                                                defaultValue={profile.totalAreaHectares?.toString() || ""}
                                                placeholder="10"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Types de cultures (séparés par des virgules)</Label>
                                        <Input
                                            name="cropTypes"
                                            defaultValue={Array.isArray(profile.cropTypes) ? profile.cropTypes.join(", ") : ""}
                                            placeholder="Ex: Tomates, Pommes de terre, Agrumes"
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type d&apos;Élevage (Optionnel)</Label>
                                            <Input
                                                name="livestockType"
                                                defaultValue={profile.livestockType || ""}
                                                placeholder="Bovins, Ovins..."
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Production Annuelle Moyenne</Label>
                                            <Input
                                                name="avgAnnualProduction"
                                                defaultValue={profile.avgAnnualProduction || ""}
                                                placeholder="Ex: 50 Tonnes"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Méthodes de culture</Label>
                                            <Input
                                                name="farmingMethods"
                                                defaultValue={Array.isArray(profile.farmingMethods) ? profile.farmingMethods.join(", ") : ""}
                                                placeholder="Bio, Conventionnelle, Serre..."
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type d&apos;irrigation</Label>
                                            <Select name="irrigationType" defaultValue={profile.irrigationType || ""}>
                                                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold shadow-none">
                                                    <SelectValue placeholder="Séléctionnez" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                                    <SelectItem value="Goutte-à-Goutte" className="text-[13px] font-medium h-10">Goutte-à-Goutte</SelectItem>
                                                    <SelectItem value="Bour" className="text-[13px] font-medium h-10">Bour (Pluviale)</SelectItem>
                                                    <SelectItem value="Mixte" className="text-[13px] font-medium h-10">Mixte</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: Capacités Logistiques et Commerciales */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <h4 className="text-[12px] font-bold text-slate-900 border-b pb-2">Capacités & Ventes</h4>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Volume disponible à la vente</Label>
                                            <Input
                                                name="availableProductionVolume"
                                                defaultValue={profile.availableProductionVolume || ""}
                                                placeholder="Ex: 20 Tonnes"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Disponibilité Saisonnière</Label>
                                            <Input
                                                name="seasonAvailability"
                                                defaultValue={Array.isArray(profile.seasonAvailability) ? profile.seasonAvailability.join(", ") : ""}
                                                placeholder="Ex: Été, Automne ou Mois"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Modèle d&apos;affaires souhaité (virgules)</Label>
                                        <Input
                                            name="businessModel"
                                            defaultValue={Array.isArray(profile.businessModel) ? profile.businessModel.join(", ") : ""}
                                            placeholder="Ex: Direct Sales, Contracts"
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <input type="checkbox" id="hasColdStorage" name="hasColdStorage" defaultChecked={profile.hasColdStorage} className="size-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                            <label htmlFor="hasColdStorage" className="text-[12px] font-bold text-slate-900 cursor-pointer">Stockage Froid / Silo</label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <input type="checkbox" id="deliveryCapacity" name="deliveryCapacity" defaultChecked={profile.deliveryCapacity} className="size-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                            <label htmlFor="deliveryCapacity" className="text-[12px] font-bold text-slate-900 cursor-pointer">Capacité de Livraison</label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <input type="checkbox" id="exportCapacity" name="exportCapacity" defaultChecked={profile.exportCapacity} className="size-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                            <label htmlFor="exportCapacity" className="text-[12px] font-bold text-slate-900 cursor-pointer">Capacité d&apos;Exportation</label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <input type="checkbox" id="logisticsCapacity" name="logisticsCapacity" defaultChecked={profile.logisticsCapacity} className="size-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                            <label htmlFor="logisticsCapacity" className="text-[12px] font-bold text-slate-900 cursor-pointer">Capacité Logistique propre</label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                                            <input type="checkbox" id="longTermContractAvailable" name="longTermContractAvailable" defaultChecked={profile.longTermContractAvailable} className="size-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                            <label htmlFor="longTermContractAvailable" className="text-[12px] font-bold text-slate-900 cursor-pointer">Ouvert aux contrats à long terme</label>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: Certifications & Qualifications B2B */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <h4 className="text-[12px] font-bold text-slate-900 border-b pb-2">Qualifications & Certifications</h4>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Numéro ICE / RC</Label>
                                            <Input
                                                name="iceNumber"
                                                defaultValue={profile.iceNumber || ""}
                                                placeholder="Ex: 00000000000000"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Agrément ONSSA</Label>
                                            <Input
                                                name="onssaCert"
                                                defaultValue={profile.onssaCert || ""}
                                                placeholder="Numéro d'agrément"
                                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Autres Certifications (virgules)</Label>
                                        <Input
                                            name="certifications"
                                            defaultValue={Array.isArray(profile.certifications) ? profile.certifications.join(", ") : ""}
                                            placeholder="Ex: Global GAP, Bio Maroc..."
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-11 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                                    >
                                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer les modifications"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Photos Area */}
                    <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                        <CardHeader className="p-6 border-b bg-slate-50/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg shadow-slate-900/10">
                                        <Camera className="size-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-[14px] font-bold uppercase tracking-widest text-slate-900">Galerie Photos</CardTitle>
                                        <CardDescription className="text-[12px] font-medium text-slate-400">Ajoutez des photos de votre exploitation pour rassurer vos partenaires.</CardDescription>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="photo-upload"
                                        className="hidden"
                                        onChange={handleUploadPhoto}
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-9"
                                    >
                                        <label htmlFor="photo-upload">
                                            {uploading ? <Loader2 className="size-3 animate-spin mr-2" /> : <Upload className="size-3 mr-2" />}
                                            Ajouter Photo
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {photos.length === 0 ? (
                                <div className="h-48 rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                    <ImageIcon className="size-10 mb-2 opacity-20" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest">Aucune photo ajoutée</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {photos.map(p => (
                                        <div key={p.id} className="aspect-square rounded-xl bg-slate-50 relative group border border-slate-100 overflow-hidden shadow-sm">
                                            <img src={p.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="size-8 rounded-lg shadow-xl"
                                                    onClick={() => handleDeletePhoto(p.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Context */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden text-center p-8 flex flex-col items-center">
                        <div className="relative mb-6">
                            <Avatar className="size-24 rounded-2xl border-4 border-white shadow-2xl ring-1 ring-slate-100">
                                <AvatarImage src={profile.avatarUrl || ""} className="object-cover" />
                                <AvatarFallback className="bg-slate-50 text-slate-900 text-3xl font-black">{profile.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -right-2 -bottom-2 bg-slate-900 p-1.5 rounded-lg border-2 border-white text-white shadow-lg">
                                <ShieldCheck className="size-4" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{profile.fullName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exploitant Agricole</p>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <MapPin className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Localisation</span>
                                    <span className="text-[12px] font-bold text-slate-900">{profile.city}, {profile.region}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <Sprout className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ferme</span>
                                    <span className="text-[12px] font-bold text-slate-900">{profile.farmName || "Non spécifié"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <Loader2 className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capacité annuelle</span>
                                    <span className="text-[12px] font-bold text-slate-900">{profile.avgAnnualProduction || "Non spécifié"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <Settings className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modèle / Surface</span>
                                    <span className="text-[12px] font-bold text-slate-900">{profile.totalAreaHectares ? `${profile.totalAreaHectares} Ha` : "Non spécifié"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-left">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium text-emerald-800 leading-relaxed">
                                <span className="font-bold">Optimisez vos chances !</span> Un profil complété à 100% multiplie par 3 vos opportunités de partenariats sérieux avec les entreprises.
                            </p>
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3 text-left">
                            <Info className="size-4 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium text-orange-700 leading-relaxed">
                                Les informations de votre profil sont visibles sur le Marché Agricole. Assurez-vous qu&apos;elles sont à jour pour attirer de nouveaux partenaires.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
