import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values using clsx and optimizes them with tailwind-merge.
 * This utility helps with conditional class rendering in components.
 * 
 * @param inputs - Array of class values to be combined
 * @returns Optimized string of class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
