import { useCallback, useEffect, useRef, useState } from 'react'
import { chapters } from '@content/data/chapters'

const DURATION = 850

export interface TriggerFlipOptions {
  fromIndex: number
  toIndex: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onComplete: () => void
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function drawScreenTone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha: number,
): void {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  const spacing = 10
  for (let r = y; r < y + h; r += spacing) {
    for (let c = x; c < x + w; c += spacing) {
      ctx.beginPath()
      ctx.arc(c, r, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawSpeedLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  count: number,
  color: string,
  alpha: number,
): void {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const inner = radius * 0.18
    const outer = radius
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
    ctx.stroke()
  }
  ctx.restore()
}

export function useFlipAnimation(): {
  isFlipping: boolean
  triggerFlip: (opts: TriggerFlipOptions) => void
} {
  const [isFlipping, setIsFlipping] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  const triggerFlip = useCallback(
    ({ fromIndex, toIndex, canvasRef, onComplete }: TriggerFlipOptions): void => {
      const canvas = canvasRef.current
      if (!canvas || rafRef.current !== null) return

      const ctxRaw = canvas.getContext('2d')
      if (!ctxRaw) return
      const ctx: CanvasRenderingContext2D = ctxRaw

      const fromCh = chapters[fromIndex]
      const toCh = chapters[toIndex]
      if (!fromCh || !toCh) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const W = canvas.width
      const H = canvas.height
      const forward = toIndex > fromIndex
      const start = performance.now()

      setIsFlipping(true)

      function frame(now: number): void {
        const rawT = Math.min((now - start) / DURATION, 1)
        const t = easeInOut(rawT)

        ctx.clearRect(0, 0, W, H)

        // to-page background (underneath)
        ctx.fillStyle = toCh.theme.bg
        ctx.fillRect(0, 0, W, H)
        drawScreenTone(ctx, 0, 0, W, H, toCh.theme.ink, 0.025)

        // from-page peeling away
        const peelEdge = forward ? W * (1 - t) : W * t
        const curl = 24 * (1 - t)

        ctx.save()
        ctx.beginPath()
        if (forward) {
          ctx.moveTo(0, 0)
          ctx.lineTo(peelEdge, 0)
          ctx.quadraticCurveTo(peelEdge + curl, H / 2, peelEdge + curl * 0.8, H)
          ctx.lineTo(0, H)
        } else {
          ctx.moveTo(peelEdge, 0)
          ctx.lineTo(W, 0)
          ctx.lineTo(W, H)
          ctx.lineTo(peelEdge - curl * 0.8, H)
          ctx.quadraticCurveTo(peelEdge - curl, H / 2, peelEdge, 0)
        }
        ctx.closePath()
        ctx.clip()

        ctx.fillStyle = fromCh.theme.bg
        ctx.fillRect(0, 0, W, H)
        drawScreenTone(ctx, 0, 0, W, H, fromCh.theme.ink, 0.025)
        ctx.restore()

        // fold shadow / curl highlight
        const gx = forward ? peelEdge - 50 : peelEdge - 10
        const grad = ctx.createLinearGradient(gx, 0, gx + 60, 0)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(0.45, 'rgba(0,0,0,0.14)')
        grad.addColorStop(0.7, 'rgba(255,255,255,0.18)')
        grad.addColorStop(1, 'rgba(0,0,0,0.04)')
        ctx.fillStyle = grad
        ctx.fillRect(gx, 0, 60, H)

        // speed lines + chapter flash at midpoint
        if (rawT >= 0.34 && rawT <= 0.66) {
          const pulse = Math.sin(((rawT - 0.34) / 0.32) * Math.PI)
          drawSpeedLines(ctx, W / 2, H / 2, Math.hypot(W, H) / 2, 56, toCh.theme.acc, pulse * 0.28)

          ctx.save()
          ctx.globalAlpha = pulse * 0.55
          ctx.fillStyle = toCh.theme.acc
          ctx.font = `bold ${Math.floor(H * 0.32)}px "Bebas Neue", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(toIndex).padStart(2, '0'), W / 2, H / 2)
          ctx.restore()
        }

        // vignette
        const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85)
        vig.addColorStop(0, 'rgba(0,0,0,0)')
        vig.addColorStop(1, 'rgba(0,0,0,0.28)')
        ctx.fillStyle = vig
        ctx.fillRect(0, 0, W, H)

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          rafRef.current = null
          setIsFlipping(false)
          onComplete()
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    },
    [],
  )

  return { isFlipping, triggerFlip }
}
