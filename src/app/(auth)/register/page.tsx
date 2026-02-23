"use client";

import { useActionState } from "react";
import { signUpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signUpAction, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Rejoindre AgriMar
                    </CardTitle>
                    <CardDescription>
                        Créez votre compte pour accéder au réseau
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        {state?.error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                {state.error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Je suis :</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="FARMER" defaultChecked />
                                    Agriculteur
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="COMPANY" />
                                    Entreprise
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Nom complet</label>
                            <Input
                                name="name"
                                type="text"
                                placeholder="Votre nom"
                                required
                            />
                            {state?.details?.name && <p className="text-xs text-red-500">{state.details.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email</label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="vous@exemple.com"
                                required
                            />
                            {state?.details?.email && <p className="text-xs text-red-500">{state.details.email[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Mot de passe</label>
                            <Input
                                name="password"
                                type="password"
                                required
                            />
                            {state?.details?.password && <p className="text-xs text-red-500">{state.details.password[0]}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                            disabled={isPending}
                        >
                            {isPending ? "Création..." : "Créer mon compte"}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Déjà un compte ?{" "}
                            <a href="/login" className="font-semibold text-green-600 hover:text-green-500 underline underline-offset-4">
                                Se connecter
                            </a>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
