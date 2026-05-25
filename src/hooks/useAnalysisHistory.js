const STORAGE_KEY = 'resumefit-analysis-history'
const MAX_ENTRIES = 24

export function loadAnalysisHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function recordAnalysis(entry) {
  const score =
    entry.atsScore ??
    entry.matchResult?.atsScore ??
    entry.matchResult?.score ??
    entry.matchResult?.matchScore

  if (score == null && !entry.matchResult) return loadAnalysisHistory()

  const truthScore =
    entry.truthScore ??
    entry.matchResult?.truthScore ??
    entry.matchResult?.credibilityScore ??
    entry.matchResult?.honestyScore ??
    null

  const item = {
    id: crypto.randomUUID(),
    analyzedAt: new Date().toISOString(),
    atsScore: score != null ? Math.round(Number(score)) : null,
    truthScore: truthScore != null ? Math.round(Number(truthScore)) : null,
    targetRole: entry.targetRole || '',
    candidateStage: entry.candidateStage || '',
    parsedFile: entry.parsedFile || '',
    skillsCount: entry.confirmedSkills?.length ?? 0,
    jdPreview: (entry.jobDescription || '').slice(0, 72),
  }

  const list = loadAnalysisHistory()
  const duplicate = list[0]?.atsScore === item.atsScore &&
    list[0]?.parsedFile === item.parsedFile &&
    list[0]?.targetRole === item.targetRole &&
    Date.now() - new Date(list[0]?.analyzedAt).getTime() < 5000

  if (duplicate) return list

  const next = [item, ...list].slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* ignore quota */ }
  return next
}
