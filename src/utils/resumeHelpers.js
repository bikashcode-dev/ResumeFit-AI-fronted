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
  if (parsed.rawOptimizedText) return parsed.rawOptimizedText
  if (parsed.optimizedResume) return parsed.optimizedResume
  if (parsed.generatedResume) return parsed.generatedResume
  if (parsed.baseResume) return parsed.baseResume
  if (parsed.cleanText) return parsed.cleanText
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

const SECTION_ALIASES = {
  summary: ['SUMMARY', 'PROFILE', 'PROFESSIONAL SUMMARY', 'OBJECTIVE'],
  skills: ['SKILLS', 'TECHNICAL SKILLS', 'CORE SKILLS', 'TOOLS', 'TECHNOLOGIES'],
  experience: ['EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'INTERNSHIP', 'INTERNSHIPS'],
  education: ['EDUCATION', 'ACADEMIC BACKGROUND'],
  projects: ['PROJECTS', 'PROJECT EXPERIENCE'],
  certifications: ['CERTIFICATIONS', 'CERTIFICATES'],
  achievements: ['ACHIEVEMENTS', 'AWARDS'],
}

function canonicalSectionName(title) {
  const normalized = String(title || '').trim().replace(/[:\-]+$/, '').toUpperCase()
  const match = Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(normalized))
  return match?.[0] || null
}

function splitSectionText(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')
  const sections = {}
  let current = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const section = canonicalSectionName(line)
    if (section) {
      current = section
      if (!sections[current]) sections[current] = []
      continue
    }
    if (!line) {
      if (current) sections[current].push('')
      continue
    }
    if (!current) {
      current = 'summary'
      if (!sections[current]) sections[current] = []
    }
    sections[current].push(line)
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [
      key,
      value.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    ])
  )
}

function listFromText(text) {
  return String(text || '')
    .split(/\n|,|•/g)
    .map(item => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

function blocksFromText(text) {
  const blocks = String(text || '')
    .split(/\n{2,}/g)
    .map(block => block.trim())
    .filter(Boolean)
  return blocks.length ? blocks : listFromText(text)
}

function parseExperienceBlock(block) {
  const lines = String(block || '').split('\n').map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  const [first, ...rest] = lines
  return {
    title: first || 'Experience',
    company: '',
    duration: '',
    description: rest.length ? rest.join('\n') : first || '',
  }
}

function parseProjectBlock(block) {
  const lines = String(block || '').split('\n').map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  const [first, ...rest] = lines
  return {
    name: first || 'Project',
    description: rest.length ? rest.join('\n') : first || '',
  }
}

export function normalizeResumeData(input, fallback = {}) {
  if (!input) return null
  if (typeof input === 'string') {
    const sections = splitSectionText(input)
    return {
      ...fallback,
      summary: sections.summary || fallback.summary || '',
      skills: sections.skills ? listFromText(sections.skills) : flattenSkills(fallback.skills),
      experience: sections.experience
        ? blocksFromText(sections.experience).map(parseExperienceBlock)
        : fallback.experience || [],
      education: sections.education
        ? listFromText(sections.education).map(item => ({ degree: item, institution: '', year: '' }))
        : fallback.education || [],
      projects: sections.projects
        ? blocksFromText(sections.projects).map(parseProjectBlock)
        : fallback.projects || [],
      certifications: sections.certifications ? listFromText(sections.certifications) : fallback.certifications || [],
      achievements: sections.achievements ? listFromText(sections.achievements) : fallback.achievements || [],
      rawOptimizedText: input,
    }
  }

  if (typeof input === 'object') {
    const resumeText =
      input.optimizedResume ||
      input.generatedResume ||
      input.baseResume ||
      input.cleanText ||
      input.resumeText ||
      input.text ||
      ''
    const base = resumeText ? normalizeResumeData(resumeText, fallback) : { ...fallback }
    return {
      ...base,
      ...input,
      summary: input.summary ?? base.summary ?? '',
      skills: input.skills ?? base.skills ?? [],
      experience: input.experience ?? base.experience ?? [],
      education: input.education ?? base.education ?? [],
      projects: input.projects ?? base.projects ?? [],
      certifications: input.certifications ?? base.certifications ?? [],
      achievements: input.achievements ?? base.achievements ?? [],
      rawOptimizedText: input.rawOptimizedText || resumeText || base.rawOptimizedText || '',
    }
  }

  return null
}

export function buildPreviewFromDraft(draft) {
  if (!draft) return null
  const normalized = normalizeResumeData(draft) || draft
  const flatSkills = flattenSkills(normalized.skills)
  return {
    name: normalized.name || normalized.fullName || '',
    contact: {
      email: normalized.email || normalized.contact?.email || '',
      phone: normalized.phone || normalized.contact?.phone || '',
      location: normalized.location || normalized.currentLocation || normalized.contact?.location || '',
      linkedin: normalized.linkedin || normalized.linkedinUrl || normalized.contact?.linkedin || '',
      github: normalized.github || normalized.githubUrl || normalized.contact?.github || '',
      portfolio: normalized.portfolio || normalized.portfolioUrl || normalized.contact?.portfolio || '',
    },
    summary: normalized.summary || '',
    skills: flatSkills,
    experience: normalized.experience || [],
    education: normalized.education || [],
    projects: normalized.projects || [],
    certifications: normalized.certifications || [],
    achievements: normalized.achievements || [],
    custom: normalized.custom || [],
    rawOptimizedText: normalized.rawOptimizedText || '',
  }
}

export function buildPreviewFromOptimized(optimized, parsed) {
  if (!optimized) return null
  const base = normalizeResumeData(parsed) || {}
  return buildPreviewFromDraft(normalizeResumeData(optimized, base))
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
  const skills = flattenSkills(draft.skills)
  const listToLines = list =>
    (list || [])
      .map(item => (typeof item === 'string' ? item : Object.values(item || {}).filter(Boolean).join(' | ')))
      .filter(Boolean)
      .join('\n')

  return {
    fullName: draft.name || '',
    phone: draft.phone || '',
    email: draft.email || '',
    linkedinUrl: draft.linkedin || '',
    githubUrl: draft.github || '',
    portfolioUrl: draft.portfolio || '',
    currentLocation: draft.location || '',
    roleType: draft.targetRole || '',
    candidateLevel: draft.level || '',
    skills: skills.join(', '),
    summary: draft.summary || '',
    experienceDetails: listToLines(draft.experience),
    educationDetails: listToLines(draft.education),
    projectDetails: listToLines(draft.projects),
    certifications: (draft.certifications || []).join('\n'),
    achievements: (draft.achievements || []).join('\n'),
    sectionOrder: draft.sectionOrder || [],
    customSections: (draft.custom || [])
      .filter(section => section?.title?.trim() || section?.content?.trim())
      .map((section, index) => ({
        sectionKey: section.sectionKey || `custom-${index + 1}`,
        title: section.title || 'Additional Details',
        content: section.content || '',
        enabled: section.enabled !== false,
      })),
    includeSummary: draft.enabledSections?.summary !== false,
    includeSkills: draft.enabledSections?.skills !== false,
    includeProjects: draft.enabledSections?.projects !== false,
    includeEducation: draft.enabledSections?.education !== false,
    includeExperience: draft.enabledSections?.experience !== false,
    includeCertifications: draft.enabledSections?.certifications !== false,
    includeAchievements: draft.enabledSections?.achievements !== false,
  }
}
