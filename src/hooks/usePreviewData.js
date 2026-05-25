import { useLocation } from 'react-router-dom'
import { useApp } from '../app/AppContext.jsx'
import {
  buildPreviewFromDraft,
  buildPreviewFromOptimized,
  hasMeaningfulContent,
} from '../utils/resumeHelpers.js'

export function usePreviewData() {
  const { pathname } = useLocation()
  const { optimizerState, builderDraft, generatedResume } = useApp()

  if (pathname === '/builder' || pathname === '/editor') {
    if (generatedResume) return buildPreviewFromDraft(generatedResume)
    if (hasMeaningfulContent(builderDraft)) return buildPreviewFromDraft(builderDraft)
    return null
  }

  if (pathname === '/optimizer') {
    if (optimizerState.optimizedResume) {
      return buildPreviewFromOptimized(
        optimizerState.optimizedResume,
        optimizerState.parsedResume
      )
    }
    if (optimizerState.parsedResume) return buildPreviewFromDraft(optimizerState.parsedResume)
    return null
  }

  if (pathname === '/exports' || pathname === '/dashboard') {
    if (generatedResume) return buildPreviewFromDraft(generatedResume)
    if (optimizerState.optimizedResume) {
      return buildPreviewFromOptimized(
        optimizerState.optimizedResume,
        optimizerState.parsedResume
      )
    }
  }

  return null
}
