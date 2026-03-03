"use client";

import { motion } from "framer-motion";
import { heavySpring } from "@/lib/animations";

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={heavySpring}
        >
            {children}
        </motion.div>
    );
}
