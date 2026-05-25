import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Zap,
  PenTool,
  Download,
  ArrowRight,
  CheckCircle,
  FileText,
  Target,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import { hasMeaningfulContent, scoreBadgeClass } from '../utils/resumeHelpers.js'
import AtsTrendPanel from '../components/dashboard/AtsTrendPanel.jsx'

function QuickCard({ icon: Icon, title, description, action, to }) {
  const navigate = useNavigate()
  return (
    <article
      className="quick-card card"
      onClick={() => navigate(to)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(to)}
    >
      <div className="quick-card-icon">
        <Icon size={17} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="quick-card-action">
        {action} <ArrowRight size={13} />
      </span>
    </article>
  )
}

function StatusRow({ label, value, ok }) {
  return (
    <div className="status-row">
      <span>{label}</span>
      <span className={ok ? 'status-ok' : 'status-pending'}>
        {ok ? (
          <>
            <CheckCircle size={12} />
            {value}
          </>
        ) : (
          value
        )}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const {
    optimizerState,
    generatedResume,
    builderDraft,
    atsScore,
    history,
    analysisHistory,
    sessionRestored,
    dismissSessionRestored,
  } = useApp()
  const hasOptimized = !!optimizerState.optimizedResume
  const hasParsed = !!optimizerState.parsedResume
  const hasGenerated = !!generatedResume
  const hasDraft = hasMeaningfulContent(builderDraft)
  const canExport = hasOptimized || hasGenerated
  const skillsCount = optimizerState.confirmedSkills?.length ?? 0

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Your resume workspace — track progress, ATS scores, and next steps.
        </p>
      </div>

      {sessionRestored && (
        <div className="alert alert-info">
          <RotateCcw size={13} />
          <span>
            Session restored: resume parse, job description, skills ({skillsCount}), and match data
            are still loaded.
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={dismissSessionRestored}>
            Dismiss
          </button>
        </div>
      )}

      {analysisHistory.length > 0 ? (
        <AtsTrendPanel analyses={analysisHistory} />
      ) : (
        atsScore != null && (
          <div className="dashboard-ats-banner card">
            <Target size={18} />
            <div>
              <div className="dashboard-ats-label">Latest ATS match</div>
              <div className="dashboard-ats-value">
                <span className={`badge ${scoreBadgeClass(atsScore)}`}>{Math.round(atsScore)}/100</span>
                {optimizerState.targetRole && (
                  <span className="muted-text">for {optimizerState.targetRole}</span>
                )}
              </div>
            </div>
            <Link to="/optimizer" className="btn btn-secondary btn-sm">
              View analysis
              <ArrowRight size={13} />
            </Link>
          </div>
        )
      )}

      <nav className="workspace-hub card" aria-label="Workspace shortcuts">
        <Link to="/optimizer" className="workspace-hub-item">
          <Zap size={16} />
          <span>Optimizer</span>
          <small>Upload → JD → Analyze</small>
        </Link>
        <Link to="/builder" className="workspace-hub-item">
          <PenTool size={16} />
          <span>Builder</span>
          <small>Sections + reorder</small>
        </Link>
        <Link to="/editor" className="workspace-hub-item">
          <FileText size={16} />
          <span>Editor</span>
          <small>Edit + checklist</small>
        </Link>
      </nav>

      <div className="grid-3">
        <QuickCard
          icon={Zap}
          title="Optimize resume"
          description="Upload PDF/DOCX, paste a JD, and get ATS scores, keyword gaps, and AI improvements."
          action="Start optimizing"
          to="/optimizer"
        />
        <QuickCard
          icon={PenTool}
          title="Build from scratch"
          description="Create an ATS-ready resume from your real profile, skills, and experience."
          action="Open builder"
          to="/builder"
        />
        <QuickCard
          icon={Download}
          title="Export resume"
          description="Download ATS PDF, minimal PDF, DOCX, or plain text when your draft is ready."
          action="Go to exports"
          to="/exports"
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={14} />
              Workspace status
            </div>
          </div>
          <StatusRow label="Resume uploaded" value={hasParsed ? 'Ready' : 'Not yet'} ok={hasParsed} />
          <StatusRow
            label="JD & skills saved"
            value={
              optimizerState.jobDescription?.trim()
                ? `${skillsCount} skills`
                : 'Not set'
            }
            ok={!!optimizerState.jobDescription?.trim() && skillsCount > 0}
          />
          <StatusRow
            label="ATS analysis"
            value={optimizerState.matchResult ? 'Complete' : 'Pending'}
            ok={!!optimizerState.matchResult}
          />
          <StatusRow label="Optimized draft" value={hasOptimized ? 'Ready' : 'Pending'} ok={hasOptimized} />
          <StatusRow label="Builder draft" value={hasDraft ? 'In progress' : 'Empty'} ok={hasDraft} />
          <StatusRow label="Export ready" value={canExport ? 'Yes' : 'No content'} ok={canExport} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recommended next step</div>
          </div>
          <div className="next-step">
            {!hasParsed && !hasDraft && (
              <>
                <p>Upload a resume in the Optimizer or start the Builder with your real details.</p>
                <div className="row" style={{ marginTop: 12 }}>
                  <Link to="/optimizer" className="btn btn-primary btn-sm">
                    Optimizer
                  </Link>
                  <Link to="/builder" className="btn btn-secondary btn-sm">
                    Builder
                  </Link>
                </div>
              </>
            )}
            {hasParsed && !optimizerState.matchResult && (
              <>
                <p>Resume uploaded — paste the job description and run ATS analysis.</p>
                <Link to="/optimizer" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  Continue in Optimizer
                </Link>
              </>
            )}
            {optimizerState.matchResult && !hasOptimized && (
              <>
                <p>Analysis complete — review gaps and apply AI improvements.</p>
                <Link to="/optimizer" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  Optimize now
                </Link>
              </>
            )}
            {(hasOptimized || hasGenerated) && (
              <>
                <p>Your draft is ready — refine in the Editor (suggestion checklist) or export.</p>
                <div className="row" style={{ marginTop: 12 }}>
                  <Link to="/editor" className="btn btn-secondary btn-sm">
                    Editor
                  </Link>
                  <Link to="/exports" className="btn btn-primary btn-sm">
                    Export
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <div className="card-title">
              <Clock size={14} />
              Recent saved drafts
            </div>
            <Link to="/history" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          <ul className="recent-list">
            {history.slice(0, 4).map(entry => (
              <li key={entry.id}>
                <span>{entry.label}</span>
                <span className="muted-text">
                  {new Date(entry.savedAt).toLocaleDateString()}
                  {entry.atsScore != null && ` · ATS ${Math.round(entry.atsScore)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
