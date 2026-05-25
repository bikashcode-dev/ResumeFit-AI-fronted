import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  GitCompare,
} from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import {
  parseResume,
  matchResume,
  analyzeJobDescription,
  getSuggestions,
  optimizeResume,
  getFriendlyError,
} from '../api/resumeApi.js'
import { ScoreCircle, ScoreRow } from '../components/optimizer/ScoreDisplay.jsx'
import RoleJdFields from '../components/optimizer/RoleJdFields.jsx'
import BeforeAfterCompare from '../components/optimizer/BeforeAfterCompare.jsx'
import ResumeVersionsPanel from '../components/optimizer/ResumeVersionsPanel.jsx'
import { SkeletonCard } from '../components/ui/Skeleton.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAbortOnUnmount } from '../hooks/useAbortOnUnmount.js'
import { normalizeMatchResult } from '../utils/apiNormalizers.js'
import {
  extractTextFromParsed,
  getMatchBreakdown,
  normalizeKeywords,
} from '../utils/resumeHelpers.js'

function Step({ num, label, active, done }) {
  return (
    <div className={`step${active ? ' active' : ''}${done ? ' done' : ''}`}>
      <div className="step-num">{done ? '✓' : num}</div>
      <span>{label}</span>
    </div>
  )
}

function SuggestionItem({ text, type }) {
  const labels = { add: 'Add', fix: 'Fix', remove: 'Remove' }
  return (
    <div className="suggestion-item">
      <span className={`suggestion-badge suggestion-${type || 'fix'}`}>
        {labels[type] || type || 'Tip'}
      </span>
      <span>{text}</span>
    </div>
  )
}

function Collapsible({ title, count, children, defaultOpen = false }) {
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
        {count != null && <span className="badge badge-gray">{count}</span>}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="section-block-body">{children}</div>}
    </div>
  )
}

export default function OptimizerPage() {
  const {
    optimizerState,
    setOptimizerState,
    resetOptimizer,
    setGeneratedResume,
    pushAnalysisRecord,
    openEditorFromOptimizer,
    sessionRestored,
    dismissSessionRestored,
  } = useApp()
  const navigate = useNavigate()
  const {
    parsedResume,
    parsedFile,
    jobDescription,
    targetRole,
    candidateStage,
    confirmedSkills,
    matchResult,
    suggestions,
    optimizedResume,
    beforeResume,
    step,
  } = optimizerState

  const fileRef = useRef()
  const { getSignal, abort } = useAbortOnUnmount()
  const { addToast } = useToast()
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [partialWarning, setPartialWarning] = useState(null)
  const [showCompare, setShowCompare] = useState(false)

  const set = useCallback(
    updates => setOptimizerState(p => ({ ...p, ...updates })),
    [setOptimizerState]
  )

  function isCancelled(err) {
    return err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError'
  }

  function buildMatchPayload(resumeText, jdAnalysis) {
    return {
      resume: resumeText,
      jobDescription,
      targetRole: targetRole || undefined,
      candidateStage: candidateStage || undefined,
      skills: confirmedSkills.length ? confirmedSkills : undefined,
      confirmedSkills: confirmedSkills.length ? confirmedSkills : undefined,
      jdAnalysis: jdAnalysis || undefined,
    }
  }

  async function handleFileDrop(file) {
    if (!file) return
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    setError(null)
    setLoading('parse')
    const signal = getSignal()
    try {
      const result = await parseResume(file, signal)
      set({
        parsedResume: result,
        parsedFile: file.name,
        beforeResume: result,
        optimizedResume: null,
        matchResult: null,
        suggestions: null,
        step: Math.max(step, 1),
      })
      addToast('Resume parsed successfully', 'success')
    } catch (e) {
      if (!isCancelled(e)) setError(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleAnalyze() {
    if (!parsedResume) {
      setError('Please upload a resume first.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description.')
      return
    }
    if (!confirmedSkills.length) {
      setError('Add at least one confirmed skill you actually have — this keeps suggestions honest.')
      return
    }

    setError(null)
    setPartialWarning(null)
    setLoading('analyze')
    const signal = getSignal()

    const resumeText = extractTextFromParsed(parsedResume)
    let jdAnalysis = null

    try {
      try {
        jdAnalysis = await analyzeJobDescription(
          { jobDescription, targetRole: targetRole || undefined },
          signal
        )
        set({ jdAnalysis })
      } catch (e) {
        if (!isCancelled(e)) {
          setPartialWarning(
            'Job description deep analysis unavailable — continuing with core ATS match.'
          )
        }
      }

      const matchData = normalizeMatchResult(
        await matchResume(buildMatchPayload(resumeText, jdAnalysis), signal)
      )
      set({ matchResult: matchData, step: Math.max(step, 2) })
      pushAnalysisRecord({ matchResult: matchData })
      addToast(`ATS match: ${Math.round(matchData.atsScore ?? 0)}/100`, 'success')

      try {
        const suggData = await getSuggestions(
          {
            resume: resumeText,
            jobDescription,
            matchResult: matchData,
            targetRole,
            skills: confirmedSkills,
          },
          signal
        )
        set({ suggestions: suggData })
      } catch (e) {
        if (!isCancelled(e)) {
          setPartialWarning(
            prev =>
              prev ||
              'ATS match complete. AI suggestions could not be loaded — use Retry below or proceed to optimize.'
          )
        }
      }
    } catch (e) {
      if (!isCancelled(e)) setError(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleOptimize() {
    if (!matchResult) {
      setError('Run analysis first.')
      return
    }
    setError(null)
    setLoading('optimize')
    const signal = getSignal()
    const resumeText = extractTextFromParsed(parsedResume)

    try {
      const result = await optimizeResume(
        {
          resume: resumeText,
          jobDescription,
          matchResult,
          suggestions,
          targetRole,
          skills: confirmedSkills,
        },
        signal
      )
      set({ optimizedResume: result, step: 3 })
      setGeneratedResume(result)
      addToast('Resume optimized — open Editor to refine', 'success')
    } catch (e) {
      if (isCancelled(e)) return
      setPartialWarning(
        'Optimization failed — your parsed resume is still available as an editable draft in the Editor.'
      )
      set({ optimizedResume: parsedResume, step: 3 })
      setGeneratedResume(parsedResume)
      setError(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  function handleSelectVersion(version) {
    const content =
      typeof version === 'object'
        ? version.resume || version.data || version.content || version
        : version
    set({ optimizedResume: content, step: 3 })
    setGeneratedResume(content)
  }

  async function handleRetrySuggestions() {
    if (!matchResult) return
    setPartialWarning(null)
    setLoading('suggestions')
    try {
      const resumeText = extractTextFromParsed(parsedResume)
      const suggData = await getSuggestions({
        resume: resumeText,
        jobDescription,
        matchResult,
        skills: confirmedSkills,
      })
      set({ suggestions: suggData })
    } catch (e) {
      setPartialWarning(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  const atsScore =
    matchResult?.atsScore ?? matchResult?.score ?? matchResult?.matchScore
  const truthScore = matchResult?.truthScore ?? matchResult?.credibilityScore ?? matchResult?.honestyScore
  const skillGaps = matchResult?.skillGaps ?? matchResult?.missingSkills ?? matchResult?.criticalGaps ?? []
  const matchedSkills = matchResult?.matchedSkills ?? matchResult?.presentSkills ?? matchResult?.coveredSkills ?? []
  const matchedKeywords = normalizeKeywords(
    matchResult?.matchedKeywords ?? matchResult?.keywordsMatched ?? []
  )
  const missingKeywords = normalizeKeywords(
    matchResult?.missingKeywords ?? matchResult?.keywordsMissing ?? []
  )
  const breakdown = getMatchBreakdown(matchResult)

  function handleOpenEditor() {
    const resume = optimizedResume || parsedResume
    if (!resume) return
    openEditorFromOptimizer(resume)
    navigate('/editor')
  }

  const beforeText = extractTextFromParsed(beforeResume || parsedResume)
  const afterText = optimizedResume ? extractTextFromParsed(optimizedResume) : ''

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Resume Optimizer</h1>
        <p className="page-subtitle">
          Upload your resume, align it to a job description, and get ATS scores with honest skill
          coverage.
        </p>
      </div>

      {sessionRestored && (
        <div className="alert alert-info">
          <CheckCircle size={13} />
          <span>Previous session restored (resume, JD, skills, and scores).</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={dismissSessionRestored}>
            Dismiss
          </button>
        </div>
      )}

      <div className="steps">
        <Step num="1" label="Upload" active={step === 0} done={step > 0} />
        <div className="step-line" />
        <Step num="2" label="Target & JD" active={step === 1} done={step > 1} />
        <div className="step-line" />
        <Step num="3" label="Analyze" active={step === 2} done={step > 2} />
        <div className="step-line" />
        <Step num="4" label="Improve" active={step === 3} done={!!optimizedResume} />
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Upload size={14} />
            Resume upload
          </div>
          {parsedFile && (
            <span className="badge badge-green">
              <CheckCircle size={11} />
              {parsedFile}
            </span>
          )}
        </div>

        {!parsedResume ? (
          <div
            className={`upload-zone${drag ? ' drag-over' : ''}`}
            onDragOver={e => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => {
              e.preventDefault()
              setDrag(false)
              handleFileDrop(e.dataTransfer.files[0])
            }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="sr-only"
              onChange={e => handleFileDrop(e.target.files[0])}
            />
            {loading === 'parse' ? (
              <div className="upload-loading">
                <div className="spinner" />
                <span>Parsing resume… (backend may take up to 30s on cold start)</span>
              </div>
            ) : (
              <>
                <FileText size={28} className="upload-icon" />
                <p className="upload-title">Drop your resume or click to browse</p>
                <p className="upload-hint">PDF, DOCX, or TXT</p>
              </>
            )}
          </div>
        ) : (
          <div className="upload-done">
            <CheckCircle size={16} className="text-success" />
            <span>Resume parsed. Configure the job target below.</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              Replace
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="sr-only"
              onChange={e => handleFileDrop(e.target.files[0])}
            />
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={14} />
            Job target & description
          </div>
        </div>
        <RoleJdFields
          targetRole={targetRole}
          candidateStage={candidateStage}
          confirmedSkills={confirmedSkills || []}
          jobDescription={jobDescription}
          onChange={set}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={loading === 'analyze' || !parsedResume || !jobDescription.trim()}
        >
          {loading === 'analyze' ? (
            <>
              <div className="spinner" />
              Analyzing match…
            </>
          ) : (
            <>
              <Zap size={13} />
              Analyze ATS match
            </>
          )}
        </button>
      </div>

      {loading === 'analyze' && (
        <div className="card">
          <SkeletonCard lines={5} />
        </div>
      )}

      {matchResult && (
        <>
          {partialWarning && (
            <div className="alert alert-warning" role="status">
              <AlertTriangle size={13} />
              <span>{partialWarning}</span>
              {!suggestions && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleRetrySuggestions}
                  disabled={loading === 'suggestions'}
                >
                  <RefreshCw size={11} />
                  Retry suggestions
                </button>
              )}
            </div>
          )}

          <div className="grid-2">
            <div className="card score-card">
              <ScoreCircle score={atsScore} size={88} label />
              <div>
                <div className="score-card-label">ATS match score</div>
                <div className="score-card-value">
                  {atsScore ?? '—'}
                  <span>/100</span>
                </div>
                {matchResult?.overallFit && (
                  <p className="score-card-fit">{matchResult.overallFit}</p>
                )}
              </div>
            </div>

            {truthScore != null && (
              <div className="card score-card">
                <ScoreCircle score={truthScore} size={88} label />
                <div>
                  <div className="score-card-label">Truth / honesty score</div>
                  <div className="score-card-value">
                    {truthScore}
                    <span>/100</span>
                  </div>
                  <p className="score-card-fit">Based on confirmed skills vs. resume claims</p>
                </div>
              </div>
            )}
          </div>

          {breakdown.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Score breakdown</div>
              </div>
              {breakdown.map(row => (
                <ScoreRow
                  key={row.label}
                  label={row.label}
                  score={row.score}
                  description={row.description}
                />
              ))}
            </div>
          )}

          <Collapsible title="Critical skill gaps" count={skillGaps?.length} defaultOpen>
            {skillGaps?.length > 0 ? (
              <div className="chip-row">
                {skillGaps.map((s, i) => (
                  <span key={i} className="badge badge-red">
                    <XCircle size={10} />
                    {typeof s === 'string' ? s : s.skill || s.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-text">No critical gaps detected for your confirmed skills.</p>
            )}
          </Collapsible>

          {matchedSkills?.length > 0 && (
            <Collapsible title="Covered skills" count={matchedSkills.length}>
              <div className="chip-row">
                {matchedSkills.map((s, i) => (
                  <span key={i} className="badge badge-green">
                    <CheckCircle size={10} />
                    {typeof s === 'string' ? s : s.skill || s.name}
                  </span>
                ))}
              </div>
            </Collapsible>
          )}

          {matchedKeywords.length > 0 && (
            <Collapsible title="Matched keywords" count={matchedKeywords.length}>
              <div className="chip-row">
                {matchedKeywords.map((k, i) => (
                  <span key={i} className="badge badge-blue">
                    {k}
                  </span>
                ))}
              </div>
            </Collapsible>
          )}

          {missingKeywords.length > 0 && (
            <Collapsible title="Missing keywords" count={missingKeywords.length} defaultOpen>
              <div className="chip-row">
                {missingKeywords.map((k, i) => (
                  <span key={i} className="badge badge-yellow">
                    {k}
                  </span>
                ))}
              </div>
            </Collapsible>
          )}

          <ResumeVersionsPanel
            parsedResume={parsedResume}
            jobDescription={jobDescription}
            matchResult={matchResult}
            suggestions={suggestions}
            targetRole={targetRole}
            onSelectVersion={handleSelectVersion}
          />

          {suggestions && (
            <Collapsible
              title="Improvement suggestions"
              count={
                (suggestions.add?.length || 0) +
                (suggestions.fix?.length || 0) +
                (suggestions.remove?.length || 0) +
                (suggestions.suggestions?.length || 0)
              }
              defaultOpen
            >
              {suggestions.add?.map((s, i) => (
                <SuggestionItem key={`a-${i}`} text={s} type="add" />
              ))}
              {suggestions.fix?.map((s, i) => (
                <SuggestionItem key={`f-${i}`} text={s} type="fix" />
              ))}
              {suggestions.remove?.map((s, i) => (
                <SuggestionItem key={`r-${i}`} text={s} type="remove" />
              ))}
              {suggestions.suggestions?.map((s, i) => (
                <SuggestionItem
                  key={`s-${i}`}
                  text={typeof s === 'string' ? s : s.suggestion || s.text}
                  type={s.type || 'fix'}
                />
              ))}
            </Collapsible>
          )}

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Zap size={14} />
                Apply AI improvements
              </div>
            </div>
            <p className="card-desc">
              Generate an optimized draft aligned to this job description. You can refine it in the
              Editor before exporting.
            </p>

            {optimizedResume && (
              <div className="alert alert-success">
                <CheckCircle size={13} />
                Resume optimized — preview updated on the right.
              </div>
            )}

            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOptimize}
                disabled={loading === 'optimize'}
              >
                {loading === 'optimize' ? (
                  <>
                    <div className="spinner" />
                    Optimizing…
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    Optimize resume
                  </>
                )}
              </button>
              {optimizedResume && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCompare(c => !c)}
                  >
                    <GitCompare size={13} />
                    {showCompare ? 'Hide' : 'Before / after'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleOpenEditor}>
                    Open editor
                    <ArrowRight size={13} />
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  abort()
                  resetOptimizer()
                }}
              >
                <RefreshCw size={13} />
                Start over
              </button>
            </div>

            {showCompare && optimizedResume && (
              <BeforeAfterCompare beforeText={beforeText} afterText={afterText} />
            )}

            {optimizedResume && (
              <div className="optimizer-editor-hint">
                <p className="muted-text">
                  Next: open the Editor to review suggestions and polish sections before export.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenEditor}>
                  Continue in Editor
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
