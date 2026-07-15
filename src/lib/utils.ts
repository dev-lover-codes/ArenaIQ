import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Combines clsx (conditional class logic) with tailwind-merge (deduplication).
 *
 * @param inputs - Any number of class values, objects, or arrays
 * @returns A single merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a zone occupancy count as either a raw number or a percentage
 * of capacity, depending on whether capacity is provided.
 *
 * @param occupancy - Current number of people in the zone
 * @param capacity - Optional total zone capacity
 * @returns Formatted string — e.g. "12,450" or "83%"
 */
export function formatOccupancy(occupancy: number, capacity?: number): string {
  if (capacity === undefined) {
    return occupancy.toLocaleString('en-US')
  }
  if (capacity <= 0) return '0%'
  return `${Math.round((occupancy / capacity) * 100)}%`
}

/**
 * Derives a human-readable crowd density level from an occupancy ratio.
 *
 * @param ratio - Fractional occupancy (0.0 = empty, 1.0 = full)
 * @returns One of 'low' | 'medium' | 'high' | 'critical'
 */
export function getDensityLevel(ratio: number): 'low' | 'medium' | 'high' | 'critical' {
  if (ratio < 0.4) return 'low'
  if (ratio < 0.7) return 'medium'
  if (ratio < 0.9) return 'high'
  return 'critical'
}
