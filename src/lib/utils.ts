import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOccupancy(occupancy: number, capacity: number): string {
  if (capacity <= 0) return '0%'
  return `${Math.round((occupancy / capacity) * 100)}%`
}
