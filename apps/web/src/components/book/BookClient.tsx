import { useStore } from '@nanostores/react'
import { useCallback, useEffect } from 'react'
import { chapters } from '@content/data/chapters'
import { usePageNavigation } from '../../hooks/usePageNavigation'
import { bonusUnlocked, currentPage, navigateTo } from '../../stores/bookStore'

export default function BookClient() {
  const page = useStore(currentPage)
  const unlocked = useStore(bonusUnlocked)

  // Sync page visibility and trigger reveal animations
  useEffect(() => {
    const pages = document.querySelectorAll<HTMLElement>('.page')
    pages.forEach((el, i) => {
      const isActive = i === page
      el.classList.toggle('active', isActive)
      if (!isActive) {
        el.querySelectorAll('.rev').forEach((r) => r.classList.remove('on'))
        el.querySelectorAll('.skill-row').forEach((r) => r.classList.remove('go'))
      }
    })

    const incomingPage = document.getElementById(`page-${page}`)
    if (incomingPage) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          incomingPage.scrollTop = 0
        })
      })
    }

    setTimeout(() => {
      const activePage = document.querySelector<HTMLElement>('.page.active')
      if (!activePage) return
      activePage.querySelectorAll<HTMLElement>('.rev').forEach((el, i) => {
        setTimeout(() => el.classList.add('on'), i * 70 + 50)
      })
      if (activePage.id === 'page-2') {
        activePage.querySelectorAll('.skill-row').forEach((row, i) => {
          setTimeout(() => row.classList.add('go'), i * 60 + 300)
        })
      }
    }, 50)
  }, [page])

  const getActiveEl = useCallback((): HTMLElement | null => {
    return document.querySelector<HTMLElement>(`.page[data-page-index="${page}"]`)
  }, [page])

  usePageNavigation(getActiveEl, false)

  const visibleChapters = unlocked ? chapters : chapters.slice(0, chapters.length - 1)

  return (
    <nav className="book-nav" aria-label="Chapter navigation">
      <a className="book-nav__logo" href="/" aria-label="Home">
        MC
      </a>
      <ul className="book-nav__links">
        {visibleChapters.map((ch) => (
          <li key={ch.id}>
            <button
              className={`book-nav__link${page === ch.id ? ' active' : ''}`}
              onClick={() => navigateTo(ch.id)}
              aria-current={page === ch.id ? 'page' : undefined}
            >
              <span className="nav-label">{ch.navLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
