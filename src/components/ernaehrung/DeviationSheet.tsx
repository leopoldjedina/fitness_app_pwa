'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DrumPicker from '@/components/ui/DrumPicker'
import type { Meal } from '@/lib/db/types'
import { X } from 'lucide-react'

const KCAL_ITEMS = Array.from({ length: 40 }, (_, i) => (i + 1) * 50) // 50–2000 in 50 steps
const PROTEIN_ITEMS = Array.from({ length: 41 }, (_, i) => i * 5)      // 0–200 in 5g steps

interface DeviationSheetProps {
  meal: Meal
  onConfirm: (kcal: number, protein: number, grund: string) => void
  onClear: () => void
  onClose: () => void
}

export default function DeviationSheet({ meal, onConfirm, onClear, onClose }: DeviationSheetProps) {
  const [kcal, setKcal] = useState(meal.kcal_abweichung ?? meal.kcal)
  const [protein, setProtein] = useState(meal.protein_g_abweichung ?? meal.protein_g)
  const [grund, setGrund] = useState(meal.abweichung_grund ?? '')

  function findNearest(items: number[], target: number) {
    return items.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full rounded-t-2xl p-6 space-y-5"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Abweichung: {meal.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Geplant: {meal.kcal} kcal · {meal.protein_g}g Protein
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Pickers */}
        <div className="flex justify-around">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Kalorien
            </p>
            <DrumPicker
              items={KCAL_ITEMS}
              value={findNearest(KCAL_ITEMS, kcal)}
              onChange={setKcal}
              itemHeight={44}
              width={100}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kcal</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Protein
            </p>
            <DrumPicker
              items={PROTEIN_ITEMS}
              value={findNearest(PROTEIN_ITEMS, protein)}
              onChange={setProtein}
              itemHeight={44}
              width={100}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>g</p>
          </div>
        </div>

        {/* Reason */}
        <input
          type="text"
          placeholder="Grund (optional, z.B. Restaurant)"
          value={grund}
          onChange={e => setGrund(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />

        {/* Actions */}
        <div className="flex gap-3">
          {meal.kcal_abweichung !== undefined && (
            <button
              onClick={onClear}
              className="px-4 py-3 rounded-xl text-sm font-semibold glass"
              style={{ color: 'var(--color-danger)' }}
            >
              Löschen
            </button>
          )}
          <button
            onClick={() => onConfirm(kcal, protein, grund)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Speichern
          </button>
        </div>
      </motion.div>
    </div>
  )
}
