"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Leaf } from "lucide-react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex max-w-4xl w-[90%] fixed top-5 inset-x-0 mx-auto z-[5000]"
    >
      <div
        className={cn(
          "flex items-center justify-between w-full rounded-full border border-zinc-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md",
          className
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 px-2 group">
          <div className="relative">
            <Leaf className="w-5 h-5 text-green-600 transition-transform group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse blur-[2px] opacity-50" />
          </div>
          <span className="font-black text-base tracking-tighter text-zinc-900 uppercase italic">
            AGRIMAR
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-200" />

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {navItems.map((navItem, idx: number) => (
            <a
              key={`link-${idx}`}
              href={navItem.link}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block">{navItem.name}</span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-200" />

        {/* CTA Button */}
        <Link href="/register">
          <button className="rounded-full bg-green-600 px-5 py-1.5 text-sm font-semibold text-white transition-all hover:bg-green-700">
            Démarrer
          </button>
        </Link>
      </div>
    </motion.div>
  );
};
