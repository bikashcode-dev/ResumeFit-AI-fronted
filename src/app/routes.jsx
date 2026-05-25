import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import WorkspaceShell from '../components/layout/WorkspaceShell.jsx'

const LandingPage = lazy(() => import('../pages/LandingPage.jsx'))
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))
const OptimizerPage = lazy(() => import('../pages/OptimizerPage.jsx'))
const BuilderPage = lazy(() => import('../pages/BuilderPage.jsx'))
const EditorPage = lazy(() => import('../pages/EditorPage.jsx'))
const ExportsPage = lazy(() => import('../pages/ExportsPage.jsx'))
const HistoryPage = lazy(() => import('../pages/HistoryPage.jsx'))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 22, height: 22 }} aria-hidden="true" />
      <span>Loading workspace…</span>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<WorkspaceShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/optimizer" element={<OptimizerPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/exports" element={<ExportsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        <Route path="/checker" element={<Navigate to="/optimizer" replace />} />
        <Route path="/templates" element={<Navigate to="/exports" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
