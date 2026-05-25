import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Trash2, Download, Info } from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import { removeHistoryEntry } from '../hooks/useLocalHistory.js'
import { scoreBadgeClass } from '../utils/resumeHelpers.js'

export default function HistoryPage() {
  const { history, setHistory, setGeneratedResume } = useApp()
  const navigate = useNavigate()

  function handleLoad(entry) {
    setGeneratedResume(entry.resume)
    navigate('/editor')
  }

  function handleDelete(id) {
    const next = removeHistoryEntry(id)
    setHistory(next)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">Saved drafts from this browser — load back into the editor anytime.</p>
      </div>

      <div className="alert alert-info">
        <Info size={14} />
        Drafts are stored locally in your browser. Use Save draft in the toolbar to add versions.
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <Clock size={40} />
          <h3>No saved drafts yet</h3>
          <p>Save a draft from the toolbar after building or optimizing a resume.</p>
        </div>
      ) : (
        <ul className="history-list">
          {history.map(entry => (
            <li key={entry.id} className="card history-item">
              <div className="history-item-main">
                <div className="history-item-title">{entry.label}</div>
                <div className="history-item-meta">
                  <span>{new Date(entry.savedAt).toLocaleString()}</span>
                  <span className="badge badge-gray">{entry.source || 'draft'}</span>
                  {entry.atsScore != null && (
                    <span className={`badge ${scoreBadgeClass(entry.atsScore)}`}>
                      ATS {Math.round(entry.atsScore)}
                    </span>
                  )}
                  {entry.targetRole && <span className="muted-text">{entry.targetRole}</span>}
                </div>
              </div>
              <div className="history-item-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleLoad(entry)}>
                  <Download size={12} />
                  Load in editor
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm danger-text"
                  onClick={() => handleDelete(entry.id)}
                  aria-label={`Delete ${entry.label}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
