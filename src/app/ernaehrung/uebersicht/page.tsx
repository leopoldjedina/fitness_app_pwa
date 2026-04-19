'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/database'
import { todayISO, formatShortDate, formatDayName } from '@/lib/utils/dates'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { MealPlan } from '@/lib/db/types'

export default function UebersichtPage() {
  const profile = useUserProfile()
  const today = todayISO()

  const allPlans = useLiveQuery(
    () => db.mealPlans.orderBy('datum').reverse().toArray(),
    []
  )

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/ernaehrung" className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Übersicht
        </h1>
      </div>

      {allPlans === undefined ? (
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lade…</div>
      ) : allPlans.length === 0 ? (
        <div className="rounded-xl p-6 glass text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Noch keine Essenspläne erstellt.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allPlans.map(plan => {
            const isToday = plan.datum === today
            const isFuture = plan.datum > today
            const mealsEaten = plan.mahlzeiten.filter(m => m.gegessen).length
            const totalMeals = plan.mahlzeiten.length
            const allEaten = totalMeals > 0 && mealsEaten === totalMeals

            return (
              <DayRow
                key={plan.id}
                plan={plan}
                isToday={isToday}
                isFuture={isFuture}
                mealsEaten={mealsEaten}
                totalMeals={totalMeals}
                allEaten={allEaten}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function DayRow({
  plan, isToday, isFuture, mealsEaten, totalMeals, allEaten
}: {
  plan: MealPlan; isToday: boolean; isFuture: boolean;
  mealsEaten: number; totalMeals: number; allEaten: boolean
}) {
  const hasDeviations = plan.mahlzeiten.some(m => m.kcal_abweichung !== undefined)
  const actualKcal = plan.mahlzeiten.reduce((s, m) =>
    s + (m.gegessen ? (m.kcal_abweichung ?? m.kcal) : 0), 0)

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3 transition-all"
      style={{
        background: isToday ? 'var(--color-surface-elevated)' : 'transparent',
        border: `1px solid ${isToday ? 'var(--color-accent)' : 'var(--color-border)'}`,
        opacity: !isToday && !isFuture ? 0.8 : 1,
      }}
    >
      <div className="w-12 text-center flex-shrink-0">
        <div className="text-xs font-bold" style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
          {formatDayName(plan.datum)}
        </div>
        <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {formatShortDate(plan.datum)}
        </div>
      </div>

      <div className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ background: plan.typ === 'Trainingstag' ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {plan.kcal_gesamt} kcal · {plan.protein_gesamt_g}g P
          </span>
          {isToday && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              heute
            </span>
          )}
          {hasDeviations && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--color-warning-dim)', color: 'var(--color-warning)' }}>
              abgewichen
            </span>
          )}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {plan.typ} · {mealsEaten}/{totalMeals} gegessen
          {mealsEaten > 0 && ` · ${actualKcal} kcal IST`}
        </div>
      </div>

      {allEaten && (
        <span className="text-xs" style={{ color: 'var(--color-success)' }}>✓</span>
      )}
    </div>
  )
}
