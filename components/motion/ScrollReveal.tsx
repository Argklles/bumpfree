"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { heavySpring } from "@/lib/animations";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    yOffset?: number;
}

export function ScrollReveal({ children, delay = 0, className = "", yOffset = 40 }: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ ...heavySpring, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
