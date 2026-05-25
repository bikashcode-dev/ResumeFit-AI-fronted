import React, { useMemo } from 'react'
import { computeLineDiff, countDiffStats } from '../../utils/diffHelpers.js'

export default function BeforeAfterCompare({ beforeText, afterText }) {
  const rows = useMemo(
    () => computeLineDiff(beforeText, afterText),
    [beforeText, afterText]
  )
  const stats = useMemo(() => countDiffStats(rows), [rows])

  const hasChanges = stats.added + stats.removed + stats.changed > 0

  return (
    <div className="compare-panel">
      <div className="compare-stats">
        <span className="compare-stat compare-stat-add">+{stats.added} lines added</span>
        <span className="compare-stat compare-stat-remove">−{stats.removed} lines removed</span>
        <span className="compare-stat compare-stat-change">~{stats.changed} lines changed</span>
      </div>

      {!hasChanges ? (
        <p className="muted-text">No line-level changes detected between versions.</p>
      ) : (
        <div className="compare-diff-scroll" role="region" aria-label="Before and after diff">
          {rows.map((row, i) => {
            if (row.type === 'same') {
              return (
                <div key={i} className="diff-line diff-same">
                  <span className="diff-gutter"> </span>
                  <span className="diff-content">{row.before || '\u00a0'}</span>
                </div>
              )
            }
            if (row.type === 'remove') {
              return (
                <div key={i} className="diff-line diff-remove">
                  <span className="diff-gutter">−</span>
                  <span className="diff-content">{row.before}</span>
                </div>
              )
            }
            if (row.type === 'add') {
              return (
                <div key={i} className="diff-line diff-add">
                  <span className="diff-gutter">+</span>
                  <span className="diff-content">{row.after}</span>
                </div>
              )
            }
            return (
              <React.Fragment key={i}>
                <div className="diff-line diff-remove">
                  <span className="diff-gutter">−</span>
                  <span className="diff-content">{row.before}</span>
                </div>
                <div className="diff-line diff-add">
                  <span className="diff-gutter">+</span>
                  <span className="diff-content">{row.after}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      )}

      <details className="compare-raw-details">
        <summary>Side-by-side raw text</summary>
        <div className="compare-grid">
          <div>
            <h4 className="compare-label">Before</h4>
            <pre className="compare-pre">{beforeText || '(empty)'}</pre>
          </div>
          <div>
            <h4 className="compare-label">After</h4>
            <pre className="compare-pre">{afterText || '(empty)'}</pre>
          </div>
        </div>
      </details>
    </div>
  )
}
