"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InfiniteMovingCardsProps {
    items: { name: string; logo?: string }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "normal",
    pauseOnHover = true,
    className,
}: InfiniteMovingCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        addAnimation();
    }, []);

    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem);
                }
            });

            getDirection();
            getSpeed();
        }
    }

    const getDirection = () => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                "--animation-direction",
                direction === "left" ? "forwards" : "reverse"
            );
        }
    };

    const getSpeed = () => {
        if (containerRef.current) {
            const duration =
                speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
            containerRef.current.style.setProperty("--animation-duration", duration);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
                className
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-10 py-4 w-max flex-nowrap",
                    pauseOnHover && "hover:[animation-play-state:paused]",
                    "animate-scroll"
                )}
            >
                {items.map((item, idx) => (
                    <li
                        key={idx}
                        className={cn(
                            "flex items-center justify-center px-10 py-4 rounded-xl border border-zinc-100 bg-white/50 shadow-sm cursor-default select-none transition-all duration-300",
                            "hover:border-zinc-200 hover:shadow-md hover:bg-white"
                        )}
                    >
                        <span className="text-xl font-black text-zinc-300 tracking-tighter uppercase italic whitespace-nowrap">
                            {item.name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
