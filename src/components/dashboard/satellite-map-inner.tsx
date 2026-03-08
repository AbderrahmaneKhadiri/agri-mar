"use client";

import { MapContainer, TileLayer, ImageOverlay, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper to handle auto-centering when coordinates change
function MapAutoCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

interface SatelliteMapInnerProps {
    center: [number, number];
    zoom: number;
    imageUrl?: string | null;
    imageError: boolean;
    overlayBounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number } | null;
    layerOpacity: number;
    geoJson?: any;
}

export default function SatelliteMapInner({
    center,
    zoom,
    imageUrl,
    imageError,
    overlayBounds,
    layerOpacity,
    geoJson
}: SatelliteMapInnerProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={true}
            doubleClickZoom={true}
        >
            <MapAutoCenter center={center} zoom={zoom} />

            {/* BASE MAP: Google Hybrid */}
            <TileLayer
                attribution='Map data &copy; <a href="https://www.google.com/">Google</a>'
                url="http://mt0.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}"
                maxZoom={20}
            />

            {/* DATA LAYER: Agri-Imagery Overlay */}
            {imageUrl && !imageError && overlayBounds && (
                <ImageOverlay
                    url={imageUrl}
                    bounds={[
                        [overlayBounds.minLat, overlayBounds.minLon],
                        [overlayBounds.maxLat, overlayBounds.maxLon]
                    ]}
                    opacity={layerOpacity}
                    zIndex={10}
                />
            )}

            {/* PARCEL BOUNDARY */}
            {geoJson && (
                <GeoJSON
                    data={geoJson}
                    style={{
                        color: "#2c5f42",
                        weight: 2,
                        fillOpacity: 0.1,
                        fillColor: "#2c5f42"
                    }}
                />
            )}
        </MapContainer>
    );
}
