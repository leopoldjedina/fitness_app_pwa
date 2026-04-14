'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTodayMealPlan, updateMeal } from '@/lib/hooks/useTodayMealPlan'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useTodayTracking } from '@/lib/hooks/useTodayTracking'
import { computeAdaptiveMeals, computeDailyTotals } from '@/lib/logic/nutrition'
import { computeKcalSoll, computeProteinSoll } from '@/lib/logic/calories'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { todayISO, formatDayName } from '@/lib/utils/dates'
import NutritionSummaryBar from '@/components/ernaehrung/NutritionSummaryBar'
import MealCard from '@/components/ernaehrung/MealCard'
import DeviationSheet from '@/components/ernaehrung/DeviationSheet'
import Link from 'next/link'
import { CalendarDays, Plus } from 'lucide-react'
import type { Meal } from '@/lib/db/types'

export default function ErnaehrungPage() {
  const profile = useUserProfile()
  const mealPlan = useTodayMealPlan()
  const tracking = useTodayTracking()
  const weekPlan = useCurrentWeekPlan()
  const [deviationIndex, setDeviationIndex] = useState<number | null>(null)

  const today = todayISO()
  const dayShort = formatDayName(today)
  const todayPlan = weekPlan?.tage.find(t => t.wochentag === dayShort)
  const kcalBudget = profile ? computeKcalSoll(todayPlan?.training_typ, profile) : 2000
  const proteinBudget = profile ? computeProteinSoll(profile) : 135

  const adaptiveMeals = mealPlan
    ? computeAdaptiveMeals(mealPlan.mahlzeiten, kcalBudget, proteinBudget)
    : []

  const totals = mealPlan
    ? computeDailyTotals(mealPlan.mahlzeiten, kcalBudget, proteinBudget)
    : { kcalConsumed: 0, proteinConsumed: 0, kcalRemaining: kcalBudget, proteinRemaining: proteinBudget, mealsRemaining: 0 }

  async function handleToggleEaten(index: number) {
    if (!mealPlan) return
    const meal = mealPlan.mahlzeiten[index]
    await updateMeal(today, index, { gegessen: !meal.gegessen })
  }

  async function handleDeviationConfirm(kcal: number, protein: number, grund: string) {
    if (deviationIndex === null || !mealPlan) return
    await updateMeal(today, deviationIndex, {
      kcal_abweichung: kcal,
      protein_g_abweichung: protein,
      abweichung_grund: grund || undefined,
    })
    setDeviationIndex(null)
  }

  async function handleDeviationClear() {
    if (deviationIndex === null || !mealPlan) return
    const meal = mealPlan.mahlzeiten[deviationIndex]
    const cleared: Partial<Meal> = {
      kcal_abweichung: undefined,
      protein_g_abweichung: undefined,
      abweichung_grund: undefined,
    }
    await updateMeal(today, deviationIndex, cleared)
    setDeviationIndex(null)
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Ernährung
        </h1>
        <Link
          href="/ernaehrung/woche"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <CalendarDays size={14} />
          Wochenplan
        </Link>
      </div>

      {/* Summary bar */}
      <NutritionSummaryBar
        kcalConsumed={totals.kcalConsumed}
        kcalBudget={kcalBudget}
        proteinConsumed={totals.proteinConsumed}
        proteinBudget={proteinBudget}
      />

      {/* Remaining info */}
      {totals.mealsRemaining > 0 && (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Noch{' '}
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {totals.kcalRemaining} kcal
          </span>
          {' '}und{' '}
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
            {totals.proteinRemaining}g Protein
          </span>
          {' '}auf {totals.mealsRemaining} Mahlzeiten verteilt
        </p>
      )}

      {/* Meal list */}
      {mealPlan ? (
        <div className="space-y-3">
          {adaptiveMeals.map((meal, i) => (
            <MealCard
              key={i}
              meal={meal}
              index={i}
              onToggleEaten={handleToggleEaten}
              onOpenDeviation={setDeviationIndex}
            />
          ))}
        </div>
      ) : mealPlan === null ? (
        <div className="rounded-xl p-6 glass text-center space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Kein Essensplan für heute.
          </p>
          <Link
            href="/ernaehrung/woche"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            <Plus size={16} />
            Wochenplan erstellen
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24">
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lade…</div>
        </div>
      )}

      {/* Deviation sheet */}
      <AnimatePresence>
        {deviationIndex !== null && mealPlan && (
          <DeviationSheet
            meal={mealPlan.mahlzeiten[deviationIndex]}
            onConfirm={handleDeviationConfirm}
            onClear={handleDeviationClear}
            onClose={() => setDeviationIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
