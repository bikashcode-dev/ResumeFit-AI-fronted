import React, { useState } from 'react'
import { Download, FileText, Code, File, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useApp } from '../app/AppContext.jsx'
import { exportDocx, exportPdf, downloadBlob, getFriendlyError } from '../api/resumeApi.js'
import { buildExportFilename, buildExportPayload, resolveResumeName } from '../utils/exportHelpers.js'
import { useToast } from '../components/ui/Toast.jsx'

function ExportCard({ icon: Icon, title, description, format, onExport, loading, disabled, filenameHint }) {
  return (
    <article className="card export-card">
      <div className="export-card-head">
        <div className="export-card-icon">
          <Icon size={18} />
        </div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
          {filenameHint && !disabled && (
            <p className="export-filename-hint">
              Saves as: <code>{filenameHint}</code>
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary export-btn"
        onClick={onExport}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
      >
        {loading ? (
          <>
            <div className="spinner" />
            Exporting…
          </>
        ) : (
          <>
            <Download size={13} />
            Download {format}
          </>
        )}
      </button>
    </article>
  )
}

export default function ExportsPage() {
  const { generatedResume, optimizerState, builderDraft } = useApp()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [lastExport, setLastExport] = useState(null)

  const content = generatedResume || optimizerState.optimizedResume
  const hasContent = !!content

  const exportCtx = { content, builderDraft, optimizerState, generatedResume }

  function filenames() {
    return {
      docx: buildExportFilename('docx', exportCtx),
      'ats-pdf': buildExportFilename('ats-pdf', exportCtx),
      'minimal-pdf': buildExportFilename('minimal-pdf', exportCtx),
      txt: buildExportFilename('txt', exportCtx),
    }
  }

  const names = filenames()
  const displayName = resolveResumeName(content, builderDraft, optimizerState) || 'Your resume'

  async function handleExport(type) {
    if (!hasContent) return
    setError(null)
    setLoading(type)
    try {
      const payload = buildExportPayload(content, exportCtx)
      let blob
      let filename

      if (type === 'docx') {
        blob = await exportDocx(payload)
        filename = names.docx
      } else if (type === 'ats-pdf') {
        blob = await exportPdf('ats', payload)
        filename = names['ats-pdf']
      } else if (type === 'minimal-pdf') {
        blob = await exportPdf('minimal', payload)
        filename = names['minimal-pdf']
      } else if (type === 'txt') {
        blob = new Blob([payload.resumeText], { type: 'text/plain' })
        filename = names.txt
      }

      if (blob) {
        downloadBlob(blob, filename)
        setLastExport({ type, filename })
        addToast(`Downloaded ${filename}`, 'success')
      }
    } catch (e) {
      setError(getFriendlyError(e))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Export resume</h1>
        <p className="page-subtitle">Download your current draft in recruiter-friendly formats.</p>
      </div>

      {!hasContent && (
        <div className="alert alert-info">
          <Info size={14} />
          No resume ready to export. Build in the Builder or optimize an upload first.
        </div>
      )}

      {hasContent && (
        <div className="card export-meta-card">
          <div className="export-meta-row">
            <span className="export-meta-label">Candidate</span>
            <span>{displayName}</span>
          </div>
          {(optimizerState.targetRole || builderDraft.targetRole) && (
            <div className="export-meta-row">
              <span className="export-meta-label">Target role</span>
              <span>{optimizerState.targetRole || builderDraft.targetRole}</span>
            </div>
          )}
          {optimizerState.matchResult && (
            <div className="export-meta-row">
              <span className="export-meta-label">ATS score</span>
              <span>
                {Math.round(
                  optimizerState.matchResult.atsScore ??
                    optimizerState.matchResult.score ??
                    optimizerState.matchResult.matchScore ??
                    0
                )}
                /100
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={13} />
          <span>{error}</span>
        </div>
      )}

      {lastExport && !error && (
        <div className="alert alert-success">
          <CheckCircle size={13} />
          Downloaded <strong>{lastExport.filename}</strong>
        </div>
      )}

      <div className="grid-2">
        <ExportCard
          icon={FileText}
          title="ATS PDF"
          description="Text-friendly PDF designed to parse cleanly in applicant tracking systems."
          format="ATS PDF"
          onExport={() => handleExport('ats-pdf')}
          loading={loading === 'ats-pdf'}
          disabled={!hasContent}
          filenameHint={names['ats-pdf']}
        />
        <ExportCard
          icon={File}
          title="Minimal PDF"
          description="Refined layout for emailing directly to recruiters."
          format="Minimal PDF"
          onExport={() => handleExport('minimal-pdf')}
          loading={loading === 'minimal-pdf'}
          disabled={!hasContent}
          filenameHint={names['minimal-pdf']}
        />
        <ExportCard
          icon={FileText}
          title="DOCX"
          description="Editable Word format for HR platforms."
          format="DOCX"
          onExport={() => handleExport('docx')}
          loading={loading === 'docx'}
          disabled={!hasContent}
          filenameHint={names.docx}
        />
        <ExportCard
          icon={Code}
          title="Plain text"
          description="UTF-8 text for pasting into online application forms."
          format="TXT"
          onExport={() => handleExport('txt')}
          loading={loading === 'txt'}
          disabled={!hasContent}
          filenameHint={names.txt}
        />
      </div>

      <div className="export-tips card">
        <strong>Format guide:</strong> ATS PDF for job portals · Minimal PDF for email · DOCX when
        requested · TXT for web forms. Filenames include your name, role, and today&apos;s date.
      </div>
    </div>
  )
}
