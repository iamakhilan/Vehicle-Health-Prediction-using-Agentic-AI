/**
 * Card Component
 * 
 * Simple card container with consistent styling.
 * 
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = ({ children, className, onClick, ...props }) => {
    return (
        <motion.div
            className={cn(
                "rounded-card bg-background-surface border border-functional-mist shadow-float p-6",
                onClick && "cursor-pointer active:scale-95 transition-transform",
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
