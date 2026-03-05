"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowUpRightIcon, Plus, Globe } from "lucide-react";
import { AddParcelModal } from "./add-parcel-modal";
import { cn } from "@/lib/utils";

interface ParcelManagementProps {
    parcels: any[];
}

export function ParcelManagement({ parcels }: ParcelManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hasParcels = parcels.length > 0;
    const totalArea = parcels.reduce((acc, p) => acc + Number(p.area), 0).toFixed(1);

    return (
        <>
            <Card className={cn(
                "bg-white shadow-sm overflow-hidden relative group transition-all duration-300 rounded-xl",
                !hasParcels ? "border-amber-200 bg-amber-50/20" : "border-[#4a8c5c] ring-1 ring-[#4a8c5c]/20"
            )}>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                            <div className={cn(
                                "size-8 rounded-lg border flex items-center justify-center",
                                !hasParcels ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-[#f0f8f4] border-[#c4dece] text-[#2c5f42]"
                            )}>
                                {hasParcels ? <MapPin className="size-4" /> : <Globe className="size-4" />}
                            </div>
                        </div>
                        <ArrowUpRightIcon className="size-3 text-slate-300 group-hover:text-[#4a8c5c] transition-colors" />
                    </div>

                    {hasParcels ? (
                        <>
                            <div className="text-[30px] font-light text-slate-800 tabular-nums leading-none mb-1">
                                {parcels.length}
                            </div>
                            <p className="text-[12px] font-bold text-[#2c5f42]">Parcelles Connectées</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-1.5 text-[11px] font-medium text-slate-400">
                                <span>{totalArea} Hectares surveillés</span>
                                <span className="text-[#4a8c5c] text-[10px] uppercase font-bold tracking-widest">AgroMonitoring API Actif</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: "24px", fontWeight: 700, lineHeight: "30px" }} className="text-slate-900 mb-1">
                                Non Connecté
                            </div>
                            <p className="text-[12px] font-medium text-amber-600 mb-4">Suivi satellite inactif</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full h-9 rounded-xl bg-[#2c5f42] text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-slate-200"
                            >
                                <Plus className="size-3 mr-2" />
                                Connecter mon terrain
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <AddParcelModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
