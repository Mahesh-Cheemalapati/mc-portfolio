import { atom } from 'nanostores'

export const currentPage = atom<number>(0)
export const bonusUnlocked = atom<boolean>(false)

export function navigateTo(index: number): void {
  const total = bonusUnlocked.get() ? 5 : 4
  if (index < 0 || index >= total) return
  currentPage.set(index)
  if (index === 3 && !bonusUnlocked.get()) {
    bonusUnlocked.set(true)
  }
}
