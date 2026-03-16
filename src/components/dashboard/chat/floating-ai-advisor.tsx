"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AIAdvisorChat } from "./ai-advisor-chat";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function FloatingAIAdvisor() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Do not show the floating bubble on the dedicated advisor page to avoid redundancy
    if (pathname === "/dashboard/farmer/advisor") {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[400px] h-[550px] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white"
                    >
                        <div className="h-full relative">
                            {/* Close button inside the chat for mobile-friendly or quick close */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-14 z-50 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                            <AIAdvisorChat />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`size-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${isOpen
                            ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                            : "bg-[#2c5f42] text-white hover:bg-[#1f452f] shadow-[#2c5f42]/20"
                        }`}
                    size="icon"
                >
                    {isOpen ? (
                        <X className="size-6 transition-transform rotate-0" />
                    ) : (
                        <div className="relative">
                            <Sparkles className="size-6" />
                            <span className="absolute -top-1 -right-1 size-3 bg-emerald-400 rounded-full border-2 border-[#2c5f42] animate-pulse" />
                        </div>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
