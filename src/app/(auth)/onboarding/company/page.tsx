"use client";

import { useActionState, useState } from "react";
import { submitCompanyOnboardingAction } from "@/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ChevronRight,
    ChevronLeft,
    Building2,
    MapPin,
    ShieldCheck,
    Factory,
    Hotel,
    Store,
    Scale,
    Receipt,
    Truck,
    CreditCard,
    PackageSearch,
    CheckCircle2,
    Calendar as CalendarIcon,
    Search,
    Phone,
    Mail
} from "lucide-react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SECTORS = [
    "Agro-industrie",
    "Hôtellerie de luxe",
    "Exportateur de Fruits & Légumes",
    "Grande Distribution",
    "Chaîne de Restauration",
    "Grossiste Alimentaire",
    "Transformation Agro-alimentaire",
    "Autre"
];

const CITIES = [
    "Casablanca", "Rabat", "Marrakech", "Fes", "Tanger",
    "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
    "Safi", "Mohammedia", "El Jadida", "Beni Mellal",
    "Nador", "Taza", "Settat", "Berrechid", "Khemisset",
    "Ksar El Kebir", "Larache", "Guelmim", "Khenifra", "Berkane",
    "Taourirt", "Bouskoura", "Fquih Ben Salah", "Dakhla", "Ait Melloul"
];

export default function CompanyOnboardingPage() {
    const [step, setStep] = useState(0);
    const [state, formAction, isPending] = useActionState(submitCompanyOnboardingAction, undefined);

    const [industry, setIndustry] = useState("");
    const [city, setCity] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date>();
    const [partnershipType, setPartnershipType] = useState("Spot Buy");

    const totalSteps = 5;
    const progress = ((step) / (totalSteps - 1)) * 100;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6 lg:p-12">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Stepper Indicator */}
                <div className="px-2 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Qualification Étape {step + 1} sur {totalSteps}</h4>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {step === 0 && "Bienvenue sur Agri-Mar Business"}
                                {step === 1 && "Identité & Secteur"}
                                {step === 2 && "Besoins en Sourcing"}
                                {step === 3 && "Légalité & Confiance"}
                                {step === 4 && "Logistique & Paiement"}
                            </h3>
                        </div>
                        <span className="text-[13px] font-bold text-slate-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-200 [&>div]:bg-blue-600 transition-all duration-500" />
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
                                <div className="relative mx-auto w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                                    <PackageSearch className="size-12" />
                                    <div className="absolute -right-2 -bottom-2 bg-slate-900 p-2 rounded-xl text-white shadow-xl">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sécurisez votre Sourcing</h2>
                                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-sm mx-auto">
                                        Accédez à un réseau qualifié de producteurs marocains. Circuit court et qualité garantie.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-left pt-4">
                                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-1.5 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 group">
                                        <div className="text-slate-900 font-extrabold text-lg tracking-tight group-hover:text-blue-600">Direct Producteur</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em]">Prix Compétitifs</div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-1.5 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 group">
                                        <div className="text-slate-900 font-extrabold text-lg tracking-tight group-hover:text-blue-600">Traçabilité ONSSA</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em]">Qualité Certifiée</div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 1: IDENTITY & SECTOR */}
                            <div className={cn("space-y-6", step !== 1 && "hidden")}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Raison Sociale</Label>
                                        <div className="relative">
                                            <Input id="companyName" name="companyName" placeholder="Ex: Atlas Distribution S.A." required={step === 1} className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold" />
                                            <Building2 className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type d'Entité</Label>
                                        <Select name="companyType" required={step === 1} defaultValue="Distribution">
                                            <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 text-[13px] font-semibold shadow-none">
                                                <SelectValue placeholder="Choisir type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Hotel" className="text-[13px] font-medium h-10 flex items-center gap-2"><div className="flex items-center gap-2"><Hotel className="size-3" /> Hôtel / Resort</div></SelectItem>
                                                <SelectItem value="Factory" className="text-[13px] font-medium h-10 flex items-center gap-2"><div className="flex items-center gap-2"><Factory className="size-3" /> Usine de Transformation / Agro-industrie</div></SelectItem>
                                                <SelectItem value="Restaurant" className="text-[13px] font-medium h-10 flex items-center gap-2"><div className="flex items-center gap-2"><Store className="size-3" /> Chaîne de Restauration</div></SelectItem>
                                                <SelectItem value="Exporter" className="text-[13px] font-medium h-10 flex items-center gap-2"><div className="flex items-center gap-2"><Truck className="size-3" /> Exportateur</div></SelectItem>
                                                <SelectItem value="Distribution" className="text-[13px] font-medium h-10 flex items-center gap-2"><div className="flex items-center gap-2"><Building2 className="size-3" /> Grande Distribution</div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry-input" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secteur Précis</Label>
                                    <input type="hidden" name="industry" value={industry} />
                                    <Combobox value={industry} onValueChange={(val) => setIndustry(val as string)}>
                                        <ComboboxInput
                                            id="industry-input"
                                            placeholder="Ex: Agro-industrie, Hôtellerie..."
                                            className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 text-[13px] font-semibold"
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>Aucun secteur trouvé.</ComboboxEmpty>
                                            <ComboboxList>
                                                {SECTORS.map((sector) => (
                                                    <ComboboxItem key={sector} value={sector}>
                                                        {sector}
                                                    </ComboboxItem>
                                                ))}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city-input" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Siége Social (Ville)</Label>
                                        <input type="hidden" name="city" value={city} />
                                        <div className="relative">
                                            <Combobox value={city} onValueChange={(val) => setCity(val as string)}>
                                                <ComboboxInput
                                                    id="city-input"
                                                    placeholder="Ex: Casablanca"
                                                    className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold"
                                                />
                                                <MapPin className="absolute left-4 top-3.5 size-4 text-slate-400 z-10" />
                                                <ComboboxContent>
                                                    <ComboboxEmpty>Aucune ville trouvée.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {CITIES.map((c) => (
                                                            <ComboboxItem key={c} value={c}>
                                                                {c}
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Année de Création</Label>
                                        <input type="hidden" name="establishedYear" value={establishedDate ? establishedDate.getFullYear() : ""} />
                                        <DatePicker
                                            date={establishedDate}
                                            setDate={setEstablishedDate}
                                            className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 text-[13px] font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: SOURCING NEEDS */}
                            <div className={cn("space-y-8", step !== 2 && "hidden")}>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Volume d'achat estimé (par an)</Label>
                                    <Select name="purchasingCapacity" required={step === 2} defaultValue="50 - 200 Tonnes">
                                        <SelectTrigger className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-[13px] font-semibold text-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-blue-100">
                                            <SelectValue placeholder="Choisir un volume" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200 shadow-xl overflow-hidden">
                                            <SelectItem value="< 10 Tonnes" className="text-[13px] font-medium h-10 hover:bg-slate-50 focus:bg-slate-50">Petit Volume ({"<"} 10 T/an)</SelectItem>
                                            <SelectItem value="10 - 50 Tonnes" className="text-[13px] font-medium h-10 hover:bg-slate-50 focus:bg-slate-50">Volume Moyen (10-50 T/an)</SelectItem>
                                            <SelectItem value="50 - 200 Tonnes" className="text-[13px] font-medium h-10 hover:bg-slate-50 focus:bg-slate-50">Gros Volume (50-200 T/an)</SelectItem>
                                            <SelectItem value="> 200 Tonnes" className="text-[13px] font-medium h-10 hover:bg-slate-50 focus:bg-slate-50">Volume Industriel ({">"} 200 T/an)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                        Cette information permet de vous proposer des producteurs adaptés à votre échelle.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type de Partenariat Recherché</Label>
                                    <input type="hidden" name="partnershipType" value={partnershipType} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl",
                                                partnershipType === "Spot Buy"
                                                    ? "border-blue-600 bg-blue-50/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-blue-600/10"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                            )}
                                            onClick={() => setPartnershipType("Spot Buy")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-colors shrink-0",
                                                    partnershipType === "Spot Buy" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:text-blue-600"
                                                )}>
                                                    <Store className="size-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[13px] font-bold text-slate-900 block">Achats "Spot"</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Besoins Flexibles</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border overflow-hidden group rounded-2xl",
                                                partnershipType === "Contract"
                                                    ? "border-slate-900 bg-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/10"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                            )}
                                            onClick={() => setPartnershipType("Contract")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-colors shrink-0",
                                                    partnershipType === "Contract" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-900"
                                                )}>
                                                    <Receipt className="size-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[13px] font-bold text-slate-900 block">Contrats Long Terme</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Volume Garanti</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: LEGAL & TRUST */}
                            <div className={cn("space-y-8 text-center", step !== 3 && "hidden")}>
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-full text-blue-600 w-fit mx-auto">
                                        <ShieldCheck className="size-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">Légalité & Conformité</h3>
                                        <p className="text-[13px] text-slate-500 max-w-sm mx-auto">Obligatoire pour la facturation et les contrats sécurisés avec les coopératives.</p>
                                    </div>
                                </div>

                                <div className="space-y-6 text-left max-w-md mx-auto">
                                    <div className="space-y-2">
                                        <Label htmlFor="iceNumber" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Numéro ICE (15 chiffres)</Label>
                                        <div className="relative">
                                            <Input id="iceNumber" name="iceNumber" placeholder="Ex: 002134..." required={step === 3} className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-bold tracking-[2px] tabular-nums" />
                                            <Building2 className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rcNumber" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Registre de Commerce (RC)</Label>
                                        <div className="relative">
                                            <Input id="rcNumber" name="rcNumber" placeholder="Ex: 45678" required={step === 3} className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-bold tabular-nums" />
                                            <Scale className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 mt-4 text-left">
                                    <Scale className="size-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                        Votre ICE et RC seront utilisés pour générer automatiquement vos futurs bons de commande et offres commerciales.
                                    </p>
                                </div>
                            </div>

                            {/* STEP 4: LOGISTICS & PAYMENT */}
                            <div className={cn("space-y-8", step !== 4 && "hidden")}>
                                <h3 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">Préférences de Réception</h3>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Approvisionnement</Label>
                                            <div className="relative">
                                                <Input id="phone" name="phone" placeholder="+212 6..." required={step === 4} className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-bold tabular-nums" />
                                                <Phone className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="businessEmail" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Commandes</Label>
                                            <div className="relative">
                                                <Input id="businessEmail" name="businessEmail" type="email" placeholder="achats@societe.com" required={step === 4} className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold" />
                                                <Mail className="absolute left-4 top-3.5 size-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 shadow-sm">
                                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                                        <span className="text-[13px] font-bold">Prêt pour les grosses opportunités !</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                            {step > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white"
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
                                    className="h-12 px-10 rounded-xl bg-blue-700 border-none text-white font-bold hover:bg-blue-800 shadow-xl shadow-blue-200"
                                >
                                    {isPending ? "Finalisation..." : "FINALISER MON ACCÈS ACHETEUR"}
                                </Button>
                            )}
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer hints */}
                <div className="text-center space-y-2">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Plateforme Sourcing Agri-Mar Professionnelle</p>
                    <div className="flex justify-center gap-4 opacity-30 grayscale pointer-events-none scale-75">
                        <img src="https://img.icons8.com/color/48/safe.png" alt="Safe" />
                        <img src="https://img.icons8.com/color/48/official-document.png" alt="Doc" />
                        <img src="https://img.icons8.com/color/48/trust.png" alt="Trust" />
                    </div>
                </div>
            </div>
        </div>
    );
}
