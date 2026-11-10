import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import UserApp from './user/UserApp'
import { AlertProvider } from './alerts/AlertProvider'

// Step 1: simple path split. "/" = user view, "/admin" = existing admin panel.
const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AlertProvider>
            {isAdmin ? <App /> : <UserApp />}
        </AlertProvider>
    </StrictMode>,
)
