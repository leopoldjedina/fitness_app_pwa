'use client'

import type { AdaptiveMeal } from '@/lib/db/types'
import { Check, Pencil, Trash2 } from 'lucide-react'

interface MealCardProps {
  meal: AdaptiveMeal
  index: number
  onToggleEaten: (index: number) => void
  onOpenDeviation: (index: number) => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function MealCard({ meal, index, onToggleEaten, onOpenDeviation, onEdit, onDelete }: MealCardProps) {
  return (
    <div
      className="rounded-xl p-4 glass"
      style={{
        borderColor: meal.gegessen ? 'rgba(34,197,94,0.3)' : 'var(--color-border)',
        opacity: meal.gegessen ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Eaten toggle */}
        <button
          onClick={() => onToggleEaten(index)}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 mt-0.5"
          style={{
            background: meal.gegessen ? 'var(--color-success-dim)' : 'var(--color-surface-elevated)',
            border: `2px solid ${meal.gegessen ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
          }}
        >
          {meal.gegessen && <Check size={14} style={{ color: 'var(--color-success)' }} />}
        </button>

        {/* Meal info */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {meal.name}
          </span>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {meal.lebensmittel || 'Noch keine Lebensmittel'}
          </p>

          {/* Macros – simple: just kcal (orange) + protein (green) */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
              {meal.kcal} kcal
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
              {meal.protein_g}g Protein
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg transition-all active:scale-90"
              style={{ color: 'var(--color-text-muted)' }}>
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg transition-all active:scale-90"
              style={{ color: 'var(--color-text-muted)' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
