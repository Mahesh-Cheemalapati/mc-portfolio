import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMessage, useChat } from '../../src/hooks/useChat'
import { chatError, isLoading, messages } from '../../src/stores/chatStore'

beforeEach(() => {
  messages.set([])
  isLoading.set(false)
  chatError.set(null)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('sendMessage', () => {
  it('successful fetch adds user and assistant messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'hi', chunks_used: 1 }),
      }),
    )

    const p = sendMessage('hello')
    await vi.runAllTimersAsync()
    await p

    const msgs = messages.get()
    expect(msgs).toHaveLength(2)
    expect(msgs[0]?.role).toBe('user')
    expect(msgs[1]?.role).toBe('assistant')
    expect(msgs[1]?.content).toBe('hi')
  })

  it('429 response sets the rate limit error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({}),
      }),
    )

    await sendMessage('hello')

    expect(chatError.get()).toBe(
      "You've reached the daily question limit. Come back tomorrow!",
    )
    expect(isLoading.get()).toBe(false)
  })

  it('isLoading is true while fetch is in flight, false after', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'done', chunks_used: 1 }),
      }),
    )

    const p = sendMessage('hello')
    // sendMessage sets isLoading synchronously before its first await
    expect(isLoading.get()).toBe(true)

    await vi.runAllTimersAsync()
    await p

    expect(isLoading.get()).toBe(false)
  })
})

describe('useChat', () => {
  it('clear() empties messages and error', () => {
    messages.set([{ role: 'user', content: 'hello' }])
    chatError.set('some error')
    const { clear } = useChat()
    clear()
    expect(messages.get()).toHaveLength(0)
    expect(chatError.get()).toBeNull()
  })
})
