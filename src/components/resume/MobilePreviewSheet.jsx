import React from 'react'
import { X, FileText } from 'lucide-react'
import ResumePreview from './ResumePreview.jsx'

export default function MobilePreviewSheet({ open, onClose, data }) {
  if (!open) return null

  return (
    <div className="mobile-preview-root" role="dialog" aria-modal="true" aria-label="Resume preview">
      <button type="button" className="mobile-preview-backdrop" onClick={onClose} aria-label="Close preview" />
      <div className="mobile-preview-sheet page-enter">
        <div className="mobile-preview-header">
          <span>
            <FileText size={15} />
            Live preview
          </span>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="mobile-preview-body">
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  )
}
