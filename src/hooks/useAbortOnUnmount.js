import { useEffect, useRef, useCallback } from 'react'

export function useAbortOnUnmount() {
  const controllerRef = useRef(null)

  const getSignal = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()
    return controllerRef.current.signal
  }, [])

  const abort = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { getSignal, abort }
}
