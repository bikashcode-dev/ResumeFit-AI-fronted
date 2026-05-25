import React from 'react'
import { useApp } from '../../app/AppContext.jsx'
import ResumePreview from './ResumePreview.jsx'
import { usePreviewData } from '../../hooks/usePreviewData.js'

export default function PreviewRail() {
  const { previewCollapsed, setPreviewCollapsed } = useApp()
  const previewData = usePreviewData()

  return (
    <aside
      className={`preview-rail${previewCollapsed ? ' collapsed' : ''}`}
      aria-label="Resume preview"
    >
      <div className="preview-rail-header">
        <span className="preview-rail-label">Live preview</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setPreviewCollapsed(true)}
          aria-label="Collapse preview"
        >
          Hide
        </button>
      </div>
      <ResumePreview data={previewData} />
    </aside>
  )
}
