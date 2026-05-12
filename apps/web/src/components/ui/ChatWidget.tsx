import { useStore } from '@nanostores/react'
import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { chatError, isChatOpen, isLoading, messages, toggleChat } from '../../stores/chatStore'
import type { StarterQuestion } from './ChatWidget.types'

const STARTERS: StarterQuestion[] = [
  { id: 'q1', label: 'What has Mahesh built at scale?', question: 'What has Mahesh built at scale?' },
  { id: 'q2', label: 'What does Mahesh know about AI?', question: 'What does Mahesh know about AI?' },
  { id: 'q3', label: 'How long has Mahesh been engineering?', question: 'How long has Mahesh been engineering?' },
]

const OPENING =
  "Hey there! I'm AI-MC, Mahesh's digital assistant. I'm trained on his resume and experience — nothing more, nothing less. Here are some things you can ask me:"

function LoadingDots() {
  return (
    <span className="chat-dots" aria-label="Loading">
      <span />
      <span />
      <span />
    </span>
  )
}

export default function ChatWidget() {
  const open = useStore(isChatOpen)
  const msgs = useStore(messages)
  const loading = useStore(isLoading)
  const errMsg = useStore(chatError)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const { send } = useChat()

  const scrollToBottom = (smooth: boolean = true): void => {
    if (!chatBodyRef.current) return
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [msgs, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (question: string): Promise<void> => {
    if (!question.trim() || loading) return
    setInput('')
    setTimeout(() => scrollToBottom(false), 50)
    await send(question.trim(), () => scrollToBottom(true))
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') void submit(input)
  }

  return (
    <>
      {/* floating button */}
      <button
        className="chat-fab"
        onClick={toggleChat}
        aria-label={open ? 'Close chat' : 'Chat with AI-MC'}
        aria-expanded={open}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* slide-up panel */}
      <div
        id="chat-panel"
        className={`chat-panel${open ? ' open' : ''}`}
        role="dialog"
        aria-label="Chat with AI-MC"
        aria-modal="true"
      >
        <div className="chat-panel__header">
          <span className="chat-panel__title">AI-MC</span>
          <button className="chat-panel__close" onClick={toggleChat} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div
          ref={chatBodyRef}
          className="chat-panel__body"
          style={{ maxHeight: '320px', overflowY: 'auto', scrollBehavior: 'smooth' }}
        >
          {msgs.length === 0 ? (
            <div className="chat-opening">
              <p className="chat-opening__text">{OPENING}</p>
              <div className="chat-starters">
                {STARTERS.map((q) => (
                  <button
                    key={q.id}
                    className="chat-starter"
                    onClick={() => void submit(q.question)}
                    disabled={loading}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {msgs.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="chat-msg chat-msg--assistant">
                  <LoadingDots />
                </div>
              )}
              {errMsg && <p className="chat-error">{errMsg}</p>}
            </div>
          )}
        </div>

        <div className="chat-panel__footer">
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            placeholder="Ask anything about Mahesh…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            aria-label="Chat input"
          />
          <button
            className="chat-send"
            onClick={() => void submit(input)}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            →
          </button>
        </div>
      </div>
    </>
  )
}
