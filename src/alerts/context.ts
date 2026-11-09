import { createContext, useContext } from 'react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export type AlertApi = {
  notify: (type: AlertType, message: string, title?: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
}

export const AlertContext = createContext<AlertApi | null>(null)

export function useAlert(): AlertApi {
  const context = useContext(AlertContext)

  if (!context) {
    throw new Error('useAlert must be used inside AlertProvider')
  }

  return context
}
