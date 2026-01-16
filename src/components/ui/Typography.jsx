/**
 * Typography Components
 * 
 * Consistent text styling components following design system hierarchy.
 * Uses custom font families (Merriweather for serif, Nunito for sans-serif).
 * 
 * Components:
 * - H1: Primary headlines (34px serif)
 * - H2: Section headers (22px sans)
 * - H3: Subsection headers (17px sans)
 * - Body: Content text with variants (serif, ui, small)
 * - Caption: Small labels and metadata (12px uppercase)
 */

import React from 'react';
import { cn } from '../../lib/utils';

export const H1 = ({ children, className, ...props }) => (
    <h1
        className={cn("font-serif text-[34px] leading-[41px] font-bold tracking-[-0.4px] text-primary-ink", className)}
        {...props}
    >
        {children}
    </h1>
);

export const H2 = ({ children, className, ...props }) => (
    <h2
        className={cn("font-sans text-[22px] leading-[28px] font-bold tracking-[-0.2px] text-primary-ink", className)}
        {...props}
    >
        {children}
    </h2>
);

export const H3 = ({ children, className, ...props }) => (
    <h3
        className={cn("font-sans text-[17px] leading-[22px] font-semibold tracking-[-0.4px] text-primary-ink", className)}
        {...props}
    >
        {children}
    </h3>
);

export const Body = ({ children, className, variant = 'ui', ...props }) => {
    const styles = {
        serif: "font-serif text-[18px] leading-[28px] text-primary-ink",
        ui: "font-sans text-[16px] leading-[24px] text-primary-ink",
        small: "font-sans text-[14px] leading-[20px] text-functional-stone",
    };

    return (
        <p
            className={cn(styles[variant], className)}
            {...props}
        >
            {children}
        </p>
    );
};

export const Caption = ({ children, className, ...props }) => (
    <span
        className={cn("font-sans text-[12px] leading-[16px] font-medium uppercase tracking-[0.5px] text-functional-stone", className)}
        {...props}
    >
        {children}
    </span>
);
