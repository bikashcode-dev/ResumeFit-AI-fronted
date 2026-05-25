/**
 * Simple line-level diff for before/after resume text compare.
 */
export function computeLineDiff(beforeText, afterText) {
  const beforeLines = (beforeText || '').split('\n')
  const afterLines = (afterText || '').split('\n')
  const maxLen = Math.max(beforeLines.length, afterLines.length)
  const rows = []

  for (let i = 0; i < maxLen; i++) {
    const b = beforeLines[i]
    const a = afterLines[i]
    if (b === undefined && a !== undefined) {
      rows.push({ type: 'add', before: '', after: a })
    } else if (a === undefined && b !== undefined) {
      rows.push({ type: 'remove', before: b, after: '' })
    } else if (b === a) {
      rows.push({ type: 'same', before: b, after: a })
    } else {
      rows.push({ type: 'change', before: b ?? '', after: a ?? '' })
    }
  }

  return rows
}

export function countDiffStats(rows) {
  let added = 0
  let removed = 0
  let changed = 0
  for (const r of rows) {
    if (r.type === 'add') added++
    else if (r.type === 'remove') removed++
    else if (r.type === 'change') changed++
  }
  return { added, removed, changed, total: rows.length }
}
