import { useStore } from '@nanostores/react'
import { chapters } from '@content/data/chapters'
import { bonusUnlocked, currentPage, navigateTo } from '../../stores/bookStore'

export default function PageIndicator() {
  const page = useStore(currentPage)
  const unlocked = useStore(bonusUnlocked)
  const visibleCount = unlocked ? chapters.length : chapters.length - 1

  return (
    <nav className="page-indicator" aria-label="Page navigation">
      {Array.from({ length: visibleCount }, (_, i) => (
        <button
          key={i}
          className={`page-dot${i === page ? ' active' : ''}`}
          onClick={() => navigateTo(i)}
          aria-label={chapters[i]?.navLabel ?? String(i)}
          aria-current={i === page ? 'page' : undefined}
        />
      ))}
    </nav>
  )
}
