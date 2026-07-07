import { expect, test, describe } from 'vitest'
import { cn, formatOccupancy, getDensityLevel } from '../lib/utils'

describe('Utility Functions - Extended', () => {
  describe('cn()', () => {
    test('merges class names correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
      expect(cn('text-white font-bold', 'text-black')).toBe('font-bold text-black')
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
    })

    test('handles undefined/null/false values', () => {
      expect(cn('bg-red-500', undefined, null, false, 'text-white')).toBe('bg-red-500 text-white')
    })

    test('handles conditional classes', () => {
      const isTrue = true
      const isFalse = false
      expect(cn('font-bold', isTrue && 'text-green-500', isFalse && 'text-red-500')).toBe('font-bold text-green-500')
    })
  })

  describe('formatOccupancy()', () => {
    test('formats percentage correctly with capacity', () => {
      expect(formatOccupancy(50, 100)).toBe('50%')
      expect(formatOccupancy(0, 100)).toBe('0%')
      expect(formatOccupancy(120, 100)).toBe('120%')
    })

    test('formats numbers with commas when capacity is undefined', () => {
      expect(formatOccupancy(1000)).toBe('1,000')
      expect(formatOccupancy(1234567)).toBe('1,234,567')
    })

    test('handles 0', () => {
      expect(formatOccupancy(0)).toBe('0')
    })

    test('handles large numbers (100000+)', () => {
      expect(formatOccupancy(500000)).toBe('500,000')
      expect(formatOccupancy(100000)).toBe('100,000')
    })
  })

  describe('getDensityLevel()', () => {
    test("returns 'low' for ratio < 0.4", () => {
      expect(getDensityLevel(0)).toBe('low')
      expect(getDensityLevel(0.39)).toBe('low')
    })

    test("returns 'medium' for ratio 0.4-0.69", () => {
      expect(getDensityLevel(0.4)).toBe('medium')
      expect(getDensityLevel(0.69)).toBe('medium')
    })

    test("returns 'high' for ratio 0.7-0.89", () => {
      expect(getDensityLevel(0.7)).toBe('high')
      expect(getDensityLevel(0.89)).toBe('high')
    })

    test("returns 'critical' for ratio >= 0.9", () => {
      expect(getDensityLevel(0.9)).toBe('critical')
      expect(getDensityLevel(0.95)).toBe('critical')
    })

    test('handles edge cases (0, 1, >1)', () => {
      expect(getDensityLevel(0)).toBe('low')
      expect(getDensityLevel(1)).toBe('critical')
      expect(getDensityLevel(1.5)).toBe('critical')
    })
  })
})
