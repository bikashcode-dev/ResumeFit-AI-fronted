export function reorderArray(list, fromIndex, toIndex) {
  if (!list?.length || fromIndex === toIndex) return list
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
    return list
  }
  const next = [...list]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function moveItemUp(list, index) {
  if (index <= 0) return list
  return reorderArray(list, index, index - 1)
}

export function moveItemDown(list, index) {
  if (!list || index >= list.length - 1) return list
  return reorderArray(list, index, index + 1)
}
