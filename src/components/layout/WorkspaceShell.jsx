import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FileText } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import Toolbar from './Toolbar.jsx'
import PreviewRail from '../resume/PreviewRail.jsx'
import MobilePreviewSheet from '../resume/MobilePreviewSheet.jsx'
import PageTransition from '../ui/PageTransition.jsx'
import { usePreviewData } from '../../hooks/usePreviewData.js'
import { useApp } from '../../app/AppContext.jsx'

export default function WorkspaceShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const previewData = usePreviewData()
  const { storageWarning, dismissStorageWarning } = useApp()

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toolbar
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onMobilePreview={() => setMobilePreviewOpen(true)}
      />

      <div className="workspace">
        <main className="workspace-main">
          {storageWarning && (
            <div className="alert alert-warning storage-warning-bar">
              <span>{storageWarning}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={dismissStorageWarning}>
                Dismiss
              </button>
            </div>
          )}
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <PreviewRail />
      </div>

      <button
        type="button"
        className="mobile-preview-fab"
        onClick={() => setMobilePreviewOpen(true)}
        aria-label="Open resume preview"
      >
        <FileText size={18} />
        Preview
      </button>

      <MobilePreviewSheet
        open={mobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
        data={previewData}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
