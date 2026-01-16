/**
 * Utility Functions
 * 
 * Provides common utility functions for the application.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 * 
 * @param  {...any} inputs - Class names to merge
 * @returns {string} Merged class string
 * 
 * @example
 * cn('px-4 py-2', condition && 'bg-blue-500', 'px-6') // 'px-6 py-2 bg-blue-500'
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
