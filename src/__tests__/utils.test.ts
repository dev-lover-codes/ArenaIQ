import { expect, test, describe } from 'vitest'
import { cn, formatOccupancy } from '../lib/utils'

describe('Utility Functions (utils.ts)', () => {
  test('cn merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
    expect(cn('text-white', false && 'text-black', 'font-bold')).toBe('text-white font-bold')
  })

  test('formatOccupancy formats percentage correctly', () => {
    expect(formatOccupancy(50, 100)).toBe('50%')
    expect(formatOccupancy(0, 50)).toBe('0%')
    expect(formatOccupancy(120, 100)).toBe('120%')
    expect(formatOccupancy(50, 0)).toBe('0%')
  })
})
