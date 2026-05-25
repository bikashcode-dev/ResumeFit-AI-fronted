export function normalizeMatchResult(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const score =
    raw.atsScore ?? raw.score ?? raw.matchScore ?? raw.overallScore ?? null
  return {
    ...raw,
    atsScore: score,
    score: score ?? raw.score,
    matchScore: score ?? raw.matchScore,
    skillGaps: raw.skillGaps ?? raw.missingSkills ?? raw.criticalGaps ?? [],
    matchedSkills: raw.matchedSkills ?? raw.presentSkills ?? raw.coveredSkills ?? [],
    missingKeywords: raw.missingKeywords ?? raw.keywordsMissing ?? [],
    matchedKeywords: raw.matchedKeywords ?? raw.keywordsMatched ?? [],
    truthScore: raw.truthScore ?? raw.credibilityScore ?? raw.honestyScore ?? null,
  }
}

export function normalizeVersionsResponse(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.versions)) return raw.versions
  if (Array.isArray(raw.data)) return raw.data
  return []
}
