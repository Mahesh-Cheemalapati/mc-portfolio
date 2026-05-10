import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import { chapters } from '@content/data/chapters'
import { currentPage } from '../../stores/bookStore'

const slugs = chapters.map((ch) => ch.slug)

export default function ThemeProvider() {
  const page = useStore(currentPage)

  useEffect(() => {
    const slug = chapters[page]?.slug ?? 'home'
    slugs.forEach((s) => document.documentElement.classList.remove(s))
    document.documentElement.classList.add(slug)
  }, [page])

  return null
}
