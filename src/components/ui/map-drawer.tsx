"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// We must import leaflet-draw AFTER leaflet is mounted globally
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// Search component that hooks into react-leaflet's map instance
function SearchField() {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: "bar",
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            searchLabel: "Rechercher un lieu, une commune...",
        });

        map.addControl(searchControl);
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export interface MapDrawerProps {
    onPolygonCreated: (geoJson: any, areaHectares: number) => void;
    onPolygonDeleted: () => void;
    initialPolygon?: any;
    isActive?: boolean;
}

export default function MapDrawer({ onPolygonCreated, onPolygonDeleted, initialPolygon, isActive }: MapDrawerProps) {
    const mapRef = useRef<any>(null);
    const featureGroupRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !mapRef.current) return;

        const map = mapRef.current;
        const container = map.getContainer();

        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });

        if (container) {
            observer.observe(container);
        }

        const timeout = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [mounted]);

    // Secondary effect to force resize when the step becomes active
    useEffect(() => {
        if (isActive && mapRef.current) {
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 200); // Slight delay to ensure flex/grid items have repainted
        }
    }, [isActive]);

    const _onCreate = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === "polygon") {
            const geoJson = layer.toGeoJSON();
            // Calculate area in hectares
            const latlngs = layer.getLatLngs()[0];
            const areaMeters = L.GeometryUtil.geodesicArea(latlngs);
            const areaHectares = areaMeters / 10000;

            // Ensure we only have ONE polygon at a time
            const fg = featureGroupRef.current;
            fg.clearLayers();
            fg.addLayer(layer);

            onPolygonCreated(geoJson, Number(areaHectares.toFixed(2)));
        }
    };

    const _onEdited = (e: any) => {
        const { layers } = e;
        layers.eachLayer((layer: any) => {
            const geoJson = layer.toGeoJSON();
            const latlngs = layer.getLatLngs()[0];
            const areaMeters = L.GeometryUtil.geodesicArea(latlngs);
            const areaHectares = areaMeters / 10000;
            onPolygonCreated(geoJson, Number(areaHectares.toFixed(2)));
        });
    };

    const _onDeleted = (e: any) => {
        onPolygonDeleted();
    };

    if (!mounted) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl border" />;

    // Default to Morocco coordinates
    const moroccoCenter: [number, number] = [31.7917, -7.0926];

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border shadow-sm">
            <MapContainer
                center={moroccoCenter}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='Map data &copy; <a href="https://www.google.com/">Google</a>'
                    url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                    maxZoom={20}
                />

                <SearchField />

                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: {
                                allowIntersection: false,
                                drawError: {
                                    color: "#e1e100",
                                    message: "<strong>Oh snap!<strong> you can't draw that!",
                                },
                                shapeOptions: {
                                    color: "#10b981", // Emerald 500
                                },
                            },
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
        </div>
    );
}
