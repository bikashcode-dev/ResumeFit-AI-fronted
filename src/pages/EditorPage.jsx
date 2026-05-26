import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import { assistSection, getFriendlyError } from '../api/resumeApi.js'
import { flattenSkills, formatSectionName, normalizeResumeData } from '../utils/resumeHelpers.js'
import OptimizerSuggestionsPanel from '../components/editor/OptimizerSuggestionsPanel.jsx'
import ReorderableList from '../components/ui/ReorderableList.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const EDITABLE_SECTIONS = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'achievements',
  'rawOptimizedText',
]

function useUndoStack(initial) {
  const initialKey = useMemo(() => JSON.stringify(initial ?? null), [initial])
  const [history, setHistory] = useState([initial ?? {}])
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    const parsed = initialKey ? JSON.parse(initialKey) : {}
    setHistory([parsed])
    setCursor(0)
  }, [initialKey])

  const current = history[cursor] ?? {}

  const push = useCallback(
    value => {
      setHistory(h => [...h.slice(0, cursor + 1), value])
      setCursor(c => c + 1)
    },
    [cursor]
  )

  const undo = useCallback(() => {
    if (cursor > 0) setCursor(c => c - 1)
  }, [cursor])

  const revert = useCallback(() => {
    setCursor(0)
  }, [])

  return { current, push, undo, revert, canUndo: cursor > 0 }
}

function SectionEditor({ sectionKey, value, onSave, targetRole, level, skills }) {
  const [open, setOpen] = useState(sectionKey === 'summary')
  const isArray = Array.isArray(value)
  const textValue = isArray ? JSON.stringify(value, null, 2) : value || ''
  const [local, setLocal] = useState(textValue)
  const [improving, setImproving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [sectionError, setSectionError] = useState(null)

  useEffect(() => {
    setLocal(isArray ? JSON.stringify(value, null, 2) : value || '')
    setDirty(false)
  }, [value, isArray])

  function handleSave() {
    if (isArray) {
      try {
        onSave(JSON.parse(local))
      } catch {
        onSave(local)
      }
    } else {
      onSave(local)
    }
    setDirty(false)
  }

  async function handleImprove() {
    if (!local.trim()) return
    setImproving(true)
    setSectionError(null)
    try {
      const result = await assistSection({
        sectionType: sectionKey,
        currentContent: local,
        roleType: targetRole?.trim() || 'General role',
        candidateLevel: level?.trim() || 'Candidate',
        skills,
      })
      setLocal(result.improvedContent || local)
      setDirty(true)
    } catch (e) {
      setSectionError(getFriendlyError(e))
    } finally {
      setImproving(false)
    }
  }

  return (
    <div className="section-block">
      <button
        type="button"
        className="section-block-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="section-block-title">
          {formatSectionName(sectionKey)}
          {dirty && <span className="dirty-dot" aria-label="Unsaved changes" />}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="section-block-body">
          <textarea
            className="textarea"
            rows={sectionKey === 'rawOptimizedText' ? 12 : sectionKey === 'summary' ? 4 : isArray ? 6 : 4}
            value={local}
            onChange={e => {
              setLocal(e.target.value)
              setDirty(true)
            }}
            style={{
              fontFamily: isArray ? 'var(--font-mono)' : undefined,
              fontSize: isArray ? 12 : undefined,
            }}
          />
          {isArray && (
            <p className="field-hint">
              Editing as JSON — keep valid array structure for structured sections.
            </p>
          )}
          {sectionKey === 'rawOptimizedText' && (
            <p className="field-hint">
              Backend returned a full optimized draft. Keep this fallback or copy useful lines into structured sections.
            </p>
          )}
          {sectionError && (
            <div className="alert alert-warning" style={{ marginTop: 8 }}>
              <AlertTriangle size={12} />
              {sectionError}
            </div>
          )}
          <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={!dirty}>
              <Save size={12} />
              Save section
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleImprove}
              disabled={improving || !local.trim()}
            >
              {improving ? (
                <>
                  <div className="spinner" />
                  Improving…
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  AI improve
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditorPage() {
  const {
    generatedResume,
    setGeneratedResume,
    builderDraft,
    optimizerState,
    setEditorUndo,
    editorFlow,
    updateEditorFlow,
    clearEditorFlow,
  } = useApp()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const source = generatedResume || optimizerState.optimizedResume
  const normalizedSource = useMemo(
    () => normalizeResumeData(source, normalizeResumeData(optimizerState.parsedResume) || {}),
    [source, optimizerState.parsedResume]
  )
  const { current, push, undo, revert, canUndo } = useUndoStack(normalizedSource || {})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEditorUndo({
      undo,
      revert: () => {
        revert()
        setGeneratedResume(source)
      },
      canUndo,
    })
    return () => setEditorUndo({ undo: null, revert: null, canUndo: false })
  }, [undo, revert, canUndo, source, setEditorUndo, setGeneratedResume])

  function handleToggleSuggestion(id) {
    if (!editorFlow) return
    const applied = { ...(editorFlow.appliedSuggestions || {}) }
    applied[id] = !applied[id]
    updateEditorFlow({ appliedSuggestions: applied })
  }

  function handleSaveSection(key, value) {
    const updated = key === 'rawOptimizedText'
      ? { ...current, rawOptimizedText: value, optimizedResume: value }
      : { ...current, [key]: value }
    push(updated)
    setGeneratedResume(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasContent =
    normalizedSource &&
    Object.keys(normalizedSource).some(k => {
      const v = normalizedSource[k]
      return v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : false)
    })

  if (!hasContent) {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Section editor</h1>
          <p className="page-subtitle">Fine-tune each section with live preview on the right.</p>
        </div>
        <div className="empty-state card">
          <Info size={32} />
          <h3>No resume to edit</h3>
          <p>Generate a resume in the Builder or optimize an upload in the Optimizer first.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/builder')}>
              Open builder
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/optimizer')}>
              Open optimizer
            </button>
          </div>
        </div>
      </div>
    )
  }

  const fromOptimizer = editorFlow?.source === 'optimizer'

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Section editor</h1>
          <p className="page-subtitle">
            Edit sections individually. Changes update the live preview after you save each section.
          </p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={13} />
          Section saved — preview updated.
        </div>
      )}

      {fromOptimizer && (
        <div className="alert alert-info editor-flow-banner">
          <Info size={13} />
          <div>
            <strong>Opened from Optimizer</strong>
            {editorFlow.parsedFile && (
              <span className="muted-text"> · {editorFlow.parsedFile}</span>
            )}
            <p className="field-hint" style={{ marginTop: 4 }}>
              Work through the suggestion checklist below, then export when ready.
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/exports')}>
            Go to export
            <ArrowRight size={12} />
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearEditorFlow}>
            Dismiss
          </button>
        </div>
      )}

      {fromOptimizer && (
        <OptimizerSuggestionsPanel
          editorFlow={editorFlow}
          onToggleApplied={handleToggleSuggestion}
        />
      )}

      {Array.isArray(current.experience) && current.experience.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Reorder experience</div>
          </div>
          <p className="field-hint reorder-hint">Drag entries to change order on your resume preview.</p>
          <ReorderableList
            items={current.experience}
            keyExtractor={(_, i) => `exp-${i}`}
            onReorder={next => {
              handleSaveSection('experience', next)
              addToast('Experience order updated', 'success')
            }}
            renderItem={(exp, i) => (
              <div className="reorder-entry-summary">
                <strong>{exp.title || exp.role || `Role ${i + 1}`}</strong>
                <span className="muted-text">{exp.company || '—'}</span>
              </div>
            )}
          />
        </div>
      )}

      {Array.isArray(current.projects) && current.projects.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Reorder projects</div>
          </div>
          <ReorderableList
            items={current.projects}
            keyExtractor={(_, i) => `ed-proj-${i}`}
            onReorder={next => {
              handleSaveSection('projects', next)
              addToast('Project order updated', 'success')
            }}
            renderItem={(p, i) => (
              <div className="reorder-entry-summary">
                <strong>{p.name || p.title || `Project ${i + 1}`}</strong>
              </div>
            )}
          />
        </div>
      )}

      {!fromOptimizer && optimizerState.optimizedResume && (
        <div className="alert alert-info">
          <Info size={13} />
          Editing optimized resume. Use Revert in the toolbar to discard all edits.
        </div>
      )}

      {EDITABLE_SECTIONS.map(key => {
        const val = current[key]
        if (val === undefined) return null
        return (
          <SectionEditor
            key={key}
            sectionKey={key}
            value={val}
            onSave={v => handleSaveSection(key, v)}
            targetRole={builderDraft.targetRole || optimizerState.targetRole}
            level={builderDraft.level || optimizerState.candidateStage}
            skills={flattenSkills(builderDraft.skills || {}).join(', ')}
          />
        )
      })}
    </div>
  )
}
