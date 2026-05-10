import { atom } from 'nanostores'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const messages = atom<ChatMessage[]>([])
export const isLoading = atom<boolean>(false)
export const chatError = atom<string | null>(null)
export const isChatOpen = atom<boolean>(false)

export function addMessage(msg: ChatMessage): void {
  messages.set([...messages.get(), msg])
}

export function clearError(): void {
  chatError.set(null)
}

export function toggleChat(): void {
  isChatOpen.set(!isChatOpen.get())
}
