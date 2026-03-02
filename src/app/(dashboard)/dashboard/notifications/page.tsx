"use client";

import { Bell, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Header contextuel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Mon Dashboard</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Notifications</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-6">
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50 shadow-sm relative z-10">
                        <Bell className="size-12 text-emerald-600 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Centre de Notifications</h1>
                <p className="text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                    Vous n&apos;avez pas encore de nouvelles notifications.
                    Toute l&apos;activité de vos partenaires et de votre catalogue apparaîtra ici.
                </p>

                <div className="grid gap-4 w-full max-w-md">
                    <Card className="border-border shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-start gap-3 text-left">
                            <div className="bg-emerald-100/50 p-2 rounded-lg text-emerald-700">
                                <Info className="size-4" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-900">Bienvenue sur Agri-Mar !</h4>
                                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                                    C&apos;est ici que vous recevrez les mises à jour sur vos demandes de contrat et ventes directes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-10">
                    <Button asChild variant="outline" className="h-10 rounded-xl px-6 font-bold text-[12px] border-border">
                        <Link href="/dashboard">Retour au Dashboard</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
