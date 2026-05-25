export function scoreColor(score) {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

export function scoreBadgeClass(score) {
  if (score >= 80) return 'badge-green'
  if (score >= 60) return 'badge-yellow'
  return 'badge-red'
}

export function scoreLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Needs work'
}

export function extractTextFromParsed(parsed) {
  if (!parsed) return ''
  if (typeof parsed === 'string') return parsed
  if (parsed.text) return parsed.text
  if (parsed.content) return parsed.content
  if (parsed.rawText) return parsed.rawText
  if (parsed.resumeText) return parsed.resumeText
  return JSON.stringify(parsed)
}

export function flattenSkills(skills) {
  if (!skills) return []
  if (Array.isArray(skills)) return skills
  if (typeof skills === 'object') {
    return Object.values(skills).flat().filter(Boolean)
  }
  return []
}

export function buildPreviewFromDraft(draft) {
  if (!draft) return null
  const flatSkills = flattenSkills(draft.skills)
  return {
    name: draft.name || '',
    contact: {
      email: draft.email || '',
      phone: draft.phone || '',
      location: draft.location || '',
      linkedin: draft.linkedin || '',
      github: draft.github || '',
      portfolio: draft.portfolio || '',
    },
    summary: draft.summary || '',
    skills: flatSkills,
    experience: draft.experience || [],
    education: draft.education || [],
    projects: draft.projects || [],
    certifications: draft.certifications || [],
    achievements: draft.achievements || [],
    custom: draft.custom || [],
  }
}

export function buildPreviewFromOptimized(optimized, parsed) {
  if (!optimized) return null
  const base = typeof parsed === 'object' && parsed ? parsed : {}
  const merged = { ...base, ...optimized }
  return buildPreviewFromDraft(merged)
}

export function formatSectionName(key) {
  const names = {
    summary: 'Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    achievements: 'Achievements',
    custom: 'Custom Section',
  }
  return names[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

export function hasMeaningfulContent(draft) {
  if (!draft) return false
  const hasName = !!draft.name?.trim()
  const flatSkills = flattenSkills(draft.skills)
  const hasContent = !!(
    draft.summary?.trim() ||
    draft.experience?.length ||
    flatSkills.length ||
    draft.education?.length ||
    draft.projects?.length
  )
  return hasName || hasContent
}

export function sanitizeText(str) {
  if (!str) return ''
  return str
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, '')
    .trim()
}

export function getMatchBreakdown(matchResult) {
  if (!matchResult) return []
  const breakdown =
    matchResult.breakdown ||
    matchResult.scoreBreakdown ||
    matchResult.categories ||
    null
  if (Array.isArray(breakdown)) {
    return breakdown.map(item => ({
      label: item.label || item.name || item.category,
      score: item.score ?? item.value ?? 0,
      description: item.description || item.detail || '',
    }))
  }
  if (breakdown && typeof breakdown === 'object') {
    return Object.entries(breakdown).map(([label, score]) => ({
      label: label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      score: typeof score === 'number' ? score : score?.score ?? 0,
      description: typeof score === 'object' ? score.description : '',
    }))
  }
  return []
}

export function normalizeKeywords(list) {
  if (!list?.length) return []
  return list.map(k =>
    typeof k === 'string' ? k : k.keyword || k.term || k.name || k.skill || ''
  ).filter(Boolean)
}

export function builderPayloadFromDraft(draft) {
  return {
    ...draft,
    skills: flattenSkills(draft.skills),
  }
}
