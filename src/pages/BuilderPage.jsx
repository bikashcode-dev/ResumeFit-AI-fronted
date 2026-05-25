import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PenTool,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import { generateResume, assistSection, getFriendlyError } from '../api/resumeApi.js'
import {
  hasMeaningfulContent,
  builderPayloadFromDraft,
  flattenSkills,
} from '../utils/resumeHelpers.js'
import ReorderableList from '../components/ui/ReorderableList.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const DEFAULT_SKILL_ORDER = ['languages', 'frameworks', 'databases', 'tools', 'soft']

const LEVELS = [
  { value: '', label: 'Select level…' },
  { value: 'fresher', label: 'Fresher' },
  { value: 'intern', label: 'Intern' },
  { value: 'experienced', label: 'Experienced' },
]

const SKILL_GROUPS = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks & libraries' },
  { key: 'databases', label: 'Databases' },
  { key: 'tools', label: 'Tools & platforms' },
  { key: 'soft', label: 'Soft skills' },
]

function TagInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }
  return (
    <div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          style={{ flex: 1, minWidth: 140 }}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={add}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="tag-list">
          {values.map(v => (
            <span key={v} className="tag">
              {v}
              <button type="button" onClick={() => onChange(values.filter(x => x !== v))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionBlock({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="section-block">
      <button
        type="button"
        className="section-block-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="section-block-title">{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="section-block-body">{children}</div>}
    </div>
  )
}

function ExperienceEntry({ entry, onChange, onRemove, onImprove, improving }) {
  return (
    <div className="entry-card">
      <div className="grid-2">
        <div className="field">
          <label>Job title</label>
          <input
            className="input"
            value={entry.title || ''}
            onChange={e => onChange({ ...entry, title: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>
        <div className="field">
          <label>Company</label>
          <input
            className="input"
            value={entry.company || ''}
            onChange={e => onChange({ ...entry, company: e.target.value })}
            placeholder="Company name"
          />
        </div>
      </div>
      <div className="field">
        <label>Duration</label>
        <input
          className="input"
          value={entry.duration || ''}
          onChange={e => onChange({ ...entry, duration: e.target.value })}
          placeholder="Jan 2022 – Present"
        />
      </div>
      <div className="field">
        <label>Description / bullets</label>
        <textarea
          className="textarea"
          rows={3}
          value={entry.description || ''}
          onChange={e => onChange({ ...entry, description: e.target.value })}
          placeholder="Describe responsibilities and measurable outcomes…"
        />
      </div>
      <div className="row">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onImprove}
          disabled={improving || !entry.description?.trim()}
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
        <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={onRemove}>
          <Trash2 size={12} />
          Remove
        </button>
      </div>
    </div>
  )
}

function ProjectCard({ p, index, builderDraft, updateBuilderDraft, handleImproveSection, improvingIdx }) {
  return (
    <div className="entry-card reorder-entry-inner">
      <div className="field">
        <label>Project name</label>
        <input
          className="input"
          value={p.name || ''}
          onChange={e => {
            const arr = [...builderDraft.projects]
            arr[index] = { ...p, name: e.target.value }
            updateBuilderDraft({ projects: arr })
          }}
        />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea
          className="textarea"
          rows={2}
          value={p.description || ''}
          onChange={e => {
            const arr = [...builderDraft.projects]
            arr[index] = { ...p, description: e.target.value }
            updateBuilderDraft({ projects: arr })
          }}
        />
      </div>
      <div className="row">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleImproveSection('projects', index)}
          disabled={!!improvingIdx[`projects-${index}`] || !p.description?.trim()}
        >
          <Sparkles size={12} />
          AI improve
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm danger-text"
          onClick={() =>
            updateBuilderDraft({
              projects: builderDraft.projects.filter((_, idx) => idx !== index),
            })
          }
        >
          <Trash2 size={12} />
          Remove
        </button>
      </div>
    </div>
  )
}

function CustomSectionCard({ section, index, builderDraft, updateBuilderDraft }) {
  return (
    <div className="entry-card">
      <div className="field">
        <label>Section title</label>
        <input
          className="input"
          value={section.title || ''}
          onChange={e => {
            const arr = [...(builderDraft.custom || [])]
            arr[index] = { ...section, title: e.target.value }
            updateBuilderDraft({ custom: arr })
          }}
          placeholder="e.g. Coursework, Volunteer Work, Publications"
        />
      </div>
      <div className="field">
        <label>Details</label>
        <textarea
          className="textarea"
          rows={3}
          value={section.content || ''}
          onChange={e => {
            const arr = [...(builderDraft.custom || [])]
            arr[index] = { ...section, content: e.target.value }
            updateBuilderDraft({ custom: arr })
          }}
          placeholder="Add one detail per line."
        />
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm danger-text"
        onClick={() =>
          updateBuilderDraft({
            custom: (builderDraft.custom || []).filter((_, idx) => idx !== index),
          })
        }
      >
        <Trash2 size={12} />
        Remove
      </button>
    </div>
  )
}

export default function BuilderPage() {
  const { builderDraft, updateBuilderDraft, setGeneratedResume } = useApp()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [improvingIdx, setImprovingIdx] = useState({})
  const [sectionMsg, setSectionMsg] = useState(null)

  const skills = builderDraft.skills || {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    soft: [],
  }

  function updateField(key, value) {
    updateBuilderDraft({ [key]: value })
    setSuccess(false)
  }

  function updateSkillGroup(groupKey, values) {
    updateBuilderDraft({ skills: { ...skills, [groupKey]: values } })
    setSuccess(false)
  }

  async function handleGenerate() {
    if (!hasMeaningfulContent(builderDraft)) {
      setError('Enter your name and at least one section (summary, experience, or skills) before generating.')
      return
    }
    if (!builderDraft.name?.trim() || !builderDraft.targetRole?.trim() || !builderDraft.level?.trim()) {
      setError('Add your name, target role, and candidate level before generating.')
      return
    }
    if (!flattenSkills(skills).length) {
      setError('Add at least one skill before generating.')
      return
    }
    setError(null)
    setLoading('generate')
    try {
      const result = await generateResume(builderPayloadFromDraft(builderDraft))
      setGeneratedResume(result)
      setSuccess(true)
      addToast('Resume generated successfully', 'success')
    } catch (e) {
      setError(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleImproveSection(section, idx) {
    const key = `${section}-${idx}`
    setImprovingIdx(p => ({ ...p, [key]: true }))
    setSectionMsg(null)
    try {
      const entry = builderDraft[section][idx]
      const result = await assistSection({
        section,
        content: entry.description || entry.text || '',
        context: { targetRole: builderDraft.targetRole, level: builderDraft.level },
      })
      const updated = [...builderDraft[section]]
      updated[idx] = {
        ...entry,
        description: result.improved || result.content || entry.description,
      }
      updateBuilderDraft({ [section]: updated })
    } catch (e) {
      setSectionMsg(getFriendlyError(e))
    } finally {
      setImprovingIdx(p => ({ ...p, [key]: false }))
    }
  }

  async function handleImproveSummary() {
    if (!builderDraft.summary?.trim()) return
    setLoading('summary')
    setSectionMsg(null)
    try {
      const result = await assistSection({
        section: 'summary',
        content: builderDraft.summary,
        context: { targetRole: builderDraft.targetRole, level: builderDraft.level },
      })
      updateBuilderDraft({
        summary: result.improved || result.content || builderDraft.summary,
      })
    } catch (e) {
      setSectionMsg(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Resume Builder</h1>
        <p className="page-subtitle">
          Enter your real details section by section. Preview stays empty until you add content.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={13} />
          <span>{error}</span>
        </div>
      )}
      {sectionMsg && (
        <div className="alert alert-warning" role="status">
          <AlertTriangle size={13} />
          <span>{sectionMsg}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={13} />
          Resume generated. Open the Editor to refine, or go to Export to download.
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/editor')}>
            Editor
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      <SectionBlock title="Profile" defaultOpen>
        <div className="grid-2">
          <div className="field">
            <label>Full name</label>
            <input
              className="input"
              value={builderDraft.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="field">
            <label>Target role</label>
            <input
              className="input"
              value={builderDraft.targetRole}
              onChange={e => updateField('targetRole', e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="field">
            <label>Candidate level</label>
            <select
              className="select"
              value={builderDraft.level}
              onChange={e => updateField('level', e.target.value)}
            >
              {LEVELS.map(l => (
                <option key={l.value || 'e'} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={builderDraft.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              className="input"
              value={builderDraft.phone}
              onChange={e => updateField('phone', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              className="input"
              value={builderDraft.location}
              onChange={e => updateField('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div className="field">
            <label>LinkedIn</label>
            <input
              className="input"
              value={builderDraft.linkedin}
              onChange={e => updateField('linkedin', e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="field">
            <label>GitHub</label>
            <input
              className="input"
              value={builderDraft.github || ''}
              onChange={e => updateField('github', e.target.value)}
              placeholder="github.com/username"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Portfolio / website</label>
            <input
              className="input"
              value={builderDraft.portfolio || ''}
              onChange={e => updateField('portfolio', e.target.value)}
              placeholder="yourportfolio.dev"
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Professional summary">
        <div className="field">
          <textarea
            className="textarea"
            rows={4}
            value={builderDraft.summary}
            onChange={e => updateField('summary', e.target.value)}
            placeholder="2–4 sentences on your background, strengths, and target role…"
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleImproveSummary}
          disabled={loading === 'summary' || !builderDraft.summary?.trim()}
        >
          {loading === 'summary' ? (
            <>
              <div className="spinner" />
              Improving…
            </>
          ) : (
            <>
              <Sparkles size={12} />
              AI improve summary
            </>
          )}
        </button>
      </SectionBlock>

      <SectionBlock title="Skills" defaultOpen>
        <p className="field-hint reorder-hint">Drag grip or use arrows to reorder skill groups on your resume.</p>
        <ReorderableList
          label="Skill groups"
          items={(builderDraft.skillGroupOrder || DEFAULT_SKILL_ORDER)
            .map(key => SKILL_GROUPS.find(g => g.key === key))
            .filter(Boolean)}
          keyExtractor={g => g.key}
          onReorder={ordered => {
            updateBuilderDraft({ skillGroupOrder: ordered.map(g => g.key) })
            addToast('Skill group order updated', 'success')
          }}
          renderItem={group => (
            <div className="field" style={{ marginBottom: 0 }}>
              <label>{group.label}</label>
              <TagInput
                values={skills[group.key] || []}
                onChange={v => updateSkillGroup(group.key, v)}
                placeholder={`Add ${group.label.toLowerCase()}…`}
              />
            </div>
          )}
        />
        {flattenSkills(skills).length > 0 && (
          <p className="field-hint">{flattenSkills(skills).length} skills across groups.</p>
        )}
      </SectionBlock>

      <SectionBlock title={`Experience (${builderDraft.experience?.length || 0})`}>
        {builderDraft.experience?.map((exp, i) => (
          <ExperienceEntry
            key={i}
            entry={exp}
            onChange={v => {
              const arr = [...builderDraft.experience]
              arr[i] = v
              updateBuilderDraft({ experience: arr })
            }}
            onRemove={() =>
              updateBuilderDraft({
                experience: builderDraft.experience.filter((_, idx) => idx !== i),
              })
            }
            onImprove={() => handleImproveSection('experience', i)}
            improving={!!improvingIdx[`experience-${i}`]}
          />
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            updateBuilderDraft({
              experience: [
                ...(builderDraft.experience || []),
                { title: '', company: '', duration: '', description: '' },
              ],
            })
          }
        >
          <Plus size={13} />
          Add experience
        </button>
      </SectionBlock>

      <SectionBlock title={`Education (${builderDraft.education?.length || 0})`}>
        {builderDraft.education?.map((edu, i) => (
          <div key={i} className="entry-card">
            <div className="grid-2">
              <div className="field">
                <label>Degree</label>
                <input
                  className="input"
                  value={edu.degree || ''}
                  onChange={e => {
                    const arr = [...builderDraft.education]
                    arr[i] = { ...edu, degree: e.target.value }
                    updateBuilderDraft({ education: arr })
                  }}
                />
              </div>
              <div className="field">
                <label>Institution</label>
                <input
                  className="input"
                  value={edu.institution || ''}
                  onChange={e => {
                    const arr = [...builderDraft.education]
                    arr[i] = { ...edu, institution: e.target.value }
                    updateBuilderDraft({ education: arr })
                  }}
                />
              </div>
            </div>
            <div className="field">
              <label>Year</label>
              <input
                className="input"
                value={edu.year || ''}
                onChange={e => {
                  const arr = [...builderDraft.education]
                  arr[i] = { ...edu, year: e.target.value }
                  updateBuilderDraft({ education: arr })
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm danger-text"
              onClick={() =>
                updateBuilderDraft({
                  education: builderDraft.education.filter((_, idx) => idx !== i),
                })
              }
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            updateBuilderDraft({
              education: [...(builderDraft.education || []), { degree: '', institution: '', year: '' }],
            })
          }
        >
          <Plus size={13} />
          Add education
        </button>
      </SectionBlock>

      <SectionBlock title={`Projects (${builderDraft.projects?.length || 0})`}>
        <p className="field-hint reorder-hint">Drag to reorder projects — top items appear first on the resume.</p>
        <ReorderableList
          label="Projects"
          items={builderDraft.projects || []}
          keyExtractor={(_, i) => `proj-${i}`}
          emptyLabel="No projects yet — add one below."
          onReorder={next => {
            updateBuilderDraft({ projects: next })
            addToast('Project order updated', 'success')
          }}
          renderItem={(p, i) => (
            <ProjectCard
              p={p}
              index={i}
              builderDraft={builderDraft}
              updateBuilderDraft={updateBuilderDraft}
              handleImproveSection={handleImproveSection}
              improvingIdx={improvingIdx}
            />
          )}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            updateBuilderDraft({
              projects: [...(builderDraft.projects || []), { name: '', description: '' }],
            })
          }
        >
          <Plus size={13} />
          Add project
        </button>
      </SectionBlock>

      <SectionBlock title="Certifications">
        <TagInput
          values={builderDraft.certifications || []}
          onChange={v => updateField('certifications', v)}
          placeholder="e.g. AWS Solutions Architect"
        />
      </SectionBlock>

      <SectionBlock title="Achievements">
        <TagInput
          values={builderDraft.achievements || []}
          onChange={v => updateField('achievements', v)}
          placeholder="Measurable outcomes you are proud of"
        />
      </SectionBlock>

      <SectionBlock title={`Additional sections (${builderDraft.custom?.length || 0})`}>
        {(builderDraft.custom || []).map((section, i) => (
          <CustomSectionCard
            key={i}
            section={section}
            index={i}
            builderDraft={builderDraft}
            updateBuilderDraft={updateBuilderDraft}
          />
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            updateBuilderDraft({
              custom: [
                ...(builderDraft.custom || []),
                { title: '', content: '', enabled: true },
              ],
            })
          }
        >
          <Plus size={13} />
          Add section
        </button>
      </SectionBlock>

      <div className="builder-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading === 'generate'}
        >
          {loading === 'generate' ? (
            <>
              <div className="spinner" />
              Generating…
            </>
          ) : (
            <>
              <PenTool size={13} />
              Generate resume
            </>
          )}
        </button>
        <span className="field-hint">Uses your entered content only — no placeholder resume data.</span>
      </div>
    </div>
  )
}
