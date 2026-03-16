"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    animation?: "fade" | "slide-up" | "scale" | "slide-left" | "slide-right";
    delay?: number;
    duration?: number;
    once?: boolean;
    stagger?: boolean;
    staggerDelay?: number;
}

export const ScrollReveal = ({
    children,
    animation = "slide-up",
    delay = 0,
    duration = 0.6,
    once = true,
    stagger = false,
    staggerDelay = 0.1,
    className,
    ...props
}: ScrollRevealProps) => {
    const variants = {
        fade: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: stagger ? staggerDelay : 0,
                    delayChildren: delay,
                }
            },
        },
        "slide-up": {
            hidden: { opacity: 0, y: 30 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    staggerChildren: stagger ? staggerDelay : 0,
                    delayChildren: delay,
                    duration,
                    ease: [0.21, 0.47, 0.32, 0.98],
                }
            },
        },
        "slide-left": {
            hidden: { opacity: 0, x: 30 },
            visible: {
                opacity: 1,
                x: 0,
                transition: {
                    staggerChildren: stagger ? staggerDelay : 0,
                    delayChildren: delay,
                    duration,
                }
            },
        },
        "slide-right": {
            hidden: { opacity: 0, x: -30 },
            visible: {
                opacity: 1,
                x: 0,
                transition: {
                    staggerChildren: stagger ? staggerDelay : 0,
                    delayChildren: delay,
                    duration,
                }
            },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: {
                    staggerChildren: stagger ? staggerDelay : 0,
                    delayChildren: delay,
                    duration,
                }
            },
        },
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: 0.1 }}
            variants={variants[animation]}
            className={cn(className)}
            {...props}
        >
            {stagger
                ? React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        // We pass layout-related classes to the wrapper motion.div
                        // specifically grid layout classes, while keeping everything on the child
                        const childClassName = (child.props as any).className || "";
                        const gridClasses = childClassName.match(/(col-span|row-span|lg:col-span|md:col-span)[^\s]*/g)?.join(" ") || "";

                        return (
                            <motion.div
                                variants={childVariants}
                                className={cn(gridClasses)}
                            >
                                {child}
                            </motion.div>
                        );
                    }
                    return child;
                })
                : children}
        </motion.div>
    );
};
