"use client";

import { useState } from "react";

import { updateCompanyProfileAction } from "@/actions/profile.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Building2,
    MapPin,
    Phone,
    Globe,
    ChevronDown,
    Settings,
    ShieldCheck,
    Info,
    Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function CompanySettingsForm({ profile }: { profile: any }) {
    const [isLoading, setIsLoading] = useState(false);

    // Calcul de complétion du profil
    const calculateCompletion = () => {
        let score = 0;
        if (profile.companyName) score += 5;
        if (profile.city) score += 5;
        if (profile.phone) score += 5;
        if (profile.address) score += 5;
        if (profile.logoUrl) score += 10;
        if (profile.iceNumber) score += 35;
        if (profile.rcNumber) score += 35;
        return Math.min(score, 100);
    };

    const completion = calculateCompletion();

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        const data = {
            companyName: formData.get("companyName") as string,
            city: formData.get("city") as string,
            address: formData.get("address") as string,
            phone: formData.get("phone") as string,
            iceNumber: formData.get("iceNumber") as string,
            rcNumber: formData.get("rcNumber") as string,
            website: formData.get("website") as string,
        };

        const res = await updateCompanyProfileAction(data);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Profil entreprise mis à jour");
        }
        setIsLoading(false);
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Header contextuel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Paramètres</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Mon Compte Entreprise</span>
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
                <div className="col-span-12 lg:col-span-8">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                        <CardHeader className="p-6 border-b bg-slate-50/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg shadow-slate-900/10">
                                    <Building2 className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-[14px] font-bold uppercase tracking-widest text-slate-900">Profil Entreprise</CardTitle>
                                    <CardDescription className="text-[12px] font-medium text-slate-400">Gérez les détails de votre organisation.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form action={onSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Raison Sociale</Label>
                                    <Input
                                        name="companyName"
                                        defaultValue={profile.companyName}
                                        placeholder="Ex: AgriCorp S.A."
                                        className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ville Siège</Label>
                                        <Input
                                            name="city"
                                            defaultValue={profile.city}
                                            placeholder="Casablanca, Rabat..."
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Téléphone</Label>
                                        <Input
                                            name="phone"
                                            defaultValue={profile.phone}
                                            placeholder="+212 5... "
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Adresse Locale</Label>
                                    <Input
                                        name="address"
                                        defaultValue={profile.address}
                                        placeholder="N° 45, Av. des FAR..."
                                        className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">N° ICE (Identifiant Commun)</Label>
                                        <Input
                                            name="iceNumber"
                                            defaultValue={profile.iceNumber}
                                            placeholder="15 chiffres"
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">N° Registre de Commerce (RC)</Label>
                                        <Input
                                            name="rcNumber"
                                            defaultValue={profile.rcNumber}
                                            placeholder="Ex: 123456"
                                            className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Site Web (Optionnel)</Label>
                                    <Input
                                        name="website"
                                        defaultValue={profile.website || ""}
                                        placeholder="https://www.agricorp.ma"
                                        className="h-11 bg-white border-slate-200 rounded-xl px-4 text-[13px] font-semibold focus-visible:ring-slate-100"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-11 px-8"
                                    >
                                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer les modifications"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden text-center p-8 flex flex-col items-center">
                        <Avatar className="size-24 rounded-2xl border-4 border-white shadow-2xl ring-1 ring-slate-100 mb-6">
                            <AvatarImage src={profile.logoUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-slate-50 text-slate-900 text-3xl font-black">{profile.companyName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{profile.companyName}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Espace Entreprise</p>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <MapPin className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Siège</span>
                                    <span className="text-[12px] font-bold text-slate-900">{profile.city}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400">
                                    <Globe className="size-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visibilité</span>
                                    <span className="text-[12px] font-bold text-slate-900">Publique</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-left">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">
                                Boostez votre crédibilité
                            </p>
                            <p className="text-[11px] font-medium text-emerald-700 leading-relaxed mt-1">
                                Un profil complet rassure les agriculteurs et facilite la signature de nouveaux contrats.
                            </p>
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-left">
                            <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
                                Les informations de votre entreprise sont essentielles pour la facturation et les contrats officiels.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
