import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

const STAGES = [
  { value: '', label: 'Select stage…' },
  { value: 'fresher', label: 'Fresher / New grad' },
  { value: 'intern', label: 'Intern' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'career-change', label: 'Career change' },
]

const ROLES = [
  '',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Product Manager',
  'DevOps Engineer',
  'QA Engineer',
  'Other',
]

export default function RoleJdFields({
  targetRole,
  candidateStage,
  confirmedSkills,
  jobDescription,
  onChange,
}) {
  const [skillInput, setSkillInput] = useState('')

  function addSkill() {
    const v = skillInput.trim()
    if (!v || confirmedSkills.includes(v)) return
    onChange({ confirmedSkills: [...confirmedSkills, v] })
    setSkillInput('')
  }

  function removeSkill(skill) {
    onChange({ confirmedSkills: confirmedSkills.filter(s => s !== skill) })
  }

  return (
    <div className="stack">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="target-role">Target role</label>
          <select
            id="target-role"
            className="select"
            value={targetRole}
            onChange={e => onChange({ targetRole: e.target.value })}
          >
            {ROLES.map(r => (
              <option key={r || 'empty'} value={r}>
                {r || 'Select role…'}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="candidate-stage">Candidate stage</label>
          <select
            id="candidate-stage"
            className="select"
            value={candidateStage}
            onChange={e => onChange({ candidateStage: e.target.value })}
          >
            {STAGES.map(s => (
              <option key={s.value || 'empty'} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="job-description">Job description</label>
        <textarea
          id="job-description"
          className="textarea jd-textarea"
          rows={7}
          placeholder="Paste the full job description here…"
          value={jobDescription}
          onChange={e => onChange({ jobDescription: e.target.value })}
        />
        <span className="field-hint">Include requirements and responsibilities for accurate keyword matching.</span>
      </div>

      <div className="field">
        <label htmlFor="confirmed-skills">Confirmed skills (only skills you actually have)</label>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input
            id="confirmed-skills"
            className="input"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="e.g. Python, React, SQL…"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill()
              }
            }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>
            <Plus size={13} />
            Add
          </button>
        </div>
        {confirmedSkills.length > 0 && (
          <div className="tag-list">
            {confirmedSkills.map(skill => (
              <span key={skill} className="tag">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
