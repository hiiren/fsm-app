import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAppStore, useAuthStore } from './stores'

window.addEventListener('error', (event) => {
  const user = useAuthStore.getState().user
  useAppStore.getState().logError({
    errorMessage: event.message,
    stackTrace: event.error?.stack || 'No stack trace',
    userId: user?.id,
    pageName: window.location.pathname,
    source: window.location.pathname.startsWith('/admin') ? 'dashboard' : 'tech-tasks',
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const user = useAuthStore.getState().user
  useAppStore.getState().logError({
    errorMessage: event.reason?.message || String(event.reason),
    stackTrace: event.reason?.stack || 'No stack trace',
    userId: user?.id,
    pageName: window.location.pathname,
    source: window.location.pathname.startsWith('/admin') ? 'dashboard' : 'tech-tasks',
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
