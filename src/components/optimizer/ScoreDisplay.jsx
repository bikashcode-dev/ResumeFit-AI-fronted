import React, { useEffect, useState } from 'react'
import { scoreColor, scoreLabel } from '../../utils/resumeHelpers.js'

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null || Number.isNaN(Number(target))) {
      setValue(0)
      return
    }
    const end = Math.round(Number(target))
    const start = 0
    const startTime = performance.now()
    let frame
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(start + (end - start) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return target == null ? null : value
}

export function ScoreCircle({ score, size = 80, label, animate = true }) {
  const radius = (size - 8) / 2
  const circ = 2 * Math.PI * radius
  const counted = useCountUp(animate ? score : null)
  const displayScore = animate ? (counted ?? score) : score
  const fill = ((displayScore || 0) / 100) * circ
  const color = scoreColor(score ?? displayScore)

  return (
    <div className="score-circle-wrap">
      <svg width={size} height={size} className="score-circle-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="score-ring-progress"
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          fontWeight={700}
          fontFamily="var(--font-sans)"
        >
          {displayScore ?? '—'}
        </text>
        {label && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.18}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-muted)"
            fontSize={size * 0.12}
            fontFamily="var(--font-sans)"
          >
            /100
          </text>
        )}
      </svg>
      {label && (
        <span className="score-circle-label">{scoreLabel(score ?? displayScore)}</span>
      )}
    </div>
  )
}

export function ScoreRow({ label, score, description }) {
  const color = scoreColor(score)
  const animated = useCountUp(score, 500)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color }}>
          {animated ?? score}/100
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill progress-fill-animated"
          style={{ width: `${animated ?? score}%`, background: color }}
        />
      </div>
      {description && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{description}</div>
      )}
    </div>
  )
}
