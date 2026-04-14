'use client'

interface NutritionSummaryBarProps {
  kcalConsumed: number
  kcalBudget: number
  proteinConsumed: number
  proteinBudget: number
}

export default function NutritionSummaryBar({
  kcalConsumed,
  kcalBudget,
  proteinConsumed,
  proteinBudget,
}: NutritionSummaryBarProps) {
  const kcalPct = Math.min(100, (kcalConsumed / kcalBudget) * 100)
  const proteinPct = Math.min(100, (proteinConsumed / proteinBudget) * 100)
  const kcalOver = kcalConsumed > kcalBudget
  const proteinOver = proteinConsumed > proteinBudget

  return (
    <div className="rounded-xl p-4 glass space-y-3">
      {/* Kalorien */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Kalorien
          </span>
          <span className="text-xs" style={{ color: kcalOver ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            <span className="text-sm font-bold" style={{ color: kcalOver ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {kcalConsumed}
            </span>
            {' / '}{kcalBudget} kcal
            {kcalOver && <span className="ml-1">(+{kcalConsumed - kcalBudget})</span>}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${kcalPct}%`,
              background: kcalOver ? 'var(--color-danger)' : 'var(--color-accent)',
            }}
          />
        </div>
      </div>

      {/* Protein */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Protein
          </span>
          <span className="text-xs" style={{ color: proteinOver ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {proteinConsumed}
            </span>
            {' / '}{proteinBudget} g
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${proteinPct}%`,
              background: 'var(--color-success)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
