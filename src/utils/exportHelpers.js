import { extractTextFromParsed } from './resumeHelpers.js'

function slugPart(value, fallback = '') {
  if (!value || typeof value !== 'string') return fallback
  const s = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return s || fallback
}

export function resolveResumeName(content, builderDraft, optimizerState) {
  if (!content) return ''
  if (typeof content === 'object') {
    return (
      content.name ||
      content.contact?.name ||
      builderDraft?.name ||
      ''
    )
  }
  return builderDraft?.name || ''
}

export function buildExportFilename(type, { content, builderDraft, optimizerState }) {
  const name = slugPart(resolveResumeName(content, builderDraft, optimizerState), 'resume')
  const role = slugPart(
    optimizerState?.targetRole || builderDraft?.targetRole,
    ''
  )
  const date = new Date().toISOString().slice(0, 10)
  const base = role ? `${name}-${role}` : name

  const extensions = {
    docx: 'docx',
    'ats-pdf': 'ats.pdf',
    'minimal-pdf': 'minimal.pdf',
    txt: 'txt',
  }
  const ext = extensions[type] || 'bin'
  return `${base}-${date}.${ext}`
}

export function buildExportPayload(content, { builderDraft, optimizerState, generatedResume }) {
  const resumeText =
    typeof content === 'string' ? content : extractTextFromParsed(content)

  const atsScore =
    optimizerState?.matchResult?.atsScore ??
    optimizerState?.matchResult?.score ??
    optimizerState?.matchResult?.matchScore ??
    null

  const source = generatedResume && optimizerState?.optimizedResume
    ? 'optimizer'
    : generatedResume
      ? 'builder'
      : optimizerState?.optimizedResume
        ? 'optimizer'
        : 'upload'

  return {
    resume: resumeText,
    data: content,
    metadata: {
      exportedAt: new Date().toISOString(),
      targetRole: optimizerState?.targetRole || builderDraft?.targetRole || '',
      candidateStage: optimizerState?.candidateStage || builderDraft?.level || '',
      atsScore: atsScore != null ? Math.round(Number(atsScore)) : null,
      source,
      filenameHint: resolveResumeName(content, builderDraft, optimizerState) || 'resume',
    },
  }
}
