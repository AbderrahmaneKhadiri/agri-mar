"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    User,
    Mail,
    Lock,
    Building2,
    Sprout,
    ShieldCheck,
    ArrowRight,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signUpAction, undefined);
    const [role, setRole] = useState("FARMER");

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6 lg:p-12">
            <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
                        <Sprout className="size-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rejoindre Agri-Mar</h1>
                    <p className="text-slate-500 font-medium text-[15px]">Créez votre compte pour accéder au réseau</p>
                </div>

                <Card className="shadow-2xl shadow-slate-200/60 border-none rounded-3xl overflow-hidden bg-white">
                    <form action={formAction}>
                        <CardContent className="p-8 md:p-10 space-y-8">
                            {state?.error && (
                                <div className="p-4 text-sm font-medium text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <div className="bg-red-100 p-1 rounded-full">
                                        <ChevronRight className="size-3" />
                                    </div>
                                    {state.error}
                                </div>
                            )}

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Je souhaite m'inscrire en tant que :</Label>
                                <input type="hidden" name="role" value={role} />
                                <RadioGroup
                                    defaultValue="FARMER"
                                    onValueChange={setRole}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="relative">
                                        <RadioGroupItem value="FARMER" id="FARMER" className="sr-only" />
                                        <Label
                                            htmlFor="FARMER"
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                                role === "FARMER"
                                                    ? "border-emerald-500 bg-emerald-50/30 shadow-indigo-10 ring-1 ring-emerald-500/10"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                            )}
                                        >
                                            <Sprout className={cn("size-6 mb-3 transition-colors", role === "FARMER" ? "text-emerald-500" : "text-slate-400")} />
                                            <span className={cn("text-[13px] font-bold", role === "FARMER" ? "text-slate-900" : "text-slate-500")}>Agriculteur</span>
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <RadioGroupItem value="COMPANY" id="COMPANY" className="sr-only" />
                                        <Label
                                            htmlFor="COMPANY"
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                                role === "COMPANY"
                                                    ? "border-blue-600 bg-blue-50/30 shadow-indigo-10 ring-1 ring-blue-600/10"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                            )}
                                        >
                                            <Building2 className={cn("size-6 mb-3 transition-colors", role === "COMPANY" ? "text-blue-600" : "text-slate-400")} />
                                            <span className={cn("text-[13px] font-bold", role === "COMPANY" ? "text-slate-900" : "text-slate-500")}>Entreprise</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom complet</Label>
                                    <div className="relative group">
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Votre nom"
                                            required
                                            className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold focus:bg-white transition-all"
                                        />
                                        <User className="absolute left-4 top-3.5 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    </div>
                                    {state?.details?.name && <p className="text-[10px] font-bold text-red-500 ml-1">{state.details.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email professionnel</Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="vous@exemple.com"
                                            required
                                            className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold focus:bg-white transition-all"
                                        />
                                        <Mail className="absolute left-4 top-3.5 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    </div>
                                    {state?.details?.email && <p className="text-[10px] font-bold text-red-500 ml-1">{state.details.email[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mot de passe</Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="********"
                                            required
                                            className="h-12 bg-slate-50/50 border-slate-100 rounded-xl pl-11 text-[13px] font-semibold focus:bg-white transition-all"
                                        />
                                        <Lock className="absolute left-4 top-3.5 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    </div>
                                    {state?.details?.password && <p className="text-[10px] font-bold text-red-500 ml-1">{state.details.password[0]}</p>}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col space-y-6">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "w-full h-14 rounded-2xl text-[15px] font-bold text-white shadow-xl transition-all active:scale-[0.98]",
                                    role === "FARMER" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50" : "bg-blue-700 hover:bg-blue-800 shadow-blue-200/50"
                                )}
                            >
                                {isPending ? "Création du compte..." : (
                                    <span className="flex items-center justify-center gap-2">
                                        CRÉER MON COMPTE <ArrowRight className="size-4" />
                                    </span>
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-[13px] font-medium text-slate-500">
                                    Déjà un compte ?{" "}
                                    <a href="/login" className="font-bold text-slate-900 hover:underline underline-offset-4 decoration-2 decoration-emerald-500/30 transition-all">
                                        Se connecter
                                    </a>
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="flex items-center justify-center gap-6 opacity-40 grayscale filter blur-[0.5px]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Données Sécurisées</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Protocol SSL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
