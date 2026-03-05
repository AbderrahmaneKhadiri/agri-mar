"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Label } from "@/components/ui/label";

// Dynamically import Leaflet component with SSR disabled
const MapDrawer = dynamic(() => import("@/components/ui/map-drawer"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-2xl border border-border flex items-center justify-center">
            <span className="text-slate-400 font-medium text-sm">Chargement de la carte...</span>
        </div>
    )
});

export function FarmMapField({ isActive }: { isActive?: boolean }) {
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">
                    Cartographie de votre Parcelle
                </Label>
                {computedArea && (
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[12px] font-bold">
                        Surface calculée : {computedArea} Hectares
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-2 ml-1">
                <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                    Dessinez le contour de votre exploitation sur la carte. Utilisez l'outil polygone (le petit pentagone noir) en haut à droite.
                </p>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl inline-flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>Pour terminer et valider votre dessin, <strong>vous devez cliquer sur le tout premier point blanc</strong> que vous avez posé !</span>
                </div>
            </div>

            <MapDrawer
                isActive={isActive}
                onPolygonCreated={handlePolygonCreated}
                onPolygonDeleted={handlePolygonDeleted}
            />

            {/* Hidden fields to submit along with the form */}
            <input type="hidden" name="parcelGeoJson" value={geoJson} />
            <input type="hidden" name="totalAreaHectares" value={computedArea || ""} />
        </div>
    );
}
