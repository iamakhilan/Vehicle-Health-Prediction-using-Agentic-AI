import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', className, icon: Icon, isLoading, disabled, ...props }) => {
    const variants = {
        primary: "h-[56px] rounded-pill bg-primary-clay text-white shadow-glow hover:bg-opacity-90",
        secondary: "h-[48px] rounded-super-ellipse bg-secondary-peach text-primary-clay hover:bg-opacity-80",
        ghost: "h-auto bg-transparent text-functional-stone hover:text-primary-ink",
    };

    const isDisabled = disabled || isLoading;

    return (
        <motion.button
            whileTap={isDisabled ? undefined : { scale: 0.96 }}
            disabled={isDisabled}
            className={cn(
                "flex w-full items-center justify-center font-sans text-[17px] font-semibold tracking-[-0.4px] transition-colors",
                variants[variant],
                isDisabled && "opacity-70 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {!isLoading && Icon && <Icon className="mr-2 h-5 w-5" />}
            {children}
        </motion.button>
    );
};

export default Button;
