/**
 * Button Component
 * 
 * Styled button with motion animation and variant support.
 * Uses framer-motion for tap feedback.
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost'
 * @param {React.ReactNode} children - Button content
 * @param {React.ElementType} icon - Optional icon component
 * @param {string} className - Additional CSS classes
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className, icon: Icon, ...props }) => {
    const variants = {
        primary: "h-[56px] rounded-pill bg-primary-clay text-white shadow-glow hover:bg-opacity-90",
        secondary: "h-[48px] rounded-super-ellipse bg-secondary-peach text-primary-clay hover:bg-opacity-80",
        ghost: "h-auto bg-transparent text-functional-stone hover:text-primary-ink",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            className={cn(
                "flex w-full items-center justify-center font-sans text-[17px] font-semibold tracking-[-0.4px] transition-colors",
                variants[variant],
                className
            )}
            {...props}
        >
            {Icon && <Icon className="mr-2 h-5 w-5" />}
            {children}
        </motion.button>
    );
};

export default Button;
