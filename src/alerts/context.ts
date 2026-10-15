import { createContext, useContext } from 'react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  /** Red confirm button for destructive actions (default true) */
  danger?: boolean
}

export type AlertApi = {
  /** Show a toast. Errors stay longer than the others. */
  notify: (type: AlertType, message: string, title?: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  /** Themed replacement for window.confirm. Resolves true when confirmed. */
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
}

export const AlertContext = createContext<AlertApi | null>(null)

export function useAlert(): AlertApi {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>')
  return ctx
}
