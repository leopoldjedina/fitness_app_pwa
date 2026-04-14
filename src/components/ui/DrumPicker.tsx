'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion'

interface DrumPickerProps<T> {
  items: T[]
  value: T
  onChange: (value: T) => void
  renderItem?: (item: T) => string
  itemHeight?: number
  width?: number
}

export default function DrumPicker<T>({
  items,
  value,
  onChange,
  renderItem = (item) => String(item),
  itemHeight = 44,
  width = 80,
}: DrumPickerProps<T>) {
  const y = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const visibleCount = 5
  const containerHeight = itemHeight * visibleCount

  // Convert index to y position (center item = 0)
  const indexToY = useCallback(
    (index: number) => -index * itemHeight + (containerHeight / 2 - itemHeight / 2),
    [itemHeight, containerHeight]
  )

  // Convert y to nearest index
  const yToIndex = useCallback(
    (yVal: number) => {
      const raw = (containerHeight / 2 - itemHeight / 2 - yVal) / itemHeight
      return Math.round(Math.max(0, Math.min(items.length - 1, raw)))
    },
    [itemHeight, containerHeight, items.length]
  )

  // Sync y when value changes externally
  useEffect(() => {
    const index = items.findIndex((item) => item === value)
    if (index !== -1) {
      animate(y, indexToY(index), { type: 'tween', duration: 0 })
    }
  }, [value, items, y, indexToY])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentY = y.get() + info.offset.y
    const snappedIndex = yToIndex(currentY)
    animate(y, indexToY(snappedIndex), {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      onComplete: () => onChange(items[snappedIndex]),
    })
  }

  function handleDrag(_: unknown, info: PanInfo) {
    const newY = y.get() + info.delta.y
    const minY = indexToY(items.length - 1)
    const maxY = indexToY(0)
    y.set(Math.max(minY - itemHeight, Math.min(maxY + itemHeight, newY)))
  }

  return (
    <div
      ref={containerRef}
      style={{ width, height: containerHeight, position: 'relative', overflow: 'hidden' }}
    >
      {/* Selection highlight band */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          height: itemHeight,
          background: 'var(--color-accent-dim)',
          borderTop: '1px solid var(--color-accent)',
          borderBottom: '1px solid var(--color-accent)',
          borderRadius: 6,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Gradient fade top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: itemHeight * 2,
          background: `linear-gradient(to bottom, var(--color-surface) 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Gradient fade bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: itemHeight * 2,
          background: `linear-gradient(to top, var(--color-surface) 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Draggable list */}
      <motion.div
        drag="y"
        style={{ y, touchAction: 'none', cursor: 'grab' }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragConstraints={{ top: -Infinity, bottom: Infinity }}
        dragElastic={0}
      >
        {items.map((item, index) => {
          const isSelected = item === value
          return (
            <div
              key={index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isSelected ? 17 : 14,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-muted)',
                userSelect: 'none',
                transition: 'color 0.1s, font-size 0.1s',
              }}
            >
              {renderItem(item)}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

// ─── Pre-built item arrays ────────────────────────────────────────────────────

export const ENERGIELEVEL_ITEMS = [1, 2, 3, 4, 5] as const

export const SCHLAFSCORE_ITEMS = Array.from({ length: 101 }, (_, i) => i) // 0–100

export const SCHLAFDAUER_ITEMS = Array.from({ length: 37 }, (_, i) =>
  Math.round((3 + i * 0.25) * 100) / 100
) // 3.00–12.00 in 0.25 steps

export const GEWICHT_ITEMS = Array.from({ length: 651 }, (_, i) =>
  Math.round((55 + i * 0.1) * 10) / 10
) // 55.0–120.0 in 0.1 steps

export const BAUCHUMFANG_ITEMS = Array.from({ length: 121 }, (_, i) =>
  Math.round((60 + i * 0.5) * 10) / 10
) // 60.0–120.0 in 0.5 steps

export const RUHEPULS_ITEMS = Array.from({ length: 81 }, (_, i) => i + 30) // 30–110
