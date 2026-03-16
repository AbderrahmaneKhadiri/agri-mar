"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Zap,
  Droplets,
  BadgeCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import createGlobe from "cobe";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Le LinkedIn de l'Agriculture",
      description:
        "La première plateforme de mise en relation directe. Les agriculteurs valorisent leur savoir-faire et les entreprises trouvent leurs futurs partenaires en un clic.",
      skeleton: <SkeletonOne />,
      className: "col-span-1 lg:col-span-4 border-b lg:border-r border-zinc-100",
    },
    {
      title: "Inscription via WhatsApp",
      description:
        "Zéro barrière technologique. L'agriculteur crée son profil et publie ses offres directement par message. Simple, rapide et accessible à tous.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-zinc-100",
    },
    {
      title: "Transparence Satellite Totale",
      description:
        "Une fois sa ferme tracée, l'agriculteur ouvre une fenêtre sur son exploitation. L'entreprise accède en temps réel aux données NDVI, à l'état des sols et au suivi des cultures.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-zinc-100",
    },
    {
      title: "Écosystème de Confiance",
      description:
        "Agri-Mar sécurise les échanges. Chaque donnée est vérifiée, chaque partenaire est certifié. Construisons ensemble l'avenir de l'agritech au Maroc.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-zinc-100",
    },
  ];

  return (
    <div id="features" className="relative z-20 mx-auto max-w-7xl py-10 lg:py-32">
      <div className="px-8">
        <p className="text-center text-green-600 font-semibold text-sm tracking-widest uppercase mb-4">
          Fonctionnalités
        </p>
        <h4 className="mx-auto max-w-5xl text-center text-3xl font-bold tracking-tight text-black lg:text-5xl lg:leading-tight">
          Des milliers de fonctionnalités
          <br />
          <span className="text-zinc-300">pour votre agriculture.</span>
        </h4>
        <p className="mx-auto my-4 max-w-2xl text-center text-sm font-normal text-zinc-500 lg:text-base">
          Des outils pensés pour le terrain. Simples à utiliser, puissants dans les résultats.
          Agri-Mar a tout ce qu'il vous faut pour faire prospérer votre activité.
        </p>
      </div>

      <div className="relative mt-12">
        <ScrollReveal stagger staggerDelay={0.1} className="grid grid-cols-1 rounded-2xl lg:grid-cols-6 xl:border border-zinc-100 overflow-hidden shadow-sm">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </ScrollReveal>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative overflow-hidden p-8 sm:p-12 bg-white", className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="mx-auto max-w-5xl text-left text-xl font-bold tracking-tight text-black md:text-3xl">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className={cn("mx-0 my-2 max-w-sm text-left text-sm md:text-base", "text-zinc-500 font-medium")}>
      {children}
    </p>
  );
};

// ─── Skeleton 1 — Platform 3D Mockup (Réseau / Farmer Network) ───────────────
export const SkeletonOne = () => {
  const farmers = [
    { name: "Ahmed Ouali", type: "Cultures Diverses", city: "Kenitra", active: false },
    { name: "Ayoub Laich", type: "Coopérative", city: "Casa", badge: "PRO", active: false },
    { name: "Salma Fathi", type: "Maraîchage", city: "Agadir", active: false },
    { name: "Karim Tazi", type: "Arboriculture", city: "Meknès", active: true },
  ];

  return (
    <div className="relative flex justify-center mt-6 h-[360px]">
      <div className="w-full max-w-[580px]">
        <div
          className="rounded-2xl border border-zinc-200 shadow-xl overflow-hidden bg-white"
        >
          {/* Browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border-b border-zinc-100">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="flex-1 mx-3 bg-white border border-zinc-200 rounded-full h-5 flex items-center px-3">
              <span className="text-[9px] text-zinc-400">agri-mar.ma/reseau</span>
            </div>
          </div>

          {/* App layout */}
          <div className="flex h-[260px]">
            {/* Sidebar */}
            <div className="w-[180px] border-r border-zinc-100 flex flex-col flex-shrink-0">
              <div className="px-3 py-2 bg-green-50/60 border-b border-zinc-100">
                <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Réseau ({farmers.length})</span>
              </div>
              {farmers.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border-b border-zinc-50",
                    f.active ? "bg-green-50/80" : ""
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-black text-zinc-600">{f.name[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold text-zinc-800 truncate">{f.name}</p>
                    <p className="text-[7px] text-green-600 truncate">{f.type}</p>
                    <p className="text-[7px] text-zinc-400">📍 {f.city}</p>
                  </div>
                  {f.badge && (
                    <span className="text-[6px] font-black text-green-600 border border-green-300 rounded px-1">PRO</span>
                  )}
                </div>
              ))}
            </div>

            {/* Profile panel */}
            <div className="flex-1 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-green-800 to-green-600 relative">
                <button className="absolute top-2.5 right-2 text-[7px] font-bold bg-white text-zinc-800 px-2 py-1 rounded border border-zinc-200 flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" /> PROPOSER CONTRAT
                </button>
              </div>

              <div className="px-4 pb-2 -mt-5">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow flex items-center justify-center mb-1">
                  <span className="text-[14px] font-black text-zinc-500">K</span>
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[10px] font-black text-zinc-900">Karim Tazi</p>
                  <span className="text-[6px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">✓ PROFIL ESSENTIEL</span>
                </div>
                <p className="text-[8px] text-zinc-400 mb-2">📍 Meknès, Maroc</p>

                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: "NOTE MOYENNE", value: "4.8/5", sub: "12 avis" },
                    { label: "PRODUCTION", value: "15T/an", sub: "Olives" },
                    { label: "SECTEUR", value: "AGRICOLE", sub: "VÉRIFIÉ" },
                  ].map((s, i) => (
                    <div key={i} className="bg-zinc-50 rounded-lg p-1.5 border border-zinc-100">
                      <p className="text-[6px] text-zinc-400 uppercase tracking-wider font-bold">{s.label}</p>
                      <p className="text-[9px] font-black text-zinc-900">{s.value}</p>
                      <p className="text-[6px] text-green-600">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {["ICE: En attente", "ONSSA: En attente", "Irrigation: Standard"].map((t, i) => (
                    <span key={i} className="text-[6px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-500 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton 2 — Modern WhatsApp Chat UI ────────────────────────────────────
export const SkeletonTwo = () => {
  const messages = [
    { from: "farmer", text: "Bonjour! Je souhaite vendre 3 tonnes d'olives.", time: "09:12" },
    { from: "agri", text: "Bonjour Ahmed! Quel est votre prix au kilo?", time: "09:13" },
    { from: "farmer", text: "Je propose 12 DH/kg, qualité Extra ONSSA.", time: "09:14" },
    { from: "agri", text: "Parfait. On peut signer un contrat sur AgrIMar?", time: "09:15" },
    { from: "farmer", text: "Bien sûr! Je partage mon profil 👍", time: "09:15" },
  ];

  return (
    /* Push the phone DOWN so it doesn't cover the title text */
    <div className="relative flex items-start justify-center mt-4 h-[330px] overflow-hidden">
      {/* Modern flat phone — no bezels, just a shadow + rounded screen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-[210px] rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-200"
        style={{ background: "#fff" }}
      >
        {/* WhatsApp-style status bar */}
        <div className="bg-[#075E54] px-4 pt-3 pb-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-green-800">A</span>
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-white leading-none">Ahmed Ouali</p>
            <p className="text-[7px] text-green-300">En ligne</p>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <div className="w-3 h-0.5 bg-white rounded" />
            <div className="w-3 h-0.5 bg-white rounded" />
            <div className="w-3 h-0.5 bg-white rounded" />
          </div>
        </div>

        {/* Chat area */}
        <div
          className="px-2 py-3 flex flex-col gap-2 overflow-hidden"
          style={{
            background: "#ECE5DD url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300000008' fill-opacity='.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            height: "240px",
          }}
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className={cn("flex", msg.from === "agri" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "px-2.5 py-1.5 rounded-xl max-w-[85%] shadow-sm text-[7px]",
                  msg.from === "agri"
                    ? "bg-[#DCF8C6] rounded-tr-none text-zinc-800"
                    : "bg-white rounded-tl-none text-zinc-800"
                )}
              >
                {msg.text}
                <span className="block text-[6px] text-zinc-400 text-right mt-0.5">{msg.time} ✓✓</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input bar */}
        <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-1.5 border-t border-zinc-200">
          <div className="flex-1 bg-white rounded-full h-7 flex items-center px-3">
            <span className="text-[7px] text-zinc-400">Message...</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#075E54] flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </motion.div>

    </div>
  );
};

// ─── Skeleton 3 — Satellite Map (FULL WIDTH) + Detail Cards ──────────────────
export const SkeletonThree = () => {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Full-width map */}
      <div className="relative w-full h-[280px] overflow-hidden rounded-xl border-2 border-zinc-100 shadow-lg mt-4">
        <img
          src="/landing/satellite-map-v2.png"
          alt="Satellite analysis"
          className="w-full h-full object-cover"
        />

        {/* Gradient bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Animated polygon — centred in the image */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice">
          <motion.path
            d="M155,90 L245,90 L238,190 L148,190 Z"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="rgba(34,197,94,0.25)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {([[155, 90], [245, 90], [238, 190], [148, 190]] as [number, number][]).map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="6"
              fill="white"
              stroke="#22c55e"
              strokeWidth="3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </svg>

        {/* Live tag */}
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow flex items-center gap-1.5 border border-zinc-100">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-900 uppercase tracking-wider">Direct Satellite</span>
          </div>
        </div>

        {/* Selection badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-3 right-3 z-20 bg-green-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg"
        >
          <BadgeCheck className="w-3 h-3" />
          <span className="text-[8px] font-bold">Parcelle sélectionnée</span>
        </motion.div>
      </div>

      {/* Data cards row below map */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {[
          { icon: MapPin, color: "green", label: "Surface", value: "1.84 Ha" },
          { icon: Zap, color: "blue", label: "NDVI", value: "0.86", sub: "OPTIMAL" },
          { icon: Droplets, color: "cyan", label: "Humidité", value: "62%" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.2 }}
            className="flex-1 min-w-[80px] bg-white rounded-xl shadow-md border border-zinc-100 p-3 flex items-center gap-2"
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
              card.color === "green" && "bg-green-50",
              card.color === "blue" && "bg-blue-50",
              card.color === "cyan" && "bg-cyan-50",
            )}>
              <card.icon className={cn(
                "w-3.5 h-3.5",
                card.color === "green" && "text-green-600",
                card.color === "blue" && "text-blue-600",
                card.color === "cyan" && "text-cyan-600",
              )} />
            </div>
            <div className="min-w-0">
              <p className="text-[7px] text-zinc-400 uppercase tracking-wide font-bold">{card.label}</p>
              <p className={cn(
                "text-sm font-black leading-tight",
                card.color === "green" ? "text-zinc-900" : card.color === "blue" ? "text-green-600" : "text-cyan-700"
              )}>
                {card.value}
              </p>
              {card.sub && <span className="text-[7px] text-zinc-400">{card.sub}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Skeleton 4 — Globe bleeding off bottom-right corner ─────────────────────
export const SkeletonFour = () => {
  return (
    <div className="relative mt-4 h-[320px] overflow-hidden group/globe">
      {/* Trust Badges */}
      <div className="absolute top-2 right-0 bg-white shadow-xl border border-zinc-100 p-2 rounded-xl flex items-center gap-2 z-20">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
        <span className="text-[9px] font-bold text-black uppercase">Verified Network</span>
      </div>

      <div className="absolute top-14 left-0 bg-white shadow-xl border border-zinc-100 p-2 rounded-xl flex items-center gap-2 z-20">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[9px] font-bold text-black uppercase">Certified Data</span>
      </div>

      {/* Globe pinned to bottom-right, bleeding off edge */}
      <Globe className="absolute -bottom-10 -right-10 opacity-100 drop-shadow-2xl scale-110" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.5,
      mapSamples: 20000,
      mapBrightness: 10,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.7, 0.3], // High contrast green
      glowColor: [1, 1, 1],
      markers: [
        { location: [31.7917, -7.0926], size: 0.12 },
        { location: [33.5731, -7.5898], size: 0.09 },
        { location: [30.4278, -9.5981], size: 0.07 },
        { location: [33.8935, -5.5547], size: 0.07 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003;
      },
    });

    return () => { globe.destroy(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={cn("opacity-100 transition-opacity duration-500", className)}
    />
  );
};
