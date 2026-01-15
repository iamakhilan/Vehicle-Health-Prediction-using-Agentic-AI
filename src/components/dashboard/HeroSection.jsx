import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Battery, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils';
// Assuming Typography is available, or we use standard Tailwind
import { H1, H2, Caption } from '../ui/Typography';

const CarVisual = ({ anomaly }) => (
    <div className="relative w-full max-w-[400px] aspect-[1/2] mx-auto">
        {/* Simplified Car Shape (Top View) - Matte Finish */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-zinc-800 rounded-[40px] shadow-2xl overflow-hidden"
        >
            {/* Subtle Surface Details - No glowing gradients */}
            <div className="absolute top-[20%] left-[10%] right-[10%] h-[15%] bg-zinc-900/50 rounded-lg" />
            <div className="absolute top-[36%] left-[12%] right-[12%] h-[25%] bg-zinc-900/30 rounded-lg" />

            {/* Error State: Subtle pulse, not a neon explosion */}
            <motion.div
                animate={anomaly ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[5%] left-[25%] right-[25%] h-[10%] bg-functional-error blur-2xl rounded-full mix-blend-overlay"
            />

            {/* The actual part highlighting */}
            <div className={cn(
                "absolute top-[8%] left-[35%] right-[35%] h-[6%] rounded transition-colors duration-500",
                anomaly ? "bg-functional-error/80" : "bg-zinc-700"
            )} />
        </motion.div>
    </div>
);

const StatPill = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
        <div className="flex items-center gap-2">
            <Icon size={14} className="text-zinc-600" />
            <span className="font-sans text-xl font-medium text-zinc-200">{value}</span>
        </div>
    </div>
);

const HeroSection = ({ anomaly }) => {
    return (
        <section className="relative h-full flex flex-col items-center justify-center py-12">

            {/* Top Stats - Clean floating text, no bubbles */}
            <div className="absolute top-12 left-0 right-0 flex justify-center gap-12 z-20">
                <StatPill icon={Battery} label="Range" value="342 mi" />
                <StatPill icon={Zap} label="Efficiency" value="142 Wh/mi" />
                <StatPill icon={Gauge} label="Odometer" value="12,402" />
            </div>

            <div className="relative z-10 w-full flex-1 flex items-center justify-center">
                <CarVisual anomaly={anomaly} />

                {/* Floating Label - Minimal */}
                <div className="absolute bottom-16 text-center">
                    <h1 className="text-3xl font-medium tracking-tight text-white mb-1">Model S</h1>
                    <p className="text-sm text-zinc-500 tracking-wide uppercase">Plaid • Connected</p>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
