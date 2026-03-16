"use client";

import { useState } from "react";
import { InlineWidget } from "react-calendly";
import { motion, AnimatePresence } from "motion/react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const AVATARS = [
    { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", x: -120, y: -40, delay: 0 },
    { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria", x: 140, y: -80, delay: 0.5 },
    { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", x: -160, y: 100, delay: 1 },
    { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", x: 180, y: 60, delay: 1.5 },
];

const TESTIMONIALS = [
    {
        quote: "Cette plateforme a révolutionné notre chaîne d'approvisionnement. La visibilité gagnée est incroyable pour nos exports.",
        highlight: "révolutionné",
        author: "Mohammed Alami",
        role: "Directeur Export, Atlas Fruits",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
        quote: "Le suivi satellite nous permet d'anticiper les récoltes avec une précision chirurgicale. Un gain de temps précieux.",
        highlight: "précision chirurgicale",
        author: "Sarah Mansouri",
        role: "Responsable Agronomie, BioMaroc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
        quote: "La mise en relation directe a réduit nos coûts logistiques de 20%. La transparence est enfin au rendez-vous.",
        highlight: "réduit nos coûts",
        author: "Karim Tazi",
        role: "Chef de Produit, AgriProc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim"
    }
];

export function CalendlySection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    return (
        <section id="demo-booking" className="py-32 bg-white overflow-hidden relative">
            {/* Floating Avatars Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-full max-w-4xl h-96">
                    {AVATARS.map((avatar, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            animate={{
                                y: [avatar.y, avatar.y - 15, avatar.y],
                            }}
                            transition={{
                                delay: avatar.delay,
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute"
                            style={{
                                left: `calc(50% + ${avatar.x}px)`,
                                top: `calc(50% + ${avatar.y}px)`
                            }}
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-green-50 p-1">
                                <img src={avatar.src} alt="User" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Session de Feedback
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto">
                            Réservez une session pour explorer notre plateforme et découvrir comment elle peut accélérer votre activité agricole.
                            Si vous avez des questions techniques, n'hésitez pas à <span className="text-zinc-900 font-medium underline underline-offset-4 cursor-pointer">contacter notre équipe</span>.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto bg-white rounded-[2rem] border border-zinc-200 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[900px]"
                >
                    {/* Form / Calendly Column */}
                    <div className="w-full md:w-[65%] border-r border-zinc-100 p-0 order-2 md:order-1 flex items-center justify-center bg-white">
                        <div className="w-full">
                            <InlineWidget
                                url="https://calendly.com/abder7-khadiri/30min"
                                styles={{
                                    height: "850px",
                                    width: "100%"
                                }}
                            />
                        </div>
                    </div>

                    {/* Testimonial Column */}
                    <div className="w-full md:w-[35%] bg-zinc-50/50 p-10 flex flex-col justify-between order-1 md:order-2">
                        <div>
                            {/* Brand Logo (Agri-Mar) */}
                            <div className="flex items-center gap-2 mb-20">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    A
                                </div>
                                <span className="text-xl font-bold tracking-tight uppercase">Agri-Mar</span>
                            </div>

                            <div className="min-h-[250px] relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative"
                                    >
                                        <Quote className="w-10 h-10 text-zinc-200 absolute -top-12 -left-4" />
                                        <p className="text-xl font-medium leading-normal text-zinc-800 mb-8">
                                            "{TESTIMONIALS[currentIndex].quote.split(TESTIMONIALS[currentIndex].highlight).map((part, i, arr) => (
                                                <span key={i}>
                                                    {part}
                                                    {i < arr.length - 1 && <span className="text-green-600">{TESTIMONIALS[currentIndex].highlight}</span>}
                                                </span>
                                            ))}"
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shadow-inner">
                                                <img src={TESTIMONIALS[currentIndex].avatar} alt={TESTIMONIALS[currentIndex].author} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">
                                                    {TESTIMONIALS[currentIndex].author}
                                                </p>
                                                <p className="text-sm text-zinc-500 uppercase tracking-widest text-[8px]">
                                                    {TESTIMONIALS[currentIndex].role}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex gap-2 mt-20">
                            <button
                                onClick={prevTestimonial}
                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
