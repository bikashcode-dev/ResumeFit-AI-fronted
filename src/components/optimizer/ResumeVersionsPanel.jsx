import React, { useState } from 'react'
import { Layers, Download, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { getVersions, getFriendlyError } from '../../api/resumeApi.js'
import { extractTextFromParsed } from '../../utils/resumeHelpers.js'
import { normalizeVersionsResponse } from '../../utils/apiNormalizers.js'
import { SkeletonCard } from '../ui/Skeleton.jsx'
import { useToast } from '../ui/Toast.jsx'

function versionLabel(v, index) {
  return v.label || v.name || v.title || v.type || `Version ${index + 1}`
}

function versionText(v) {
  if (typeof v === 'string') return v
  return v.text || v.content || v.resume || v.body || JSON.stringify(v, null, 2)
}

export default function ResumeVersionsPanel({
  parsedResume,
  jobDescription,
  matchResult,
  suggestions,
  targetRole,
  onSelectVersion,
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [versions, setVersions] = useState(null)
  const { addToast } = useToast()

  async function handleLoadVersions() {
    if (!parsedResume || !matchResult) return
    setLoading(true)
    setError(null)
    setOpen(true)
    try {
      const res = await getVersions({
        resume: extractTextFromParsed(parsedResume),
        jobDescription,
        matchResult,
        suggestions,
        targetRole: targetRole || undefined,
      })
      const list = normalizeVersionsResponse(res)
      setVersions(list)
      if (!list.length) {
        addToast('No alternate versions returned — try optimizing first.', 'info')
      }
    } catch (e) {
      setError(getFriendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  if (!matchResult) return null

  return (
    <div className="card versions-card">
      <button
        type="button"
        className="section-block-header"
        onClick={() => {
          if (!versions && !loading) handleLoadVersions()
          else setOpen(o => !o)
        }}
        aria-expanded={open}
      >
        <span className="section-block-title">
          <Layers size={14} style={{ marginRight: 6 }} />
          Resume versions
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="section-block-body">
          {!versions && loading && <SkeletonCard lines={4} />}

          {error && (
            <div className="alert alert-error">
              <AlertTriangle size={13} />
              {error}
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLoadVersions}>
                Retry
              </button>
            </div>
          )}

          {versions && versions.length === 0 && !loading && (
            <p className="muted-text">No versions available for this analysis.</p>
          )}

          {versions?.length > 0 && (
            <ul className="versions-list">
              {versions.map((v, i) => (
                <li key={i} className="versions-item">
                  <div className="versions-item-head">
                    <strong>{versionLabel(v, i)}</strong>
                    {v.score != null && (
                      <span className="badge badge-blue">{Math.round(v.score)}</span>
                    )}
                  </div>
                  {v.description && (
                    <p className="versions-item-desc">{v.description}</p>
                  )}
                  <pre className="versions-snippet">{versionText(v).slice(0, 280)}…</pre>
                  {onSelectVersion && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectVersion(v)
                        addToast(`Loaded ${versionLabel(v, i)}`, 'success')
                      }}
                    >
                      <Download size={12} />
                      Use this version
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {versions && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLoadVersions} disabled={loading}>
              Refresh versions
            </button>
          )}
        </div>
      )}

      {!open && (
        <p className="card-desc" style={{ padding: '0 14px 14px' }}>
          Generate alternate resume versions from your current match (API).
        </p>
      )}
    </div>
  )
}
