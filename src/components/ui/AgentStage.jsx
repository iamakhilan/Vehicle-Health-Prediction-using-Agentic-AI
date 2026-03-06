import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Caption } from './Typography';

const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

/**
 * AgentStage
 * Handles the "Idle -> Processing -> Complete" motion lifecycle for AI agents.
 * 
 * @param {string} status - 'idle' | 'processing' | 'complete'
 * @param {string} title - Name of the agent (e.g., "Agent 1: Diagnostician")
 * @param {React.ElementType} icon - Lucide Icon component
 * @param {string} processingText - Text to display while processing
 * @param {string} color - Tailwind text color class (e.g., "text-accent-indigo")
 * @param {React.ReactNode} children - The resolved content to show when complete
 */
const AgentStage = ({
    status = 'idle',
    title,
    icon: Icon,
    processingText = "Analyzing...",
    color = "text-primary-ink",
    children,
    className = ""
}) => {

    // Don't render anything if idle (or handle visually if needed, but per plan opacity 0 is fine)
    if (status === 'idle') return null;

    return (
        <div className={`w-full ${className}`}>
            <AnimatePresence mode="wait">
                {/* PROCESSING STATE */}
                {status === 'processing' && (
                    <motion.div
                        key="processing"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={variants}
                        className="py-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]"
                    >
                        {/* Pulse Ring */}
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute inset-0 rounded-full bg-current opacity-20 blur-xl ${color}`}
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className={`relative z-10 p-4 rounded-2xl bg-white/80 shadow-sm border border-white/50 backdrop-blur-sm ${color}`}
                            >
                                <Icon size={32} strokeWidth={1.5} />
                            </motion.div>

                            {/* Orbiting particle for extra "AI" feel */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full"
                            >
                                <div className={`h-2 w-2 rounded-full bg-current absolute -top-1 left-1/2 -translate-x-1/2 ${color}`} />
                            </motion.div>
                        </div>

                        <div>
                            <H3Light className={`${color} mb-2`}>{processingText}</H3Light>
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Caption>{title}</Caption>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* COMPLETE STATE */}
                {status === 'complete' && (
                    <motion.div
                        key="complete"
                        initial="hidden"
                        animate="visible"
                        variants={variants}
                        className="space-y-4"
                    >
                        {/* Header appearing with content */}
                        <motion.div variants={contentVariants} className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg bg-white/50 shadow-sm border border-white/60 ${color}`}>
                                <Icon size={18} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold tracking-wider uppercase opacity-70 ${color}`}>{title}</span>
                                <div className="flex items-center gap-1.5 text-functional-success text-sm font-medium">
                                    <CheckCircle2 size={14} />
                                    <span>Complete</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* The Main Content */}
                        <motion.div variants={contentVariants}>
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper for lightweight headers inside the animation
const H3Light = ({ children, className = "" }) => (
    <h3 className={`font-sans text-xl font-medium tracking-tight ${className}`}>
        {children}
    </h3>
);

export default AgentStage;
