import { useEffect, useRef } from 'react'
import { bonusUnlocked, currentPage, navigateTo } from '../stores/bookStore'

export const WHEEL_THRESHOLD = 180
export const FLIP_LOCK_MS = 850
const RESET_MS = 500
const POST_FLIP_COOLDOWN_MS = 400
const REVERSE_FLIP_GUARD_MS = 1200

export function computeFlipDirection(accumulated: number): 'forward' | 'backward' | null {
  if (accumulated >= WHEEL_THRESHOLD) return 'forward'
  if (accumulated <= -WHEEL_THRESHOLD) return 'backward'
  return null
}

export function handleKeyboard(
  key: string,
  currentIdx: number,
  maxIdx: number,
): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      return currentIdx < maxIdx ? currentIdx + 1 : null
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      return currentIdx > 0 ? currentIdx - 1 : null
    default:
      return null
  }
}

export function usePageNavigation(
  getActiveEl: () => HTMLElement | null,
  _isFlipping: boolean,
): void {
  const accDelta = useRef(0)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef(0)
  const getActiveElRef = useRef(getActiveEl)
  const isFlippingRef = useRef(false)
  const postFlipCooldown = useRef(false)
  const lastFlipTime = useRef(0)
  const lastFlipDir = useRef(0)

  // Keep getActiveEl ref current without triggering effect re-registration
  useEffect(() => {
    getActiveElRef.current = getActiveEl
  })

  useEffect(() => {
    const isAtTop = (el: HTMLElement | null): boolean =>
      el === null || el.scrollTop === 0

    const isAtBottom = (el: HTMLElement | null): boolean =>
      el === null || Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight

    const goTo = (index: number): void => {
      const now = Date.now()
      const page = currentPage.get()
      const dir = index > page ? 1 : -1

      if (now - lastFlipTime.current < REVERSE_FLIP_GUARD_MS && dir !== lastFlipDir.current) return
      if (isFlippingRef.current || postFlipCooldown.current) return
      if (index < 0 || index >= (bonusUnlocked.get() ? 5 : 4)) return
      if (index === page) return

      lastFlipTime.current = now
      lastFlipDir.current = dir
      isFlippingRef.current = true
      accDelta.current = 0

      navigateTo(index)

      setTimeout(() => {
        isFlippingRef.current = false
        postFlipCooldown.current = true
        setTimeout(() => {
          postFlipCooldown.current = false
          accDelta.current = 0
        }, POST_FLIP_COOLDOWN_MS)
      }, FLIP_LOCK_MS)
    }

    const handleWheel = (e: WheelEvent): void => {
      if (isFlippingRef.current || postFlipCooldown.current) {
        e.preventDefault()
        accDelta.current = 0
        return
      }

      const el = getActiveElRef.current()
      if (e.deltaY > 0 && !isAtBottom(el)) {
        accDelta.current = 0
        return
      }
      if (e.deltaY < 0 && !isAtTop(el)) {
        accDelta.current = 0
        return
      }

      accDelta.current += e.deltaY
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => {
        accDelta.current = 0
      }, RESET_MS)

      const dir = computeFlipDirection(accDelta.current)
      if (dir) {
        accDelta.current = 0
        if (resetTimer.current) clearTimeout(resetTimer.current)
        const idx = currentPage.get()
        goTo(dir === 'forward' ? idx + 1 : idx - 1)
      }
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      const relevant = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']
      if (!relevant.includes(e.key)) return

      const el = getActiveElRef.current()
      if (e.key === 'ArrowDown' && !isAtBottom(el)) return
      if (e.key === 'ArrowUp' && !isAtTop(el)) return

      const unlocked = bonusUnlocked.get()
      const max = unlocked ? 4 : 3
      const idx = currentPage.get()
      const next = handleKeyboard(e.key, idx, max)
      if (next !== null && next !== idx) {
        e.preventDefault()
        goTo(next)
      }
    }

    const handleTouchStart = (e: TouchEvent): void => {
      touchStartY.current = e.touches[0]?.clientY ?? 0
    }

    const handleTouchEnd = (e: TouchEvent): void => {
      const endY = e.changedTouches[0]?.clientY ?? 0
      const diff = touchStartY.current - endY
      if (Math.abs(diff) < 50) return
      const el = getActiveElRef.current()
      if (diff > 0 && !isAtBottom(el)) return
      if (diff < 0 && !isAtTop(el)) return
      const idx = currentPage.get()
      goTo(diff > 0 ? idx + 1 : idx - 1)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, []) // intentionally empty — register once, refs stay current
}
