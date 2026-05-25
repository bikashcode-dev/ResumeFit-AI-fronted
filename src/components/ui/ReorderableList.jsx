import React, { useState } from 'react'
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { reorderArray } from '../../utils/reorderHelpers.js'

export default function ReorderableList({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  emptyLabel = 'No items yet',
  label = 'Reorder items',
}) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  if (!items?.length) {
    return <p className="muted-text reorder-empty">{emptyLabel}</p>
  }

  function handleDrop(targetIndex) {
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    onReorder(reorderArray(items, dragIndex, targetIndex))
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="reorder-list" role="list" aria-label={label}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index)
        const isDragging = dragIndex === index
        const isOver = overIndex === index && dragIndex !== index

        return (
          <div
            key={key}
            role="listitem"
            className={`reorder-item${isDragging ? ' dragging' : ''}${isOver ? ' drag-over' : ''}`}
            draggable
            onDragStart={e => {
              setDragIndex(index)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragOver={e => {
              e.preventDefault()
              setOverIndex(index)
            }}
            onDragLeave={() => setOverIndex(null)}
            onDrop={e => {
              e.preventDefault()
              handleDrop(index)
            }}
          >
            <div className="reorder-controls" aria-label="Reorder controls">
              <span className="reorder-grip" aria-hidden="true" title="Drag to reorder">
                <GripVertical size={16} />
              </span>
              <button
                type="button"
                className="btn btn-icon reorder-btn"
                disabled={index === 0}
                onClick={() => onReorder(reorderArray(items, index, index - 1))}
                aria-label="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="btn btn-icon reorder-btn"
                disabled={index === items.length - 1}
                onClick={() => onReorder(reorderArray(items, index, index + 1))}
                aria-label="Move down"
              >
                <ChevronDown size={14} />
              </button>
              <span className="reorder-index">{index + 1}</span>
            </div>
            <div className="reorder-content">{renderItem(item, index)}</div>
          </div>
        )
      })}
    </div>
  )
}
