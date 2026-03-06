"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ScrollCollision() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Positions for Person A (Left Block)
    const xA = useTransform(smoothProgress, [0, 0.4, 0.7, 1], ["-60vw", "-15vw", "0vw", "0vw"]);
    const yA = useTransform(smoothProgress, [0, 0.4, 0.7, 1], ["-8vh", "-4vh", "0vh", "0vh"]);

    // Positions for Person B (Right Block)
    const xB = useTransform(smoothProgress, [0, 0.4, 0.7, 1], ["60vw", "15vw", "0vw", "0vw"]);
    const yB = useTransform(smoothProgress, [0, 0.4, 0.7, 1], ["8vh", "4vh", "0vh", "0vh"]);

    // Alpha/Opacity shifts
    const combinedOpacity = useTransform(smoothProgress, [0.65, 0.75], [0, 1]);
    const scaleCombined = useTransform(smoothProgress, [0.65, 0.8, 1], [0.8, 1.1, 1]);

    // Left Text: The Problem
    const textOpacity1 = useTransform(smoothProgress, [0, 0.1, 0.3, 0.45], [0, 1, 1, 0]);
    const yText1 = useTransform(smoothProgress, [0, 0.45], [50, -50]);
    const scaleText1 = useTransform(smoothProgress, [0.3, 0.45], [1, 0.9]);

    // Right Text: The Solution
    const textOpacity2 = useTransform(smoothProgress, [0.45, 0.55, 0.8, 1], [0, 1, 1, 1]);
    const yText2 = useTransform(smoothProgress, [0.45, 0.7], [50, 0]);
    const scaleText2 = useTransform(smoothProgress, [0.45, 0.6], [0.9, 1]);

    return (
        <section
            ref={containerRef}
            className="h-[150vh] relative w-full bg-background"
        >
            <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden px-4 md:px-12">

                {/* Left Side: Dynamic Text Area */}
                <div className="relative w-full md:w-1/2 h-48 md:h-[400px] flex items-center justify-center -mt-10 md:mt-0 order-1 md:order-1">
                    {/* Text 1: The Problem */}
                    <motion.div
                        className="absolute text-center md:text-left z-20 w-full max-w-lg"
                        style={{ opacity: textOpacity1, y: yText1, scale: scaleText1 }}
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">每个人的日程<br className="hidden md:block" />都散落各处</h2>
                        <p className="text-xl md:text-2xl text-muted-foreground">沟通成本极高，寻找空闲耗时耗力</p>
                    </motion.div>

                    {/* Text 2: The Solution */}
                    <motion.div
                        className="absolute text-center md:text-left z-20 w-full max-w-lg pointer-events-none"
                        style={{ opacity: textOpacity2, y: yText2, scale: scaleText2 }}
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 text-primary">聚合重叠</h2>
                        <p className="text-xl md:text-2xl text-muted-foreground">滑动滚轮，见证绝佳的共同空闲时段浮现</p>
                    </motion.div>
                </div>

                {/* Right Side: Animation Canvas */}
                <div className="relative w-full md:w-1/2 h-[300px] md:h-[500px] flex items-center justify-center order-2 md:order-2 mt-4 md:mt-0">

                    {/* Background Grid Setup */}
                    <div className="absolute inset-0 grid grid-cols-7 gap-px p-4 opacity-[0.03] pointer-events-none">
                        {Array.from({ length: 28 }).map((_, i) => (
                            <div key={i} className="bg-foreground rounded-sm" />
                        ))}
                    </div>

                    {/* Left Block - Person A */}
                    <motion.div
                        className="absolute w-48 h-32 rounded-2xl border-2 border-indigo-100 bg-white shadow-sm flex flex-col items-center justify-center p-4 dark:border-indigo-900/50 dark:bg-zinc-900"
                        style={{ x: xA, y: yA, zIndex: 10 }}
                    >
                        <span className="text-3xl mb-2">👩‍💻</span>
                        <div className="h-1.5 w-1/2 bg-indigo-100 rounded-full dark:bg-indigo-900/50" />
                        <div className="h-1.5 w-3/4 bg-indigo-100 rounded-full mt-2 dark:bg-indigo-900/50" />
                    </motion.div>

                    {/* Right Block - Person B */}
                    <motion.div
                        className="absolute w-48 h-32 rounded-2xl border-2 border-teal-100 bg-white shadow-sm flex flex-col items-center justify-center p-4 dark:border-teal-900/50 dark:bg-zinc-900"
                        style={{ x: xB, y: yB, zIndex: 10 }}
                    >
                        <span className="text-3xl mb-2">🧑‍🎓</span>
                        <div className="h-1.5 w-3/4 bg-teal-100 rounded-full dark:bg-teal-900/50" />
                        <div className="h-1.5 w-1/2 bg-teal-100 rounded-full mt-2 dark:bg-teal-900/50" />
                    </motion.div>

                    {/* Merged Highlight (Free Time Zone) */}
                    <motion.div
                        className="absolute w-48 h-32 rounded-2xl border-2 border-primary bg-primary/10 overflow-hidden flex flex-col items-center justify-center backdrop-blur-md"
                        style={{ opacity: combinedOpacity, scale: scaleCombined, zIndex: 30 }}
                    >
                        {/* Internal pulse ring */}
                        <motion.div
                            className="absolute inset-0 bg-primary/20 rounded-xl"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span className="text-2xl font-bold text-primary relative z-40 mb-1">FREE</span>
                        <span className="text-sm font-medium text-primary relative z-40">共同空闲区</span>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
