"use client";

import { useActionState } from "react";
import { submitCompanyOnboardingAction } from "@/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function CompanyOnboardingPage() {
    const [state, formAction, isPending] = useActionState(submitCompanyOnboardingAction, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-green-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold text-green-800">
                        Profil Entreprise
                    </CardTitle>
                    <CardDescription>
                        Complétez les informations de votre entreprise pour accéder au marché
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
                                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                <Input id="companyName" name="companyName" placeholder="Ex: AgriCorp S.A." required />
                                {state?.fields?.companyName && <p className="text-xs text-red-500">{state.fields.companyName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="establishedYear">Année de création</Label>
                                <Input id="establishedYear" name="establishedYear" type="number" placeholder="2010" required />
                                {state?.fields?.establishedYear && <p className="text-xs text-red-500">{state.fields.establishedYear}</p>}
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
                                <Input id="businessEmail" name="businessEmail" type="email" placeholder="contact@agricorp.com" required />
                                {state?.fields?.businessEmail && <p className="text-xs text-red-500">{state.fields.businessEmail}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="industry">Secteur d'activité</Label>
                                <Input id="industry" name="industry" placeholder="Ex: Transformation laitière, Distribution..." required />
                                {state?.fields?.industry && <p className="text-xs text-red-500">{state.fields.industry}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                <Input id="city" name="city" placeholder="Ex: Casablanca" required />
                                {state?.fields?.city && <p className="text-xs text-red-500">{state.fields.city}</p>}
                            </div>
                        </div>

                        {/* Les autres champs sont optionnels/par défaut dans le schéma mis à jour */}
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
