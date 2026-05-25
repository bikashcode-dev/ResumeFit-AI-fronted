import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { loadHistory, saveHistoryEntry } from '../hooks/useLocalHistory.js'
import { loadAnalysisHistory, recordAnalysis } from '../hooks/useAnalysisHistory.js'
import {
  loadOptimizerSession,
  saveOptimizerSession,
  loadBuilderSession,
  saveBuilderSession,
  loadGeneratedSession,
  saveGeneratedSession,
  loadEditorFlowSession,
  saveEditorFlowSession,
  clearOptimizerSession,
} from '../utils/sessionStorage.js'

const AppContext = createContext(null)

const EMPTY_BUILDER = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  level: '',
  targetRole: '',
  skills: { languages: [], frameworks: [], databases: [], tools: [], soft: [] },
  skillGroupOrder: ['languages', 'frameworks', 'databases', 'tools', 'soft'],
  summary: '',
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  custom: [],
  sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'achievements'],
  enabledSections: {
    summary: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true,
    achievements: true,
  },
}

const EMPTY_OPTIMIZER = {
  parsedResume: null,
  parsedFile: null,
  jobDescription: '',
  targetRole: '',
  candidateStage: '',
  confirmedSkills: [],
  jdAnalysis: null,
  matchResult: null,
  suggestions: null,
  optimizedResume: null,
  beforeResume: null,
  step: 0,
}

function mergeOptimizer(saved) {
  if (!saved || typeof saved !== 'object') return EMPTY_OPTIMIZER
  return { ...EMPTY_OPTIMIZER, ...saved }
}

function mergeBuilder(saved) {
  if (!saved || typeof saved !== 'object') return EMPTY_BUILDER
  const skills = saved.skills
  const normalizedSkills =
    skills && typeof skills === 'object' && !Array.isArray(skills)
      ? { ...EMPTY_BUILDER.skills, ...skills }
      : EMPTY_BUILDER.skills
  return {
    ...EMPTY_BUILDER,
    ...saved,
    skills: normalizedSkills,
    skillGroupOrder: saved.skillGroupOrder || EMPTY_BUILDER.skillGroupOrder,
  }
}

function useDebouncedSave(fn, delay = 400) {
  const timer = useRef(null)
  return useCallback(
    (...args) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => fn(...args), delay)
    },
    [fn, delay]
  )
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [optimizerState, setOptimizerState] = useState(() =>
    mergeOptimizer(loadOptimizerSession())
  )
  const [builderDraft, setBuilderDraft] = useState(() => mergeBuilder(loadBuilderSession()))
  const [generatedResume, setGeneratedResume] = useState(() => loadGeneratedSession())
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [history, setHistory] = useState(() => loadHistory())
  const [analysisHistory, setAnalysisHistory] = useState(() => loadAnalysisHistory())
  const [editorFlow, setEditorFlow] = useState(() => loadEditorFlowSession())
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const [editorUndo, setEditorUndo] = useState({ undo: null, revert: null, canUndo: false })
  const [sessionRestored, setSessionRestored] = useState(false)
  const [storageWarning, setStorageWarning] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const opt = loadOptimizerSession()
    const builder = loadBuilderSession()
    const had =
      !!(opt?.parsedResume || opt?.matchResult || opt?.jobDescription?.trim()) ||
      !!builder?.name?.trim()
    setSessionRestored(had)

    const hist = loadAnalysisHistory()
    if (hist.length === 0 && opt?.matchResult) {
      const next = recordAnalysis({
        matchResult: opt.matchResult,
        targetRole: opt.targetRole,
        candidateStage: opt.candidateStage,
        parsedFile: opt.parsedFile,
        confirmedSkills: opt.confirmedSkills,
        jobDescription: opt.jobDescription,
      })
      setAnalysisHistory(next)
    }
  }, [])

  const debouncedSaveBuilder = useDebouncedSave(saveBuilderSession)
  const debouncedSaveGenerated = useDebouncedSave(saveGeneratedSession)
  const debouncedSaveEditorFlow = useDebouncedSave(saveEditorFlowSession)

  useEffect(() => {
    const timer = setTimeout(() => {
      const r = saveOptimizerSession(optimizerState)
      if (r?.ok === false) {
        setStorageWarning(
          'Session data is too large for browser storage. Reduce content or export your draft.'
        )
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [optimizerState])

  useEffect(() => {
    debouncedSaveBuilder(builderDraft)
  }, [builderDraft, debouncedSaveBuilder])

  useEffect(() => {
    debouncedSaveGenerated(generatedResume)
  }, [generatedResume, debouncedSaveGenerated])

  useEffect(() => {
    debouncedSaveEditorFlow(editorFlow)
  }, [editorFlow, debouncedSaveEditorFlow])

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  const updateBuilderDraft = useCallback(updates => {
    setBuilderDraft(prev => ({ ...prev, ...updates }))
  }, [])

  const resetOptimizer = useCallback(() => {
    setOptimizerState(EMPTY_OPTIMIZER)
    clearOptimizerSession()
    setEditorFlow(null)
  }, [])

  const getActiveResume = useCallback(() => {
    return generatedResume || optimizerState.optimizedResume || optimizerState.parsedResume || null
  }, [generatedResume, optimizerState])

  const pushAnalysisRecord = useCallback(
    (override = {}) => {
      const next = recordAnalysis({
        matchResult: optimizerState.matchResult,
        targetRole: optimizerState.targetRole,
        candidateStage: optimizerState.candidateStage,
        parsedFile: optimizerState.parsedFile,
        confirmedSkills: optimizerState.confirmedSkills,
        jobDescription: optimizerState.jobDescription,
        ...override,
      })
      setAnalysisHistory(next)
      return next
    },
    [optimizerState]
  )

  const openEditorFromOptimizer = useCallback(
    (resume, extra = {}) => {
      const applied = extra.appliedSuggestions || {}
      setGeneratedResume(resume)
      setEditorFlow({
        source: 'optimizer',
        openedAt: new Date().toISOString(),
        targetRole: optimizerState.targetRole,
        atsScore:
          optimizerState.matchResult?.atsScore ??
          optimizerState.matchResult?.score ??
          optimizerState.matchResult?.matchScore ??
          null,
        suggestions: optimizerState.suggestions,
        appliedSuggestions: applied,
        parsedFile: optimizerState.parsedFile,
      })
      return true
    },
    [optimizerState]
  )

  const updateEditorFlow = useCallback(updates => {
    setEditorFlow(prev => (prev ? { ...prev, ...updates } : null))
  }, [])

  const clearEditorFlow = useCallback(() => {
    setEditorFlow(null)
  }, [])

  const saveDraft = useCallback(() => {
    const resume = getActiveResume()
    const label =
      resume?.name ||
      builderDraft.name ||
      optimizerState.parsedFile ||
      'Untitled draft'
    const entry = {
      label,
      source: generatedResume
        ? optimizerState.optimizedResume
          ? 'optimizer'
          : 'builder'
        : 'builder',
      resume: resume || builderDraft,
      atsScore:
        optimizerState.matchResult?.atsScore ??
        optimizerState.matchResult?.score ??
        optimizerState.matchResult?.matchScore ??
        null,
      targetRole: optimizerState.targetRole || builderDraft.targetRole || '',
    }
    const next = saveHistoryEntry(entry)
    setHistory(next)
    setDraftSavedAt(new Date().toISOString())
    return entry
  }, [getActiveResume, builderDraft, optimizerState, generatedResume])

  const atsScore =
    optimizerState.matchResult?.atsScore ??
    optimizerState.matchResult?.score ??
    optimizerState.matchResult?.matchScore ??
    null

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        optimizerState,
        setOptimizerState,
        resetOptimizer,
        builderDraft,
        setBuilderDraft,
        updateBuilderDraft,
        generatedResume,
        setGeneratedResume,
        previewCollapsed,
        setPreviewCollapsed,
        history,
        setHistory,
        analysisHistory,
        setAnalysisHistory,
        pushAnalysisRecord,
        saveDraft,
        draftSavedAt,
        getActiveResume,
        atsScore,
        editorUndo,
        setEditorUndo,
        editorFlow,
        openEditorFromOptimizer,
        updateEditorFlow,
        clearEditorFlow,
        sessionRestored,
        dismissSessionRestored: () => setSessionRestored(false),
        storageWarning,
        dismissStorageWarning: () => setStorageWarning(null),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
