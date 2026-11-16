import { useEffect, useRef, useState } from 'react'
import type { Content } from '../../services/api'
import { getProfile } from '../auth'
import { askAssistant, errorMessage } from '../accountApi'
import type { AiChatTurn } from '../accountApi'
import { titlePath } from '../router'
import SafeImage from './SafeImage'

type Message = {
    role: 'user' | 'assistant'
    content: string
    titles?: Content[]
}

const GREETING: Message = {
    role: 'assistant',
    content: "Hi! Tell me what you're in the mood for and I'll suggest something to watch.",
}

const IDEAS = ['Something funny for tonight', 'A gripping crime series', 'Best sci-fi movies']

function AiChat() {
    const profile = getProfile()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([GREETING])
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending, open])

    if (!profile) return null

    const send = async (raw: string) => {
        const message = raw.trim()
        if (!message || sending) return

        // previous turns only (skip the greeting), sent as context
        const history: AiChatTurn[] = messages
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content }))

        setMessages((prev) => [...prev, { role: 'user', content: message }])
        setText('')
        setSending(true)

        try {
            const res = await askAssistant(profile._id, message, history)
            setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, titles: res.titles }])
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: errorMessage(e, 'Something went wrong. Please try again.') },
            ])
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            {open && (
                <div className="fixed bottom-20 right-4 z-40 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/60 sm:right-6">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                            <p className="text-sm font-bold">Hotflix Assistant</p>
                            <p className="text-xs text-muted">AI picks from our catalog</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Close assistant"
                            onClick={() => setOpen(false)}
                            className="text-xl text-muted transition hover:text-white"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        {messages.map((m, i) => (
                            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start'}>
                                <div
                                    className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                                        m.role === 'user' ? 'bg-brand text-white' : 'bg-raised text-zinc-100'
                                    }`}
                                >
                                    {m.content}
                                </div>

                                {m.titles && m.titles.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {m.titles.map((t) => (
                                            <a
                                                key={t._id}
                                                href={titlePath(t._id)}
                                                onClick={() => setOpen(false)}
                                                title={t.title}
                                                className="w-20 transition hover:scale-105"
                                            >
                                                <div className="aspect-[2/3] overflow-hidden rounded bg-raised">
                                                    <SafeImage src={t.posterUrl} alt={t.title} className="size-full object-cover" />
                                                </div>
                                                <p className="mt-1 truncate text-[11px] text-zinc-300">{t.title}</p>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {sending && <p className="text-xs text-muted">Thinking…</p>}

                        {messages.length === 1 && !sending && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {IDEAS.map((idea) => (
                                    <button
                                        key={idea}
                                        type="button"
                                        onClick={() => void send(idea)}
                                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white/10"
                                    >
                                        {idea}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <div className="flex gap-2 border-t border-white/10 p-3">
                        <input
                            value={text}
                            maxLength={500}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') void send(text)
                            }}
                            placeholder="What do you feel like watching?"
                            className="min-w-0 flex-1 rounded bg-raised px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/40"
                        />
                        <button
                            type="button"
                            disabled={sending || !text.trim()}
                            onClick={() => void send(text)}
                            className="rounded bg-brand px-4 py-2 text-sm font-bold transition hover:bg-brand-600 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                aria-label={open ? 'Close assistant' : 'Open assistant'}
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-4 right-4 z-40 rounded-full bg-brand px-5 py-3 text-sm font-bold shadow-lg shadow-black/50 transition hover:bg-brand-600 sm:right-6"
            >
                ✨ Ask AI
            </button>
        </>
    )
}

export default AiChat
