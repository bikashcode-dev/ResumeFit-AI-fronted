import React from 'react'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { AppProvider } from './app/AppContext.jsx'
import AppRoutes from './app/routes.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
