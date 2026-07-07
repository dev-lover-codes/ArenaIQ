import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOccupancy(occupancy: number, capacity?: number): string {
  if (capacity === undefined) {
    return occupancy.toLocaleString('en-US')
  }
  if (capacity <= 0) return '0%'
  return `${Math.round((occupancy / capacity) * 100)}%`
}

export function getDensityLevel(ratio: number): 'low' | 'medium' | 'high' | 'critical' {
  if (ratio < 0.4) return 'low'
  if (ratio < 0.7) return 'medium'
  if (ratio < 0.9) return 'high'
  return 'critical'
}

