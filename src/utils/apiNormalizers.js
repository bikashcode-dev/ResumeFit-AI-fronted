export function normalizeMatchResult(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const score =
    raw.atsScore ?? raw.score ?? raw.matchScore ?? raw.overallScore ?? null
  const gap = raw.skillGapAnalysis || {}
  const truth = raw.truthAnalysis || {}
  return {
    ...raw,
    atsScore: score,
    score: score ?? raw.score,
    matchScore: score ?? raw.matchScore,
    skillGaps:
      raw.skillGaps ??
      raw.missingSkills ??
      raw.criticalGaps ??
      gap.criticalMissing ??
      [],
    optionalSkillGaps: raw.optionalSkillGaps ?? gap.optionalMissing ?? [],
    matchedSkills:
      raw.matchedSkills ??
      raw.presentSkills ??
      raw.coveredSkills ??
      gap.coveredByUserSkills ??
      [],
    missingKeywords: raw.missingKeywords ?? raw.keywordsMissing ?? [],
    matchedKeywords: raw.matchedKeywords ?? raw.keywordsMatched ?? [],
    truthScore: raw.truthScore ?? raw.credibilityScore ?? raw.honestyScore ?? truth.truthScore ?? truth.score ?? null,
    sectionPriorities: raw.sectionPriorities ?? raw.recommendedSections ?? [],
  }
}

export function normalizeVersionsResponse(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.versions)) return raw.versions
  if (Array.isArray(raw.data)) return raw.data
  return []
}
