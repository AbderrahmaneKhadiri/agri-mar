"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Cloud,
    CloudRain,
    CloudSun,
    Droplets,
    Sun,
    Wind,
    Thermometer,
    CloudLightning,
    CloudSnow,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
    current: any;
    forecast?: any[];
    locationName: string;
    isSyncing?: boolean;
}

const getWeatherIcon = (code: string) => {
    // OpenWeatherMap condition codes
    const id = parseInt(code);
    if (id >= 200 && id < 300) return <CloudLightning className="size-6 text-amber-500" />;
    if (id >= 300 && id < 600) return <CloudRain className="size-6 text-blue-500" />;
    if (id >= 600 && id < 700) return <CloudSnow className="size-6 text-blue-200" />;
    if (id === 800) return <Sun className="size-6 text-amber-500" />;
    if (id === 801) return <CloudSun className="size-6 text-slate-400" />;
    return <Cloud className="size-6 text-slate-400" />;
};

export function WeatherCard({ current, forecast, locationName, isSyncing }: WeatherCardProps) {
    if (isSyncing) {
        return (
            <Card className="border-none shadow-sm bg-slate-50 overflow-hidden rounded-[2rem] min-h-[160px] flex flex-col justify-center">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Loader2 className="size-12 text-[#4a8c5c] mb-4 animate-spin" />
                    <h3 className="font-bold text-slate-900">Météo : Synchronisation Satellite...</h3>
                    <p className="text-[12px] text-slate-400 mt-1">Récupération des données ultra-locales en cours. Cela peut prendre quelques secondes.</p>
                </CardContent>
            </Card>
        );
    }

    if (!current) {
        return (
            <Card className="border-none shadow-sm bg-slate-50 overflow-hidden rounded-[2rem] min-h-[160px] flex flex-col justify-center">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Cloud className="size-12 text-slate-200 mb-4" />
                    <h3 className="font-bold text-slate-900">Météo temporairement indisponible</h3>
                    <p className="text-[12px] text-slate-400 mt-1">L&apos;API satellite met du temps à répondre. Rafraîchissez la page dans quelques instants.</p>
                </CardContent>
            </Card>
        );
    }

    const main = current.main || current.weather[0]; // AgroMonitoring structure
    const weather = current.weather[0];

    return (
        <Card className="border border-border shadow-sm bg-white overflow-hidden rounded-xl relative group">
            {/* Glossy accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2c5f42]/5 blur-[100px] -mr-32 -mt-32" />

            <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-[#2c5f42] bg-[#f0f8f4] px-2 py-0.5 rounded-full uppercase tracking-widest">Temps Réel</span>
                            <span className="text-[10px] font-bold text-slate-400">{locationName}</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {Math.round(current.main.temp - 273.15)}°C
                        </h2>
                        <p className="text-[14px] font-semibold text-slate-500 capitalize">{weather.description}</p>
                    </div>
                    <div className="size-16 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner border border-white/50">
                        {getWeatherIcon(weather.id.toString())}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-white/40 flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#4a8c5c]">
                            <Droplets className="size-4" />
                        </div>
                        <div>
                            <div className="text-[14px] font-black text-slate-900">{current.main.humidity}%</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Humidité</div>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-white/40 flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500">
                            <Wind className="size-4" />
                        </div>
                        <div>
                            <div className="text-[14px] font-black text-slate-900">{Math.round(current.wind.speed * 3.6)} <span className="text-[10px]">km/h</span></div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vent</div>
                        </div>
                    </div>
                </div>

                {forecast && forecast.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <div className="flex justify-between gap-4">
                            {forecast.slice(0, 4).map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                                        {idx === 0 ? "Demain" : format(new Date(day.dt * 1000), "EEE", { locale: fr })}
                                    </span>
                                    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                        {getWeatherIcon(day.weather[0].id.toString())}
                                    </div>
                                    <span className="text-[13px] font-black text-slate-900">
                                        {Math.round(day.main.temp - 273.15)}°
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
