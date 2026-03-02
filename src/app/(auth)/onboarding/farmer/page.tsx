"use client";

import { useActionState, useState } from "react";
import { submitFarmerOnboardingAction } from "@/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Building2,
    MapPin,
    Sprout,
    Droplets,
    ShieldCheck,
    Phone,
    Truck,
    Waves,
    Cloud,
    User,
    Mail,
    Scale,
    LandPlot,
    Store,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { ImageUpload } from "@/components/ui/image-upload";

const MAROC_REGIONS = [
    "Souss-Massa",
    "Gharb-Chrarda-Béni Hssen",
    "Doukkala-Abda",
    "Oriental",
    "Safi",
    "Marrakech-Tensift-Al Haouz",
    "Fès-Boulemane",
    "Tanger-Tétouan",
    "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra",
    "Casablanca-Settat",
    "Drâa-Tafilalet",
    "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra",
    "Dakhla-Oued Ed-Dahab"
];

const MOROCCAN_CITIES = [
    "Casablanca", "Rabat", "Marrakech", "Fes", "Tanger",
    "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
    "Safi", "Mohammedia", "El Jadida", "Beni Mellal",
    "Nador", "Taza", "Settat", "Berrechid", "Khemisset",
    "Ksar El Kebir", "Larache", "Guelmim", "Khenifra", "Berkane",
    "Taourirt", "Bouskoura", "Fquih Ben Salah", "Dakhla", "Ait Melloul"
];

export default function FarmerOnboardingPage() {
    const [step, setStep] = useState(0);
    const [state, formAction, isPending] = useActionState(submitFarmerOnboardingAction, undefined);

    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");
    const [irrigationTypes, setIrrigationTypes] = useState<string[]>(["Goutte-à-Goutte"]);
    const [bizModels, setBizModels] = useState<string[]>(["Direct Sales"]);
    const [avatarUrl, setAvatarUrl] = useState("");

    const totalSteps = 5;
    const progress = ((step) / (totalSteps - 1)) * 100;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    const toggleIrrigation = (type: string) => {
        setIrrigationTypes(prev =>
            prev.includes(type)
                ? (prev.length > 1 ? prev.filter(t => t !== type) : prev)
                : [...prev, type]
        );
    };

    const toggleBizModel = (model: string) => {
        setBizModels(prev =>
            prev.includes(model)
                ? (prev.length > 1 ? prev.filter(m => m !== model) : prev)
                : [...prev, model]
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6 lg:p-12">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Stepper Indicator */}
                <div className="px-2 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Étape {step + 1} sur {totalSteps}</h4>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {step === 0 && "Bienvenue sur Agri-Mar"}
                                {step === 1 && "Votre Identité Professionnelle"}
                                {step === 2 && "Votre Capacité de Production"}
                                {step === 3 && "Votre Modèle d'Affaires"}
                                {step === 4 && "Vérification & Confiance"}
                            </h3>
                        </div>
                        <span className="text-[13px] font-bold text-slate-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-200 [&>div]:bg-emerald-500 transition-all duration-500" />
                </div>

                <Card className="shadow-2xl shadow-slate-200/60 border-none rounded-3xl overflow-hidden bg-white">
                    <form action={formAction}>
                        <CardContent className="p-8 md:p-10 min-h-[600px] flex flex-col justify-center">
                            {state?.error && (
                                <div className="mb-8 p-4 text-sm font-medium text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <div className="bg-red-100 p-1 rounded-full">
                                        <ChevronRight className="size-3" />
                                    </div>
                                    {state.error}
                                </div>
                            )}

                            {/* STEP 0: WELCOME */}
                            <div className={cn("space-y-8 text-center", step !== 0 && "hidden")}>
                                <div className="relative mx-auto w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                                    <Sprout className="size-12" />
                                    <div className="absolute -right-2 -bottom-2 bg-slate-900 p-2 rounded-xl text-white shadow-xl">
                                        <CheckCircle2 className="size-4" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prêt à digitaliser votre ferme ?</h2>
                                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-sm mx-auto">
                                        Rejoignez le premier réseau B2B agricole au Maroc et connectez-vous directement avec les usines, hôtels et exportateurs.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-left pt-4">
                                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-border space-y-1.5 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 group">
                                        <div className="text-emerald-700 font-extrabold text-lg tracking-tight group-hover:text-emerald-600">Circuit Court</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em]">Vente Directe</div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-border space-y-1.5 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 group">
                                        <div className="text-emerald-700 font-extrabold text-lg tracking-tight group-hover:text-emerald-600">Paiement Garanti</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em]">Contrats Sécurisés</div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 1: IDENTITY */}
                            <div className={cn("space-y-6", step !== 1 && "hidden")}>
                                <div className="flex flex-col items-center gap-2 mb-6">
                                    <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Photo de Profil / Logo (Optionnel)</Label>
                                    <input type="hidden" name="avatarUrl" value={avatarUrl} />
                                    <ImageUpload
                                        value={avatarUrl ? [avatarUrl] : []}
                                        onChange={(urls) => setAvatarUrl(urls.length > 0 ? urls[urls.length - 1] : "")}
                                        onRemove={() => setAvatarUrl("")}
                                        maxFiles={1}
                                        className="mb-4"
                                        hidePreview={true}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Nom du Gérant</Label>
                                        <div className="relative">
                                            <Input id="fullName" name="fullName" placeholder="Ex: Ahmed Mansouri" required={step === 1} className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold" />
                                            <User className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="farmName" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Nom de l'Exploitation</Label>
                                        <div className="relative">
                                            <Input id="farmName" name="farmName" placeholder="Ex: Domaine Berkane" required={step === 1} className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold" />
                                            <Building2 className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">WhatsApp Professionnel</Label>
                                        <div className="relative">
                                            <Input id="phone" name="phone" placeholder="+212 6..." required={step === 1} className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold tabular-nums" />
                                            <Phone className="absolute left-4 top-3.5 size-4 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessEmail" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Email (Optionnel)</Label>
                                        <div className="relative">
                                            <Input id="businessEmail" name="businessEmail" type="email" placeholder="contact@ferme.com" className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-semibold" />
                                            <Mail className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="region-input" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Région</Label>
                                        <input type="hidden" name="region" value={region ?? ""} />
                                        <Combobox value={region} onValueChange={(val) => setRegion(val as string)}>
                                            <ComboboxInput
                                                id="region-input"
                                                placeholder="Choisir une région"
                                                className="h-12 bg-slate-50/50 border-border rounded-xl px-4 text-[13px] font-bold"
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>Aucune région trouvée.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {MAROC_REGIONS.map((r) => (
                                                        <ComboboxItem key={r} value={r}>
                                                            {r}
                                                        </ComboboxItem>
                                                    ))}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city-input" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Ville</Label>
                                        <input type="hidden" name="city" value={city ?? ""} />
                                        <div className="relative">
                                            <Combobox value={city} onValueChange={(val) => setCity(val as string)}>
                                                <ComboboxInput
                                                    id="city-input"
                                                    placeholder="Ex: Agadir"
                                                    className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold"
                                                />
                                                <MapPin className="absolute left-4 top-3.5 size-4 text-slate-400 z-10" />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>Aucune ville trouvée.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {MOROCCAN_CITIES.map((c) => (
                                                            <ComboboxItem key={c} value={c}>
                                                                {c}
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: CAPACITY */}
                            <div className={cn("space-y-8", step !== 2 && "hidden")}>
                                <div className="space-y-4">
                                    <Label htmlFor="totalAreaHectares" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Surface Totale (Hectares)</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <Input id="totalAreaHectares" name="totalAreaHectares" type="number" step="0.1" placeholder="10.5" className="h-14 bg-white border border-border rounded-2xl pl-12 pr-6 text-xl font-extrabold text-emerald-700 w-36 shadow-sm focus:ring-2 focus:ring-emerald-100 transition-all" />
                                            <LandPlot className="absolute left-4 top-4.5 size-5 text-emerald-300" />
                                        </div>
                                        <div className="text-[12px] font-medium text-slate-400 leading-relaxed max-w-xs">
                                            Indiquez la surface cultivable pour permettre au réseau d'évaluer votre capacité.
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Type d'Irrigation</Label>
                                    <input type="hidden" name="irrigationType" value={irrigationTypes.join(", ")} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl h-[160px] flex flex-col justify-center",
                                                irrigationTypes.includes("Goutte-à-Goutte")
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/10"
                                                    : "border-border bg-white hover:border-border hover:shadow-md"
                                            )}
                                            onClick={() => toggleIrrigation("Goutte-à-Goutte")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-colors shrink-0",
                                                    irrigationTypes.includes("Goutte-à-Goutte") ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:text-emerald-500"
                                                )}>
                                                    <Droplets className="size-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[13px] font-bold text-slate-900 block tracking-tight">Goutte-à-Goutte</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Économie d'eau</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl h-[160px] flex flex-col justify-center",
                                                irrigationTypes.includes("Bour")
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/10"
                                                    : "border-border bg-white hover:border-border hover:shadow-md"
                                            )}
                                            onClick={() => toggleIrrigation("Bour")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-colors shrink-0",
                                                    irrigationTypes.includes("Bour") ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:text-emerald-500"
                                                )}>
                                                    <Cloud className="size-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[13px] font-bold text-slate-900 block tracking-tight">Agriculture Bour</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pluvial</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: BUSINESS MODEL */}
                            <div className={cn("space-y-8", step !== 3 && "hidden")}>
                                <h3 className="text-lg font-bold text-slate-900 text-center">Comment souhaitez-vous vendre ?</h3>
                                <div className="space-y-4">
                                    {bizModels.map((model) => (
                                        <input key={model} type="hidden" name="businessModel" value={model} />
                                    ))}
                                    <div className="grid grid-cols-1 gap-4">
                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl",
                                                bizModels.includes("Direct Sales")
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/10"
                                                    : "border-border bg-white hover:border-border hover:shadow-md"
                                            )}
                                            onClick={() => toggleBizModel("Direct Sales")}
                                        >
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className={cn(
                                                    "p-4 rounded-xl transition-colors shrink-0",
                                                    bizModels.includes("Direct Sales") ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:text-emerald-500"
                                                )}>
                                                    <Store className="size-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[14px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">Vente Directe (Au Kilo) <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-auto">POPULAIRE</span></div>
                                                    <p className="text-[12px] text-slate-500 mt-1 font-medium">Idéal pour les Hôtels, Restaurants et commerces de proximité.</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl",
                                                bizModels.includes("Contracts")
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/10"
                                                    : "border-border bg-white hover:border-border hover:shadow-md"
                                            )}
                                            onClick={() => toggleBizModel("Contracts")}
                                        >
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className={cn(
                                                    "p-4 rounded-xl transition-colors shrink-0",
                                                    bizModels.includes("Contracts") ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:text-emerald-500"
                                                )}>
                                                    <LayoutGrid className="size-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">Contrats (Volumes Industriels)</div>
                                                    <p className="text-[12px] text-slate-500 mt-1 font-medium">Sourcing stratégique pour les Usines, Grandes Distributions et Export.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                                    <ShieldCheck className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                                        <strong>Note :</strong> Les contrats exigent généralement une plus grande régularité et des certifications spécifiques.
                                    </p>
                                </div>
                            </div>

                            {/* STEP 4: VERIFICATION */}
                            <div className={cn("space-y-8", step !== 4 && "hidden")}>
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
                                        <ShieldCheck className="size-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-extrabold text-slate-900">Le Badge de Confiance</h3>
                                        <p className="text-[13px] text-slate-500 max-w-sm">Ajoutez vos identifiants légaux pour être prioritaire sur les gros contrats industriels.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="iceNumber" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Numéro ICE (15 chiffres)</Label>
                                        <div className="relative">
                                            <Input id="iceNumber" name="iceNumber" placeholder="Ex: 002134..." className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold tracking-[2px] tabular-nums" />
                                            <Scale className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 ml-1">Indispensable pour être payé par virement par les Hôtels.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="onssaCert" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Agrément ONSSA (Optionnel)</Label>
                                        <div className="relative">
                                            <Input id="onssaCert" name="onssaCert" placeholder="Ex: F.23.15..." className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-bold tabular-nums" />
                                            <ShieldCheck className="absolute left-4 top-3.5 size-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 rounded-2xl bg-emerald-950 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 p-2 rounded-lg">
                                            <CheckCircle2 className="size-4 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-400">Score de Confiance estimé</span>
                                            <span className="text-[14px] font-bold">100% - Partenaire Certifié</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 md:p-10 bg-slate-50/50 border-t border-border flex items-center justify-between gap-4">
                            {step > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="h-12 px-6 rounded-xl border-border text-slate-600 font-bold hover:bg-white"
                                >
                                    <ChevronLeft className="size-4 mr-2" /> Retour
                                </Button>
                            ) : <div></div>}

                            {step < totalSteps - 1 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-12 px-8 rounded-xl bg-slate-900 border-none text-white font-bold hover:bg-slate-800"
                                >
                                    Continuer <ChevronRight className="size-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-12 px-10 rounded-xl bg-slate-900 border-none text-white font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
                                >
                                    {isPending ? "Finalisation..." : "LANCER MON ACTIVITÉ"}
                                </Button>
                            )}
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer hints */}
                <div className="text-center space-y-2">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Sécurisé par le protocole Agri-Mar Trust™</p>
                    <div className="flex justify-center gap-4 opacity-30 grayscale pointer-events-none scale-75">
                        <Image src="https://img.icons8.com/color/48/visa.png" alt="Visa" width={32} height={32} />
                        <Image src="https://img.icons8.com/color/48/mastercard.png" alt="MC" width={32} height={32} />
                        <Image src="https://img.icons8.com/color/48/bank-card-backside.png" alt="CIH" width={32} height={32} />
                    </div>
                </div>
            </div>
        </div >
    );
}
