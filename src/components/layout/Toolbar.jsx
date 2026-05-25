import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, PanelRight, Menu, Save, RotateCcw, Download, Target } from 'lucide-react'
import { useApp } from '../../app/AppContext.jsx'
import { scoreBadgeClass } from '../../utils/resumeHelpers.js'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/optimizer': 'Resume Optimizer',
  '/builder': 'Resume Builder',
  '/editor': 'Section Editor',
  '/exports': 'Export Resume',
  '/history': 'History',
}

export default function Toolbar({ onMenuToggle, onMobilePreview }) {
  const {
    theme,
    toggleTheme,
    previewCollapsed,
    setPreviewCollapsed,
    saveDraft,
    draftSavedAt,
    atsScore,
    editorUndo,
    getActiveResume,
  } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[pathname] || 'ResumeFit AI'
  const hasDraft = !!getActiveResume()

  function handleSave() {
    saveDraft()
  }

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className="btn btn-icon mobile-menu-btn"
          onClick={onMenuToggle}
          title="Open navigation"
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>
        <span className="toolbar-title">{title}</span>
        {atsScore != null && pathname === '/optimizer' && (
          <span className={`badge ${scoreBadgeClass(atsScore)} toolbar-ats-chip`}>
            <Target size={11} aria-hidden="true" />
            ATS {Math.round(atsScore)}
          </span>
        )}
      </div>

      <div className="toolbar-center toolbar-actions">
        {pathname === '/editor' && editorUndo.canUndo && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={editorUndo.undo}
            title="Undo last change"
          >
            <RotateCcw size={13} />
            Undo
          </button>
        )}
        {pathname === '/editor' && editorUndo.revert && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={editorUndo.revert}
            title="Revert all edits"
          >
            Revert
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleSave}
          disabled={!hasDraft && pathname !== '/builder'}
          title="Save draft to history"
        >
          <Save size={13} />
          {draftSavedAt ? 'Saved' : 'Save draft'}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/exports')}
          disabled={!hasDraft}
          title="Export resume"
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div className="toolbar-right">
        <button
          type="button"
          className="btn btn-secondary btn-sm mobile-preview-toolbar-btn"
          onClick={onMobilePreview}
          aria-label="Open mobile preview"
        >
          <PanelRight size={14} />
          Preview
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setPreviewCollapsed(c => !c)}
          title={previewCollapsed ? 'Show preview' : 'Hide preview'}
          aria-label={previewCollapsed ? 'Show preview panel' : 'Hide preview panel'}
        >
          <PanelRight size={15} />
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>
    </header>
  )
}
