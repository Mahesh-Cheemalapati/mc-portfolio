import { beforeEach, describe, expect, it } from 'vitest'
import {
  WHEEL_THRESHOLD,
  computeFlipDirection,
  handleKeyboard,
} from '../../src/hooks/usePageNavigation'
import { bonusUnlocked, currentPage } from '../../src/stores/bookStore'

beforeEach(() => {
  currentPage.set(0)
  bonusUnlocked.set(false)
})

describe('computeFlipDirection', () => {
  it('returns null when accumulation is below threshold', () => {
    expect(computeFlipDirection(WHEEL_THRESHOLD - 1)).toBeNull()
  })

  it('returns forward when accumulation meets threshold', () => {
    expect(computeFlipDirection(WHEEL_THRESHOLD)).toBe('forward')
  })

  it('returns backward for negative accumulation at threshold', () => {
    expect(computeFlipDirection(-WHEEL_THRESHOLD)).toBe('backward')
  })
})

describe('handleKeyboard', () => {
  it('ArrowRight advances forward', () => {
    expect(handleKeyboard('ArrowRight', 0, 4)).toBe(1)
  })

  it('ArrowLeft goes backward', () => {
    expect(handleKeyboard('ArrowLeft', 2, 4)).toBe(1)
  })

  it('returns null at upper boundary', () => {
    expect(handleKeyboard('ArrowRight', 4, 4)).toBeNull()
  })

  it('returns null at lower boundary', () => {
    expect(handleKeyboard('ArrowLeft', 0, 4)).toBeNull()
  })

  it('returns null for unrecognised key', () => {
    expect(handleKeyboard('Escape', 2, 4)).toBeNull()
  })
})
