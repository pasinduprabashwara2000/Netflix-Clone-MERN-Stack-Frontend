import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertContext } from './context'
import type { AlertApi, AlertType, ConfirmOptions } from './context'

type Toast = { id: number; type: AlertType; title: string; message: string; duration: number }
type PendingConfirm = ConfirmOptions & { resolve: (ok: boolean) => void }

const DURATION: Record<AlertType, number> = { success: 3500, info: 4000, warning: 5000, error: 6500 }
const DEFAULT_TITLE: Record<AlertType, string> = {
  success: 'Success',
  error: 'Something went wrong',
  warning: 'Check your input',
  info: 'Notice',
}

const STYLE: Record<AlertType, { bar: string; icon: string; path: string }> = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-400 bg-emerald-500/15', path: 'M5 13l4 4L19 7' },
  error: { bar: 'bg-brand', icon: 'text-red-400 bg-brand/15', path: 'M6 6l12 12M18 6L6 18' },
  warning: { bar: 'bg-amber-500', icon: 'text-amber-400 bg-amber-500/15', path: 'M12 8v5m0 3.5h.01' },
  info: { bar: 'bg-sky-500', icon: 'text-sky-400 bg-sky-500/15', path: 'M12 11v5m0-8.5h.01' },
}

function Icon({ path, className }: { path: string; className: string }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${className}`}>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={path} />
      </svg>
    </span>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  const [paused, setPaused] = useState(false)
  const s = STYLE[toast.type]

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => onClose(toast.id), toast.duration)
    return () => clearTimeout(t)
  }, [paused, toast.id, toast.duration, onClose])

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="pointer-events-auto relative flex animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-line bg-panel p-4 pr-10 shadow-2xl shadow-black/60"
    >
      <Icon path={s.path} className={s.icon} />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        <p className="mt-0.5 text-sm break-words text-zinc-300">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 rounded-md p-1 text-muted transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full origin-left animate-toast-progress ${s.bar}`}
        style={{ animationDuration: `${toast.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }}
      />
    </div>
  )
}

function ConfirmDialog({ pending, onAnswer }: { pending: PendingConfirm; onAnswer: (ok: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const danger = pending.danger ?? true

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAnswer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAnswer])

  return (
    <div
      className="fixed inset-0 z-[110] flex animate-fade-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onAnswer(false)}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm animate-pop-in rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/70">
        <Icon
          path={danger ? 'M12 8v5m0 3.5h.01' : 'M12 11v5m0-8.5h.01'}
          className={danger ? 'text-red-400 bg-brand/15' : 'text-sky-400 bg-sky-500/15'}
        />
        <h3 id="confirm-title" className="mt-4 text-lg font-bold">{pending.title ?? 'Are you sure?'}</h3>
        <p className="mt-1.5 text-sm text-zinc-300">{pending.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={() => onAnswer(false)}
            className="rounded-lg border border-line bg-raised px-4 py-2 text-sm font-medium transition hover:bg-zinc-700 active:scale-95"
          >
            {pending.cancelText ?? 'Cancel'}
          </button>
          <button
            onClick={() => onAnswer(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition active:scale-95 ${danger ? 'bg-brand hover:bg-brand-600' : 'bg-sky-600 hover:bg-sky-500'}`}
          >
            {pending.confirmText ?? (danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const nextId = useRef(1)

  const close = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notify = useCallback((type: AlertType, message: string, title?: string) => {
    const id = nextId.current++
    setToasts((t) => [...t.slice(-3), { id, type, message, title: title ?? DEFAULT_TITLE[type], duration: DURATION[type] }])
  }, [])

  const confirm = useCallback(
    (options: ConfirmOptions | string) =>
      new Promise<boolean>((resolve) => {
        const opts = typeof options === 'string' ? { message: options } : options
        setPending({ ...opts, resolve })
      }),
    [],
  )

  const answer = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok)
      setPending(null)
    },
    [pending],
  )

  const api = useMemo<AlertApi>(
    () => ({
      notify,
      confirm,
      success: (m, t) => notify('success', m, t),
      error: (m, t) => notify('error', m, t),
      warning: (m, t) => notify('warning', m, t),
      info: (m, t) => notify('info', m, t),
    }),
    [notify, confirm],
  )

  return (
    <AlertContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 left-4 z-[100] flex flex-col gap-3 sm:left-auto sm:w-96">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={close} />
        ))}
      </div>
      {pending && <ConfirmDialog pending={pending} onAnswer={answer} />}
    </AlertContext.Provider>
  )
}
