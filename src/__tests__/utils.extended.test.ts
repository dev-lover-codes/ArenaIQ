import { expect, test, describe } from 'vitest'
import { cn, formatOccupancy, getDensityLevel } from '../lib/utils'

describe('Utility Functions — comprehensive', () => {

  // ─── cn() ───────────────────────────────────────────────────────────────────

  describe('cn()', () => {
    test('returns empty string when called with no args', () => {
      expect(cn()).toBe('')
    })

    test('merges two class strings', () => {
      expect(cn('text-white', 'font-bold')).toBe('text-white font-bold')
    })

    test('deduplicates conflicting Tailwind classes (last wins)', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    test('deduplicates padding conflicts (shorthand wins)', () => {
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
    })

    test('handles undefined values gracefully', () => {
      expect(cn('text-white', undefined, 'font-bold')).toBe('text-white font-bold')
    })

    test('handles conditional false values gracefully', () => {
      expect(cn('text-white', false, 'font-bold')).toBe('text-white font-bold')
    })

    test('handles null values gracefully', () => {
      expect(cn('text-white', null, 'font-bold')).toBe('text-white font-bold')
    })

    test('handles conditional true expression', () => {
      const show = true
      expect(cn('base', show && 'extra')).toBe('base extra')
    })

    test('handles conditional false expression (class omitted)', () => {
      const show = false
      expect(cn('base', show && 'extra')).toBe('base')
    })
  })

  // ─── formatOccupancy() ──────────────────────────────────────────────────────

  describe('formatOccupancy()', () => {
    test('returns plain number string when capacity is undefined', () => {
      expect(formatOccupancy(500)).toBe('500')
    })

    test('returns comma-formatted number without capacity', () => {
      expect(formatOccupancy(1000)).toBe('1,000')
    })

    test('returns percentage string with capacity', () => {
      expect(formatOccupancy(50, 100)).toBe('50%')
    })

    test('returns 0% when capacity is zero', () => {
      expect(formatOccupancy(0, 0)).toBe('0%')
    })

    test('handles negative capacity gracefully (treated as zero)', () => {
      expect(formatOccupancy(50, -1)).toBe('0%')
    })

    test('handles large numbers without capacity', () => {
      expect(formatOccupancy(1234567)).toBe('1,234,567')
    })

    test('returns 0 string when occupancy is 0 without capacity', () => {
      expect(formatOccupancy(0)).toBe('0')
    })

    test('handles over-capacity percentage (>100%)', () => {
      expect(formatOccupancy(150, 100)).toBe('150%')
    })

    test('rounds to nearest integer percentage', () => {
      expect(formatOccupancy(1, 3)).toBe('33%')
    })
  })

  // ─── getDensityLevel() ──────────────────────────────────────────────────────

  describe('getDensityLevel()', () => {
    test("returns 'low' for 0", () => {
      expect(getDensityLevel(0)).toBe('low')
    })

    test("returns 'low' for 0.39", () => {
      expect(getDensityLevel(0.39)).toBe('low')
    })

    test("returns 'medium' for 0.4 (boundary)", () => {
      expect(getDensityLevel(0.4)).toBe('medium')
    })

    test("returns 'medium' for 0.69", () => {
      expect(getDensityLevel(0.69)).toBe('medium')
    })

    test("returns 'high' for 0.7 (boundary)", () => {
      expect(getDensityLevel(0.7)).toBe('high')
    })

    test("returns 'high' for 0.89", () => {
      expect(getDensityLevel(0.89)).toBe('high')
    })

    test("returns 'critical' for 0.9 (boundary)", () => {
      expect(getDensityLevel(0.9)).toBe('critical')
    })

    test("returns 'critical' for 1.0", () => {
      expect(getDensityLevel(1.0)).toBe('critical')
    })

    test("returns 'critical' for values > 1 (over-capacity)", () => {
      expect(getDensityLevel(1.5)).toBe('critical')
    })
  })
})
