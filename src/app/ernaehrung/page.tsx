'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTodayMealPlan, updateMeal, upsertMealPlan } from '@/lib/hooks/useTodayMealPlan'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useTodayTracking } from '@/lib/hooks/useTodayTracking'
import { computeAdaptiveMeals, computeDailyTotals } from '@/lib/logic/nutrition'
import { computeKcalSoll, computeProteinSoll } from '@/lib/logic/calories'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { todayISO, formatDayName } from '@/lib/utils/dates'
import NutritionSummaryBar from '@/components/ernaehrung/NutritionSummaryBar'
import MealCard from '@/components/ernaehrung/MealCard'
import DeviationSheet from '@/components/ernaehrung/DeviationSheet'
import MealEditor from '@/components/ernaehrung/MealEditor'
import Link from 'next/link'
import { CalendarDays, Plus } from 'lucide-react'
import type { Meal, MealKategorie, MealPlan } from '@/lib/db/types'

const KATEGORIE_OPTIONS: MealKategorie[] = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack']

function createEmptyMeal(kategorie: MealKategorie, index: number): Meal {
  return {
    name: kategorie === 'Snack' ? `Snack ${index}` : kategorie,
    kategorie,
    items: [],
    lebensmittel: '',
    kcal: 0,
    protein_g: 0,
    gegessen: false,
  }
}

export default function ErnaehrungPage() {
  const profile = useUserProfile()
  const mealPlan = useTodayMealPlan()
  const tracking = useTodayTracking()
  const weekPlan = useCurrentWeekPlan()
  const [deviationIndex, setDeviationIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const today = todayISO()
  const dayShort = formatDayName(today)
  const todayPlanDay = weekPlan?.tage.find(t => t.wochentag === dayShort)
  const isTraining = todayPlanDay && ['Push', 'Pull', 'Beine', 'Zone 2', 'HIIT'].includes(todayPlanDay.training_typ)
  const kcalBudget = profile ? computeKcalSoll(todayPlanDay?.training_typ, profile) : 2000
  const proteinBudget = profile ? computeProteinSoll(profile) : 135

  const meals = mealPlan?.mahlzeiten ?? []
  const adaptiveMeals = meals.length > 0
    ? computeAdaptiveMeals(meals, kcalBudget, proteinBudget)
    : []
  const totals = meals.length > 0
    ? computeDailyTotals(meals, kcalBudget, proteinBudget)
    : { kcalConsumed: 0, proteinConsumed: 0, kcalRemaining: kcalBudget, proteinRemaining: proteinBudget, mealsRemaining: 0 }

  async function ensurePlan(): Promise<MealPlan> {
    if (mealPlan && mealPlan.id) return mealPlan
    const plan: MealPlan = {
      id: crypto.randomUUID(),
      datum: today,
      typ: isTraining ? 'Trainingstag' : 'Ruhetag',
      kcal_gesamt: 0,
      protein_gesamt_g: 0,
      mahlzeiten: [],
    }
    await upsertMealPlan(plan)
    return plan
  }

  async function handleAddMeal(kategorie: MealKategorie) {
    const plan = await ensurePlan()
    const snackCount = plan.mahlzeiten.filter(m => m.kategorie === 'Snack').length
    const newMeal = createEmptyMeal(kategorie, snackCount + 1)
    const updated: MealPlan = {
      ...plan,
      mahlzeiten: [...plan.mahlzeiten, newMeal],
    }
    await upsertMealPlan(updated)
    setShowAddMenu(false)
    setEditingIndex(updated.mahlzeiten.length - 1)
  }

  async function handleDeleteMeal(index: number) {
    if (!mealPlan) return
    const updated: MealPlan = {
      ...mealPlan,
      mahlzeiten: mealPlan.mahlzeiten.filter((_, i) => i !== index),
    }
    updated.kcal_gesamt = updated.mahlzeiten.reduce((s, m) => s + m.kcal, 0)
    updated.protein_gesamt_g = updated.mahlzeiten.reduce((s, m) => s + m.protein_g, 0)
    await upsertMealPlan(updated)
  }

  async function handleToggleEaten(index: number) {
    if (!mealPlan) return
    const meal = mealPlan.mahlzeiten[index]
    await updateMeal(today, index, { gegessen: !meal.gegessen })
  }

  async function handleMealSave(index: number, updatedMeal: Meal) {
    if (!mealPlan) return
    const updated = [...mealPlan.mahlzeiten]
    updated[index] = updatedMeal
    const plan: MealPlan = {
      ...mealPlan,
      mahlzeiten: updated,
      kcal_gesamt: updated.reduce((s, m) => s + m.kcal, 0),
      protein_gesamt_g: updated.reduce((s, m) => s + m.protein_g, 0),
    }
    await upsertMealPlan(plan)
    setEditingIndex(null)
  }

  async function handleDeviationConfirm(kcal: number, protein: number, grund: string) {
    if (deviationIndex === null) return
    await updateMeal(today, deviationIndex, {
      kcal_abweichung: kcal,
      protein_g_abweichung: protein,
      abweichung_grund: grund || undefined,
    })
    setDeviationIndex(null)
  }

  async function handleDeviationClear() {
    if (deviationIndex === null) return
    await updateMeal(today, deviationIndex, {
      kcal_abweichung: undefined,
      protein_g_abweichung: undefined,
      abweichung_grund: undefined,
    })
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
          href="/ernaehrung/uebersicht"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <CalendarDays size={14} />
          Übersicht
        </Link>
      </div>

      {/* Summary */}
      <NutritionSummaryBar
        kcalConsumed={totals.kcalConsumed}
        kcalBudget={kcalBudget}
        proteinConsumed={totals.proteinConsumed}
        proteinBudget={proteinBudget}
      />

      {totals.mealsRemaining > 0 && (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Noch{' '}
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totals.kcalRemaining} kcal</span>
          {' '}und{' '}
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{totals.proteinRemaining}g Protein</span>
          {' '}auf {totals.mealsRemaining} Mahlzeiten
        </p>
      )}

      {/* Meal list */}
      <div className="space-y-3">
        {adaptiveMeals.map((meal, i) => (
          <MealCard
            key={i}
            meal={meal}
            index={i}
            onToggleEaten={handleToggleEaten}
            onOpenDeviation={setDeviationIndex}
            onEdit={() => setEditingIndex(i)}
            onDelete={() => handleDeleteMeal(i)}
          />
        ))}
      </div>

      {/* Add meal */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ border: '2px dashed var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
        >
          <Plus size={16} />
          Mahlzeit hinzufügen
        </button>
        {showAddMenu && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-10 shadow-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {KATEGORIE_OPTIONS.map(k => (
              <button
                key={k}
                onClick={() => handleAddMeal(k)}
                className="w-full text-left px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Meal editor */}
      <AnimatePresence>
        {editingIndex !== null && mealPlan && (
          <MealEditor
            meal={mealPlan.mahlzeiten[editingIndex]}
            onSave={(meal) => handleMealSave(editingIndex, meal)}
            onClose={() => setEditingIndex(null)}
          />
        )}
      </AnimatePresence>

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
