"use client";

import { motion } from "framer-motion";

interface SkeletonPulseProps {
    className?: string;
    delay?: number;
}

export function SkeletonPulse({ className, delay = 0 }: SkeletonPulseProps) {
    return (
        <motion.div
            className={className}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{
                duration: 1.6,
                delay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{ backgroundColor: "#f2f2f7" }}
        />
    );
}
