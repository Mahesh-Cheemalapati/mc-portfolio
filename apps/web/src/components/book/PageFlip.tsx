import { useStore } from '@nanostores/react'
import { useEffect, useRef } from 'react'
import { useFlipAnimation } from '../../hooks/useFlipAnimation'
import { currentPage } from '../../stores/bookStore'

export default function PageFlip() {
  const page = useStore(currentPage)
  const prevPage = useRef(page)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isFlipping, triggerFlip } = useFlipAnimation()

  useEffect(() => {
    const from = prevPage.current
    const to = page
    if (from === to) return
    prevPage.current = to

    triggerFlip({
      fromIndex: from,
      toIndex: to,
      canvasRef,
      onComplete: () => {},
    })
  }, [page, triggerFlip])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 500,
        display: isFlipping ? 'block' : 'none',
      }}
    />
  )
}
