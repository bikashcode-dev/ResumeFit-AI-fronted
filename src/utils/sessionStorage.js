const KEYS = {
  optimizer: 'resumefit-session-optimizer',
  builder: 'resumefit-session-builder',
  generated: 'resumefit-session-generated',
  editorFlow: 'resumefit-session-editor-flow',
}

function safeParse(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    const raw = JSON.stringify(value)
    if (raw.length > 4_500_000) {
      return { ok: false, reason: 'too_large' }
    }
    sessionStorage.setItem(key, raw)
    return { ok: true }
  } catch (err) {
    if (err?.name === 'QuotaExceededError') {
      return { ok: false, reason: 'quota' }
    }
    return { ok: false, reason: 'unknown' }
  }
}

export function loadOptimizerSession() {
  return safeParse(sessionStorage.getItem(KEYS.optimizer))
}

export function saveOptimizerSession(state) {
  if (!state) return
  const payload = {
    parsedResume: state.parsedResume ?? null,
    parsedFile: state.parsedFile ?? '',
    jobDescription: state.jobDescription ?? '',
    targetRole: state.targetRole ?? '',
    candidateStage: state.candidateStage ?? '',
    confirmedSkills: state.confirmedSkills ?? [],
    jdAnalysis: state.jdAnalysis ?? null,
    matchResult: state.matchResult ?? null,
    suggestions: state.suggestions ?? null,
    optimizedResume: state.optimizedResume ?? null,
    beforeResume: state.beforeResume ?? null,
    step: state.step ?? 0,
  }
  return safeSet(KEYS.optimizer, payload)
}

export function loadBuilderSession() {
  return safeParse(sessionStorage.getItem(KEYS.builder))
}

export function saveBuilderSession(draft) {
  if (!draft) return
  return safeSet(KEYS.builder, draft)
}

export function loadGeneratedSession() {
  return safeParse(sessionStorage.getItem(KEYS.generated))
}

export function saveGeneratedSession(resume) {
  if (resume == null) {
    try {
      sessionStorage.removeItem(KEYS.generated)
    } catch { /* ignore */ }
    return
  }
  return safeSet(KEYS.generated, resume)
}

export function loadEditorFlowSession() {
  return safeParse(sessionStorage.getItem(KEYS.editorFlow))
}

export function saveEditorFlowSession(flow) {
  if (!flow) {
    try {
      sessionStorage.removeItem(KEYS.editorFlow)
    } catch { /* ignore */ }
    return
  }
  return safeSet(KEYS.editorFlow, flow)
}

export function clearOptimizerSession() {
  try {
    sessionStorage.removeItem(KEYS.optimizer)
  } catch { /* ignore */ }
}
