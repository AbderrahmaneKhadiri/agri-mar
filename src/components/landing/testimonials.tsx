"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        name: "Khalid Benali",
        role: "Agriculteur — Meknès",
        initials: "KB",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        quote:
            "Depuis Agri-Mar, on a multiplié nos contrats par 3 en 6 mois. Le suivi satellite nous a évité une perte totale sur une de nos parcelles.",
    },
    {
        name: "Sara Moussaoui",
        role: "Directrice Achats — Agrisouss",
        initials: "SM",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        quote:
            "Trouver des fournisseurs fiables était notre problème numéro 1. Aujourd'hui on valide des contrats en quelques clics. Gain de temps énorme.",
    },
    {
        name: "Hassan Tazi",
        role: "Coopérative — Souss-Massa",
        initials: "HT",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        quote:
            "Le dashboard NDVI nous a permis de détecter un stress hydrique à temps. On a sauvé une récolte entière grâce à cette fonctionnalité.",
    },
    {
        name: "Nadia Chraibi",
        role: "Supply Chain — Copag",
        initials: "NC",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        quote:
            "Enfin une plateforme B2B agricole sérieuse. Les profils vérifiés et la messagerie intégrée ont transformé nos processus d'achat.",
    },
    {
        name: "Youssef El Amrani",
        role: "Jeune agriculteur — Marrakech",
        initials: "YE",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        quote:
            "J'ai démarré avec zéro client. En 2 mois j'avais 4 contrats signés. La marketplace m'a donné une vraie vitrine professionnelle.",
    },
    {
        name: "Fatima Zahra Idrissi",
        role: "CEO — Azura Maroc",
        initials: "FZ",
        avatar: "https://randomuser.me/api/portraits/women/90.jpg",
        quote:
            "La transparence sur les profils (certifications, historique, notation) nous permet de prendre des décisions d'achat bien informées.",
    },
    {
        name: "Mehdi Berrada",
        role: "Directeur Général — Zalar",
        initials: "MB",
        avatar: "https://randomuser.me/api/portraits/men/60.jpg",
        quote:
            "On a réduit de 40% le temps de qualification de nos fournisseurs. Agri-Mar centralise tout ce qu'il nous faut en un seul endroit.",
    },
    {
        name: "Amina Ouali",
        role: "Responsable Qualité — Délassus",
        initials: "AO",
        avatar: "https://randomuser.me/api/portraits/women/25.jpg",
        quote:
            "La traçabilité des contrats est parfaite. On sait exactement où en est chaque accord. Un outil indispensable pour notre chaîne d'approvisionnement.",
    },
    {
        name: "Rachid Bougrine",
        role: "Agriculteur bio — Fès",
        initials: "RB",
        avatar: "https://randomuser.me/api/portraits/men/77.jpg",
        quote:
            "Grâce au suivi en temps réel de mes cultures, j'ai optimisé l'irrigation et économisé plus de 30% sur ma consommation d'eau cette saison.",
    },
];

function TestimonialCard({
    name,
    role,
    quote,
    avatar,
    initials,
}: {
    name: string;
    role: string;
    quote: string;
    avatar: string;
    initials: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 shrink-0">
            <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="bg-green-100 text-green-800 text-xs font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm text-black">{name}</p>
                    <p className="text-xs text-zinc-400">{role}</p>
                </div>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">{quote}</p>
        </div>
    );
}

const col1 = [testimonials[0], testimonials[3], testimonials[6]];
const col2 = [testimonials[1], testimonials[4], testimonials[7]];
const col3 = [testimonials[2], testimonials[5], testimonials[8]];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-28 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-green-600 font-semibold text-sm tracking-widest uppercase mb-4">
                        Témoignages
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-black">
                        Aimé par des centaines
                        <br />
                        <span className="text-zinc-300">d'agriculteurs et d'entreprises.</span>
                    </h2>
                </div>

                {/* 3-column infinite upward scroll */}
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto h-[640px] overflow-hidden"
                    style={{
                        maskImage:
                            "linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)",
                    }}
                >
                    {/* Column 1 — speed 30s */}
                    <div
                        className="flex flex-col gap-4"
                        style={{ animation: "scrollUp 30s linear infinite" }}
                    >
                        {[...col1, ...col1, ...col1].map((t, i) => (
                            <TestimonialCard key={t.name + "-c1-" + i} {...t} />
                        ))}
                    </div>

                    {/* Column 2 — speed 25s, offset start */}
                    <div
                        className="flex flex-col gap-4 mt-8"
                        style={{ animation: "scrollUp 25s linear infinite" }}
                    >
                        {[...col2, ...col2, ...col2].map((t, i) => (
                            <TestimonialCard key={t.name + "-c2-" + i} {...t} />
                        ))}
                    </div>

                    {/* Column 3 — speed 35s, different offset */}
                    <div
                        className="flex flex-col gap-4 mt-4"
                        style={{ animation: "scrollUp 35s linear infinite" }}
                    >
                        {[...col3, ...col3, ...col3].map((t, i) => (
                            <TestimonialCard key={t.name + "-c3-" + i} {...t} />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.333%);
          }
        }
      `}</style>
        </section>
    );
}
