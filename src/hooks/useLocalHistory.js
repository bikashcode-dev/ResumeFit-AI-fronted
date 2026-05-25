const STORAGE_KEY = 'resumefit-history'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistoryEntry(entry) {
  const list = loadHistory()
  const next = [
    {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      ...entry,
    },
    ...list,
  ].slice(0, 24)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeHistoryEntry(id) {
  const next = loadHistory().filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
