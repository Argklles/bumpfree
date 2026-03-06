"use client";

import { motion, useReducedMotion } from "framer-motion";
import { heavySpring } from "@/lib/animations";

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
            transition={prefersReducedMotion ? { duration: 0.18 } : heavySpring}
        >
            {children}
        </motion.div>
    );
}
