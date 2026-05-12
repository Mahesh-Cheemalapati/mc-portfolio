import { useEffect, useRef } from 'react'
import { bonusUnlocked, currentPage, navigateTo } from '../stores/bookStore'

export const WHEEL_THRESHOLD = 280
export const FLIP_LOCK_MS = 850
const RESET_MS = 800
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
  const touchStartX = useRef(0)
  const getActiveElRef = useRef(getActiveEl)
  const isFlippingRef = useRef(false)
  const postFlipCooldown = useRef(false)
  const lastFlipTime = useRef(0)
  const lastFlipDir = useRef(0)
  const isTouchNav = useRef(false)

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

      const cooldown = isTouchNav.current ? 250 : POST_FLIP_COOLDOWN_MS
      isTouchNav.current = false

      setTimeout(() => {
        isFlippingRef.current = false
        postFlipCooldown.current = true
        setTimeout(() => {
          postFlipCooldown.current = false
          accDelta.current = 0
        }, cooldown)
      }, FLIP_LOCK_MS)
    }

    const handleWheel = (e: WheelEvent): void => {
      const chatPanel = document.getElementById('chat-panel')
      if (chatPanel && chatPanel.contains(e.target as Node)) return

      if (isFlippingRef.current || postFlipCooldown.current) {
        e.preventDefault()
        return
      }

      const el = getActiveElRef.current()
      const scrollTop = el ? Math.round(el.scrollTop) : 0
      const scrollHeight = el ? Math.round(el.scrollHeight) : 0
      const clientHeight = el ? Math.round(el.clientHeight) : 0
      const atTop = el === null || scrollTop === 0
      const atBottom = el === null || scrollTop + clientHeight >= scrollHeight
      const isFlat = el === null || scrollHeight <= clientHeight + 2

      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      if (goingDown && !atBottom && !isFlat) { accDelta.current = 0; return }
      if (goingUp && !atTop && !isFlat) { accDelta.current = 0; return }

      e.preventDefault()

      if (goingDown && (atBottom || isFlat)) accDelta.current += e.deltaY
      else if (goingUp && (atTop || isFlat)) accDelta.current += e.deltaY

      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => { accDelta.current = 0 }, RESET_MS)

      const idx = currentPage.get()
      if (accDelta.current > WHEEL_THRESHOLD) {
        accDelta.current = 0
        if (resetTimer.current) clearTimeout(resetTimer.current)
        goTo(idx + 1)
      } else if (accDelta.current < -WHEEL_THRESHOLD) {
        accDelta.current = 0
        if (resetTimer.current) clearTimeout(resetTimer.current)
        goTo(idx - 1)
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
      if (e.touches.length !== 1) return
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent): void => {
      if (isFlippingRef.current || postFlipCooldown.current) return
      if (e.changedTouches.length !== 1) return

      const dy = touchStartY.current - (e.changedTouches[0]?.clientY ?? 0)
      const dx = touchStartX.current - (e.changedTouches[0]?.clientX ?? 0)

      const isVertical = Math.abs(dy) > Math.abs(dx)
      if (!isVertical || Math.abs(dy) < 52) return

      const el = getActiveElRef.current()
      if (dy > 0 && !isAtBottom(el)) return
      if (dy < 0 && !isAtTop(el)) return

      const idx = currentPage.get()
      isTouchNav.current = true
      goTo(dy > 0 ? idx + 1 : idx - 1)
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
