'use client'

import type { AdaptiveMeal } from '@/lib/db/types'
import { Check, AlertCircle, ChevronRight, Pencil, Trash2 } from 'lucide-react'

interface MealCardProps {
  meal: AdaptiveMeal
  index: number
  onToggleEaten: (index: number) => void
  onOpenDeviation: (index: number) => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function MealCard({ meal, index, onToggleEaten, onOpenDeviation, onEdit, onDelete }: MealCardProps) {
  const hasDeviation = meal.kcal_abweichung !== undefined

  return (
    <div
      className="rounded-xl p-4 glass"
      style={{
        borderColor: meal.gegessen
          ? 'rgba(34,197,94,0.3)'
          : hasDeviation
          ? 'rgba(249,115,22,0.3)'
          : 'var(--color-border)',
        opacity: meal.gegessen && !hasDeviation ? 0.7 : 1,
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {meal.name}
            </span>
            {hasDeviation && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                abgewichen
              </span>
            )}
            {meal.isAdjusted && !hasDeviation && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--color-warning-dim)', color: 'var(--color-warning)' }}>
                angepasst
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {meal.lebensmittel}
          </p>

          {/* Macros */}
          <div className="flex items-center gap-3 mt-2">
            {hasDeviation ? (
              <>
                <MacroChip
                  value={meal.kcal_abweichung!}
                  original={meal.kcal}
                  unit="kcal"
                  color="var(--color-accent)"
                />
                <MacroChip
                  value={meal.protein_g_abweichung!}
                  original={meal.protein_g}
                  unit="g"
                  color="var(--color-success)"
                />
              </>
            ) : (
              <>
                <MacroChip
                  value={meal.kcal_adjusted}
                  original={meal.kcal}
                  unit="kcal"
                  color="var(--color-accent)"
                  showOriginal={meal.isAdjusted}
                />
                <MacroChip
                  value={meal.protein_g_adjusted}
                  original={meal.protein_g}
                  unit="g"
                  color="var(--color-success)"
                  showOriginal={meal.isAdjusted}
                />
              </>
            )}
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
          {!meal.gegessen && (
            <button
              onClick={() => onOpenDeviation(index)}
              className="p-1.5 rounded-lg transition-all active:scale-90"
              style={{ color: hasDeviation ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            >
              {hasDeviation ? <AlertCircle size={14} /> : <ChevronRight size={14} />}
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

      {/* Deviation reason */}
      {meal.abweichung_grund && (
        <p className="mt-2 text-xs pl-11" style={{ color: 'var(--color-text-muted)' }}>
          {meal.abweichung_grund}
        </p>
      )}
    </div>
  )
}

function MacroChip({
  value, original, unit, color, showOriginal
}: {
  value: number; original: number; unit: string; color: string; showOriginal?: boolean
}) {
  return (
    <span className="text-xs font-medium">
      <span style={{ color }}>{value}</span>
      {showOriginal && <span style={{ color: 'var(--color-text-muted)' }}> ({original})</span>}
      <span style={{ color: 'var(--color-text-muted)' }}> {unit}</span>
    </span>
  )
}
