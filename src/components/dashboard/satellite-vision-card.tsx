"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeOff, Layers, Camera, Maximize2, Loader2, Download, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Leaflet styles
import "leaflet/dist/leaflet.css";

// Dynamic import for the stabilized map component
const SatelliteMapInner = dynamic(() => import("./satellite-map-inner"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 space-y-3">
            <Loader2 className="size-8 text-[#2c5f42] animate-spin" />
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Chargement SIG...</p>
        </div>
    )
});

interface SatelliteScene {
    dt: number;
    type: string;
    cl: number;
    image: {
        truecolor: string;
        falsecolor: string;
        ndvi: string;
    };
    tile: {
        truecolor: string;
        falsecolor: string;
        ndvi: string;
    };
    data?: {
        truecolor: string;
        falsecolor: string;
        ndvi: string;
    };
}

interface SatelliteVisionCardProps {
    scenes: SatelliteScene[];
    geoJson?: any;
    isSyncing?: boolean;
    className?: string;
}

export function SatelliteVisionCard({
    scenes,
    geoJson,
    isSyncing,
    className
}: SatelliteVisionCardProps) {
    const [viewMode, setViewMode] = useState<"truecolor" | "falsecolor" | "ndvi">("truecolor");
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
    const [layerOpacity, setLayerOpacity] = useState(0.8);

    const [imageError, setImageError] = useState(false);
    const activeScene = scenes?.[selectedSceneIndex];
    const imageUrl = activeScene?.image?.[viewMode];
    const geoTiffUrl = activeScene?.data?.[viewMode];

    const handleDownloadGeoTiff = () => {
        if (geoTiffUrl) {
            window.open(geoTiffUrl, "_blank");
        } else {
            alert("Le fichier GeoTIFF haute résolution n'est pas disponible pour cette date.");
        }
    };

    // Calculate Bounding Box and SVG Path for Parcel Boundary
    const getPolygonOverlay = () => {
        if (!geoJson) return null;

        let geometry = geoJson;
        if (geoJson.type === "Feature") {
            geometry = geoJson.geometry;
        }

        if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) return null;

        const coords = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates;
        if (!coords || coords.length < 3) return null;

        let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
        coords.forEach(([lon, lat]: [number, number]) => {
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
        });

        return { bounds: { minLon, maxLon, minLat, maxLat } };
    };

    const overlayData = getPolygonOverlay();

    if (isSyncing) {
        return (
            <Card className={cn("h-[450px] w-full flex flex-col items-center justify-center bg-white rounded-2xl border border-border space-y-4 overflow-hidden relative shadow-sm", className)}>
                <div className="absolute inset-0 bg-slate-50/50 animate-pulse" />
                <Loader2 className="size-10 text-[#2c5f42] animate-spin relative z-10" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[3px] relative z-10">Initialisation du flux Satellite...</p>
            </Card>
        );
    }

    if (!activeScene) {
        return (
            <Card className={cn("h-[450px] w-full flex flex-col items-center justify-center bg-slate-50 border-dashed border-2 rounded-2xl space-y-3", className)}>
                <Camera className="size-10 text-slate-200" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Aucune donnée satellite disponible</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] text-center">En attente du prochain passage du satellite Sentinel-2.</p>
            </Card>
        );
    }

    // Default map settings
    const mapCenter: [number, number] = overlayData
        ? [(overlayData.bounds.minLat + overlayData.bounds.maxLat) / 2, (overlayData.bounds.minLon + overlayData.bounds.maxLon) / 2]
        : [31.7917, -7.0926];
    const mapZoom = overlayData ? 16 : 6;

    return (
        <Card className={cn("h-[450px] w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden relative group flex flex-col", className)}>
            {/* Top Indicator */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="size-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Layers className="size-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Vision Satellite</p>
                        <p className="text-[9px] text-white/60 leading-none">Sentinel-2 • {new Date(activeScene.dt * 1000).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 flex items-center gap-1.5 shadow-sm">
                        <div className={cn("size-1.5 rounded-full", activeScene.cl < 10 ? "bg-emerald-500" : "bg-amber-500")} />
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">Nuage: {activeScene.cl.toFixed(1)}%</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-md text-slate-600 hover:bg-white border border-slate-200 shadow-sm">
                        <Maximize2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Base Content Zone (Leaflet) */}
            <div className="flex-1 relative bg-slate-50">
                <div className="absolute inset-0 z-0">
                    <SatelliteMapInner
                        center={mapCenter}
                        zoom={mapZoom}
                        imageUrl={imageUrl}
                        imageError={imageError}
                        overlayBounds={overlayData?.bounds}
                        layerOpacity={layerOpacity}
                        geoJson={geoJson}
                    />
                </div>

                {/* Loading/Error State Overlays */}
                {(!imageUrl || imageError) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-8 text-center z-10 bg-black/40 backdrop-blur-[2px]">
                        <EyeOff className="size-10 text-white/20" />
                        <div className="space-y-1">
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Traitement Spectral</p>
                            <p className="text-white/20 text-[10px] font-medium max-w-[280px]">
                                {imageError ? "Erreur de chargement du flux." : "Analyse des données en cours..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* HUD Elements */}
                {imageUrl && overlayData && (
                    <div className="absolute top-24 left-6 z-40 bg-white/80 backdrop-blur-xl border border-slate-200 p-2.5 rounded-2xl flex flex-col gap-2 items-center shadow-lg">
                        <SlidersHorizontal className="size-3.5 text-slate-400" />
                        <div className="h-24 w-1.5 bg-slate-100 rounded-full relative overflow-hidden flex flex-col justify-end">
                            <div
                                className="w-full bg-[#2c5f42] transition-all duration-300"
                                style={{ height: `${layerOpacity * 100}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={layerOpacity}
                                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                                className="absolute inset-x-0 h-full opacity-0 cursor-pointer [appearance:slider-vertical]"
                            />
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">OP</span>
                    </div>
                )}

                {/* GIS Status */}
                <div className="absolute bottom-6 right-8 z-40 flex flex-col items-end gap-1.5 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xl">
                        <div className="size-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-widest leading-none">Système Cartographique OK</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 left-8 z-40 bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-2xl flex flex-col gap-2 pointer-events-none shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-[#2c5f42] shadow-sm" />
                        <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest leading-none">Ma Parcelle</span>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-20">
                    <button
                        onClick={() => setViewMode("truecolor")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            viewMode === "truecolor" ? "bg-[#2c5f42] text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        Réelle
                    </button>
                    <button
                        onClick={() => setViewMode("falsecolor")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            viewMode === "falsecolor" ? "bg-[#2c5f42] text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        Vigueur
                    </button>
                    <button
                        onClick={() => setViewMode("ndvi")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            viewMode === "ndvi" ? "bg-[#2c5f42] text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        NDVI
                    </button>
                </div>
            </div>

            {/* Footer / Summary Bar */}
            <div className="h-16 bg-white px-6 flex items-center justify-between border-t border-slate-100 shrink-0">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Analyse Spectrale</span>
                    <span className="text-[11px] font-bold text-slate-900">
                        {viewMode === "truecolor" ? "Couleurs Réelles" : viewMode === "falsecolor" ? "Vigueur de Biomasse" : "Indice de Santé (NDVI)"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleDownloadGeoTiff}
                        variant="ghost"
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 h-8 gap-2"
                    >
                        <Download className="size-3.5" /> GeoTIFF
                    </Button>
                    <div className="h-4 w-px bg-slate-100" />
                    <span className="text-[10px] font-bold text-[#2c5f42] bg-[#f0f8f4] px-2.5 py-1 rounded border border-[#d4e9dc]/50">SIG ACTIF</span>
                </div>
            </div>
        </Card>
    );
}
