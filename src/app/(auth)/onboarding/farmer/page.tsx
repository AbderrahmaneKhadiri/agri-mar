"use client";

import { useActionState } from "react";
import { submitFarmerOnboardingAction } from "@/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function FarmerOnboardingPage() {
    const [state, formAction, isPending] = useActionState(submitFarmerOnboardingAction, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-green-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold text-green-800">
                        Profil Agriculteur
                    </CardTitle>
                    <CardDescription>
                        Complétez vos informations pour commencer à vendre
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-6">
                        {state?.error && (
                            <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                {state.error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nom complet</Label>
                                <Input id="fullName" name="fullName" placeholder="Ex: Jean Dupont" required />
                                {state?.fields?.fullName && <p className="text-xs text-red-500">{state.fields.fullName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="farmName">Nom de l'exploitation</Label>
                                <Input id="farmName" name="farmName" placeholder="Ex: Ferme du Soleil" required />
                                {state?.fields?.farmName && <p className="text-xs text-red-500">{state.fields.farmName}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input id="phone" name="phone" placeholder="+212 ..." required />
                                {state?.fields?.phone && <p className="text-xs text-red-500">{state.fields.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessEmail">Email professionnel</Label>
                                <Input id="businessEmail" name="businessEmail" type="email" placeholder="contact@ferme.com" required />
                                {state?.fields?.businessEmail && <p className="text-xs text-red-500">{state.fields.businessEmail}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="region">Région</Label>
                                <Input id="region" name="region" placeholder="Ex: Souss-Massa" required />
                                {state?.fields?.region && <p className="text-xs text-red-500">{state.fields.region}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                <Input id="city" name="city" placeholder="Ex: Agadir" required />
                                {state?.fields?.city && <p className="text-xs text-red-500">{state.fields.city}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalAreaHectares">Surface totale (Hectares)</Label>
                            <Input id="totalAreaHectares" name="totalAreaHectares" type="number" step="0.1" placeholder="10.5" required />
                            {state?.fields?.totalAreaHectares && <p className="text-xs text-red-500">{state.fields.totalAreaHectares}</p>}
                        </div>

                        {/* Les autres champs sont optionnels/par défaut dans le schéma mis à jour pour simplifier l'onboarding initial */}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                            disabled={isPending}
                        >
                            {isPending ? "Enregistrement..." : "Finaliser mon profil"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
