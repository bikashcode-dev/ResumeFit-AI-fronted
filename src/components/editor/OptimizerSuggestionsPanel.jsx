import React from 'react'
import { CheckCircle2, Circle, ListChecks } from 'lucide-react'

function flattenSuggestions(suggestions) {
  if (!suggestions) return []
  const items = []
  const push = (list, type) => {
    if (!list) return
    list.forEach((entry, i) => {
      const text = typeof entry === 'string' ? entry : entry.suggestion || entry.text || ''
      if (text) items.push({ id: `${type}-${i}`, text, type })
    })
  }
  push(suggestions.add, 'add')
  push(suggestions.fix, 'fix')
  push(suggestions.remove, 'remove')
  push(suggestions.suggestions, 'fix')
  return items
}

export default function OptimizerSuggestionsPanel({ editorFlow, onToggleApplied }) {
  const items = flattenSuggestions(editorFlow?.suggestions)
  if (!items.length) return null

  const applied = editorFlow?.appliedSuggestions || {}
  const doneCount = items.filter(it => applied[it.id]).length

  return (
    <div className="card editor-flow-card">
      <div className="card-header">
        <div className="card-title">
          <ListChecks size={14} />
          Optimizer suggestions
        </div>
        <span className="badge badge-gray">
          {doneCount}/{items.length} reviewed
        </span>
      </div>
      <p className="card-desc">
        Check off items as you apply them in the editor. This is your checklist only — it does not
        auto-edit the resume.
      </p>
      {editorFlow?.atsScore != null && (
        <p className="field-hint" style={{ marginBottom: 10 }}>
          ATS match when opened: <strong>{Math.round(editorFlow.atsScore)}/100</strong>
          {editorFlow.targetRole ? ` · ${editorFlow.targetRole}` : ''}
        </p>
      )}
      <ul className="suggestion-checklist">
        {items.map(item => {
          const checked = !!applied[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`suggestion-check-row${checked ? ' checked' : ''}`}
                onClick={() => onToggleApplied(item.id)}
                aria-pressed={checked}
              >
                {checked ? (
                  <CheckCircle2 size={16} className="text-success" />
                ) : (
                  <Circle size={16} />
                )}
                <span className={`suggestion-badge suggestion-${item.type}`}>
                  {item.type === 'add' ? 'Add' : item.type === 'remove' ? 'Remove' : 'Fix'}
                </span>
                <span className="suggestion-check-text">{item.text}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
