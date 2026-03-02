"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Mail,
    Lock,
    Sprout,
    ShieldCheck,
    ArrowRight,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error } = await signIn.email({
                email,
                password,
            });

            if (error) {
                setError(error.message || "Email ou mot de passe incorrect");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6 lg:p-12">
            <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
                        <Sprout className="size-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agri-Mar Connexion</h1>
                    <p className="text-slate-500 font-medium text-[15px]">Heureux de vous revoir parmi nous</p>
                </div>

                <Card className="shadow-2xl shadow-slate-200/60 border-none rounded-3xl overflow-hidden bg-white">
                    <form onSubmit={handleLogin}>
                        <CardContent className="p-8 md:p-10 space-y-8">
                            {error && (
                                <div className="p-4 text-sm font-medium text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <div className="bg-red-100 p-1 rounded-full">
                                        <ChevronRight className="size-3" />
                                    </div>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email professionnel</Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="vous@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-semibold focus:bg-white transition-all shadow-none"
                                        />
                                        <Mail className="absolute left-4 top-3.5 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Mot de passe</Label>
                                        <a href="#" className="text-[11px] font-bold text-emerald-600 hover:underline">Oublié ?</a>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="********"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 bg-slate-50/50 border-border rounded-xl pl-11 text-[13px] font-semibold focus:bg-white transition-all shadow-none"
                                        />
                                        <Lock className="absolute left-4 top-3.5 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 md:p-10 bg-slate-50/50 border-t border-border flex flex-col space-y-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl text-[15px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200/50 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" /> Connexion...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        SE CONNECTER <ArrowRight className="size-4" />
                                    </span>
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-[13px] font-medium text-slate-500">
                                    Pas encore de compte ?{" "}
                                    <a href="/register" className="font-bold text-slate-900 hover:underline underline-offset-4 decoration-2 decoration-emerald-500/30 transition-all">
                                        S'inscrire
                                    </a>
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="flex items-center justify-center gap-6 opacity-40 grayscale filter blur-[0.5px]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Accès Sécurisé</span>
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
