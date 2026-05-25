import React from 'react'
import { Link } from 'react-router-dom'
import { Target, TrendingUp, ArrowRight } from 'lucide-react'
import { scoreBadgeClass, scoreColor } from '../../utils/resumeHelpers.js'

function MiniBar({ score, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100))
  return (
    <div className="ats-trend-bar-track" title={`${score}/100`}>
      <div
        className="ats-trend-bar-fill"
        style={{ width: `${pct}%`, background: scoreColor(score) }}
      />
    </div>
  )
}

export default function AtsTrendPanel({ analyses }) {
  if (!analyses?.length) return null

  const latest = analyses[0]
  const preview = analyses.slice(0, 3)
  const more = analyses.slice(3)

  const scores = analyses.map(a => a.atsScore).filter(s => s != null)
  const trend =
    scores.length >= 2 ? scores[0] - scores[1] : null

  return (
    <div className="card ats-trend-card">
      <div className="card-header">
        <div className="card-title">
          <TrendingUp size={14} />
          ATS analysis trend
        </div>
        <Link to="/optimizer" className="btn btn-ghost btn-sm">
          New analysis
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="ats-trend-latest">
        <Target size={16} />
        <div>
          <span className="ats-trend-latest-label">Latest match</span>
          <span className={`badge ${scoreBadgeClass(latest.atsScore)}`}>
            {latest.atsScore}/100
          </span>
          {latest.targetRole && (
            <span className="muted-text"> · {latest.targetRole}</span>
          )}
          {trend != null && trend !== 0 && (
            <span className={`ats-trend-delta ${trend > 0 ? 'up' : 'down'}`}>
              {trend > 0 ? '+' : ''}
              {trend} vs previous
            </span>
          )}
        </div>
      </div>

      <ul className="ats-trend-list">
        {preview.map(item => (
          <li key={item.id} className="ats-trend-item">
            <div className="ats-trend-item-head">
              <span className={`badge ${scoreBadgeClass(item.atsScore)}`}>
                {item.atsScore}
              </span>
              <span className="ats-trend-item-role">
                {item.targetRole || item.parsedFile || 'Analysis'}
              </span>
              <time className="muted-text" dateTime={item.analyzedAt}>
                {new Date(item.analyzedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <MiniBar score={item.atsScore} />
            {item.jdPreview && (
              <p className="ats-trend-jd-preview">{item.jdPreview}…</p>
            )}
          </li>
        ))}
      </ul>

      {more.length > 0 && (
        <details className="ats-trend-more">
          <summary>{more.length} more analyses</summary>
          <ul className="ats-trend-list compact">
            {more.map(item => (
              <li key={item.id} className="ats-trend-item compact">
                <span className={`badge ${scoreBadgeClass(item.atsScore)}`}>
                  {item.atsScore}
                </span>
                <span>{item.targetRole || item.parsedFile || '—'}</span>
                <time className="muted-text" dateTime={item.analyzedAt}>
                  {new Date(item.analyzedAt).toLocaleDateString()}
                </time>
                <MiniBar score={item.atsScore} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
