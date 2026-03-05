"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Globe, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { createParcelAction } from "@/actions/parcels.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

const MapDrawer = dynamic(() => import("@/components/ui/map-drawer"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-xl border border-border flex items-center justify-center">
            <span className="text-slate-400 font-medium text-sm">Chargement de la carte...</span>
        </div>
    )
});

interface AddParcelModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddParcelModal({ isOpen, onOpenChange }: AddParcelModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [geoJson, setGeoJson] = useState<string>("");
    const [computedArea, setComputedArea] = useState<number | null>(null);

    const handlePolygonCreated = (newGeoJson: any, areaHectares: number) => {
        setGeoJson(JSON.stringify(newGeoJson));
        setComputedArea(areaHectares);
    };

    const handlePolygonDeleted = () => {
        setGeoJson("");
        setComputedArea(null);
    };

    const handleConfirm = async () => {
        if (!geoJson) {
            toast.error("Veuillez dessiner votre parcelle sur la carte");
            return;
        }

        if (computedArea && computedArea < 1.0) {
            toast.error("La surface doit être d'au moins 1.0 hectare pour activer le suivi satellite.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createParcelAction({
                geoJson,
                area: computedArea?.toString() || "0",
            });

            if (result.success) {
                toast.success("Parcelle connectée avec succès !");
                onOpenChange(false);
                window.location.reload(); // Refresh to update dashboard weather/NDVI
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border shadow-xl rounded-xl bg-white">
                {/* Header Style Devis */}
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Surveillance & Satellite
                    </DialogDescription>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-[18px] font-semibold text-foreground leading-none">
                            Connecter mon Exploitation
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="flex flex-col h-[500px]">
                    <div className="flex-1 relative bg-slate-50 border-b border-border overflow-hidden">
                        <MapDrawer
                            isActive={isOpen}
                            onPolygonCreated={handlePolygonCreated}
                            onPolygonDeleted={handlePolygonDeleted}
                        />

                        {computedArea !== null && (
                            <div className={cn(
                                "absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border shadow-xl p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-1 min-w-[150px]",
                                computedArea < 1.0 ? "border-amber-200" : "border-emerald-100"
                            )}>
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Surface</div>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-2xl font-black tabular-nums tracking-tight",
                                        computedArea < 1.0 ? "text-amber-500" : "text-emerald-600"
                                    )}>
                                        {computedArea.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground">Ha</span>
                                </div>

                                <div className={cn(
                                    "mt-1 flex items-center gap-1.5 p-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider",
                                    computedArea < 1.0 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                )}>
                                    <div className={cn("size-1.5 rounded-full shrink-0", computedArea < 1.0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                                    {computedArea < 1.0 ? "Simulation" : "Direct Satellite"}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-5 bg-white">
                        <div className="flex items-center justify-between gap-8">
                            <div className="flex items-start gap-3 flex-1">
                                <Activity className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-foreground uppercase tracking-[0.1em]">Information Technique</p>
                                    <p className="text-[11px] text-muted-foreground max-w-[400px] leading-relaxed">
                                        L'API satellite nécessite <span className="text-emerald-600 font-semibold underline underline-offset-2">1.0 Ha</span> pour activer le suivi NDVI réel.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <Button
                                    variant="ghost"
                                    className="text-[13px] text-muted-foreground h-10 px-6 font-medium"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    className="h-10 px-8 text-[13px] font-semibold bg-[#2c5f42] shadow-sm hover:bg-[#2c5f42]/90"
                                    disabled={isSubmitting || !geoJson}
                                    onClick={handleConfirm}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Activer mon Terrain"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
