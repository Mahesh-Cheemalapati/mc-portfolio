import { chatError, isLoading, messages } from '../stores/chatStore'
import type { ChatMessage } from '../stores/chatStore'

const API_BASE = import.meta.env.PUBLIC_API_URL ?? ''

async function runTypewriter(
  text: string,
  msgIndex: number,
  onTick?: () => void,
): Promise<void> {
  let displayed = ''
  for (const char of text) {
    displayed += char
    const current = messages.get()
    const updated = [...current]
    const target = updated[msgIndex]
    if (target) {
      updated[msgIndex] = { ...target, content: displayed }
      messages.set(updated)
    }
    if (onTick) onTick()
    await new Promise<void>((resolve) => setTimeout(resolve, 18))
  }
}

export async function sendMessage(
  question: string,
  onTypewriterTick?: () => void,
): Promise<void> {
  if (isLoading.get()) return

  const userMsg: ChatMessage = { role: 'user', content: question }
  messages.set([...messages.get(), userMsg])
  isLoading.set(true)
  chatError.set(null)

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })

    if (res.status === 429) {
      chatError.set("You've reached the daily question limit. Come back tomorrow!")
      isLoading.set(false)
      return
    }

    if (!res.ok) {
      chatError.set('Something went wrong. Please try again.')
      isLoading.set(false)
      return
    }

    const data = (await res.json()) as { answer: string; chunks_used: number }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    const withAssistant = [...messages.get(), assistantMsg]
    messages.set(withAssistant)
    const msgIndex = withAssistant.length - 1

    isLoading.set(false)
    await runTypewriter(data.answer, msgIndex, onTypewriterTick)
  } catch {
    chatError.set('Something went wrong. Please try again.')
    isLoading.set(false)
  }
}

export interface UseChatResult {
  send: (question: string, onTick?: () => void) => Promise<void>
  clear: () => void
}

export function useChat(): UseChatResult {
  const send = async (question: string, onTick?: () => void): Promise<void> => {
    await sendMessage(question, onTick)
  }

  const clear = (): void => {
    messages.set([])
    chatError.set(null)
  }

  return { send, clear }
}
