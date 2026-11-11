import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import { AlertContext } from './context'
import type { AlertApi, AlertType, ConfirmOptions } from './context'
import { ui } from '../lib/ui'

type Toast = {
    id: number
    type: AlertType
    message: string
}

type PendingConfirm = ConfirmOptions & {
    resolve: (value: boolean) => void
}

// Matches the badge palette / accent colors in ui.ts
const styles: Record<AlertType, { border: string; shadow: string; badge: string; label: string }> = {
    success: {
        border: 'border-lime-400',
        shadow: 'shadow-[4px_4px_0_0_#a3e635]',
        badge: 'bg-lime-400 text-black',
        label: 'Success',
    },
    error: {
        border: 'border-red-500',
        shadow: 'shadow-[4px_4px_0_0_#ef4444]',
        badge: 'bg-red-500 text-white',
        label: 'Error',
    },
    warning: {
        border: 'border-yellow-300',
        shadow: 'shadow-[4px_4px_0_0_#fde047]',
        badge: 'bg-yellow-300 text-black',
        label: 'Warning',
    },
    info: {
        border: 'border-cyan-400',
        shadow: 'shadow-[4px_4px_0_0_#22d3ee]',
        badge: 'bg-cyan-400 text-black',
        label: 'Info',
    },
}

function ToastItem({ toast, close }: { toast: Toast; close: (id: number) => void }) {
    const style = styles[toast.type]

    useEffect(() => {
        const timer = setTimeout(() => close(toast.id), 4000)
        return () => clearTimeout(timer)
    }, [toast.id, close])

    return (
        <div
            role="status"
            className={`border-2 bg-zinc-900 p-4 font-mono ${style.border} ${style.shadow}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-2">
                    <span
                        className={`border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${style.badge}`}
                    >
                        {style.label}
                    </span>
                    <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
                </div>

                <button
                    onClick={() => close(toast.id)}
                    aria-label="Dismiss"
                    className="shrink-0 border-2 border-zinc-700 px-2 py-0.5 text-xs font-black text-zinc-400 transition hover:border-brand hover:text-brand active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

function ConfirmDialog({ pending, answer }: { pending: PendingConfirm; answer: (value: boolean) => void }) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') answer(false)
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [answer])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono"
            onClick={(e) => {
                if (e.target === e.currentTarget) answer(false)
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm border-2 border-zinc-800 bg-zinc-900 p-6 shadow-[6px_6px_0_0_#e50914]"
            >
                <h2 className={ui.cardTitle}>{pending.title ?? 'Are you sure?'}</h2>
                <p className="mb-6 text-sm font-medium text-zinc-400">{pending.message}</p>

                <div className={ui.actions}>
                    <button onClick={() => answer(false)} className={ui.btn}>
                        {pending.cancelText ?? 'Cancel'}
                    </button>

                    <button
                        onClick={() => answer(true)}
                        className="border-2 border-black bg-red-500 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_#000] transition hover:bg-red-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                    >
                        {pending.confirmText ?? 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function AlertProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [pending, setPending] = useState<PendingConfirm | null>(null)
    const id = useRef(0)

    const close = useCallback((id: number) => {
        setToasts((old) => old.filter((toast) => toast.id !== id))
    }, [])

    const notify = useCallback((type: AlertType, message: string) => {
        setToasts((old) => [...old, { id: ++id.current, type, message }])
    }, [])

    const confirm = useCallback((options: ConfirmOptions | string) => {
        return new Promise<boolean>((resolve) => {
            setPending({
                ...(typeof options === 'string' ? { message: options } : options),
                resolve,
            })
        })
    }, [])

    const answer = useCallback((value: boolean) => {
        setPending((current) => {
            current?.resolve(value)
            return null
        })
    }, [])

    const api = useMemo<AlertApi>(() => ({
        notify,
        confirm,
        success: (message) => notify('success', message),
        error: (message) => notify('error', message),
        warning: (message) => notify('warning', message),
        info: (message) => notify('info', message),
    }), [notify, confirm])

    return (
        <AlertContext.Provider value={api}>
            {children}

            <div className="fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-4">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} close={close} />
                ))}
            </div>

            {pending && <ConfirmDialog pending={pending} answer={answer} />}
        </AlertContext.Provider>
    )
}