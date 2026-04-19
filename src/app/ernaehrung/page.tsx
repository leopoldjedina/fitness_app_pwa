'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'
import { todayISO } from '@/lib/utils/dates'
import Link from 'next/link'
import { CalendarDays, Plus, Apple, Pencil, Trash2, Check } from 'lucide-react'
import type { Meal, MealPlan, MealKategorie } from '@/lib/db/types'
import dynamic from 'next/dynamic'

// Lazy-load components that use framer-motion (DrumPicker)
const MealEditor = dynamic(() => import('@/components/ernaehrung/MealEditor'), { ssr: false })
const NutritionSummaryBar = dynamic(() => import('@/components/ernaehrung/NutritionSummaryBar'), { ssr: false })

const KATEGORIE_OPTIONS: MealKategorie[] = ['Frühstück', 'Pre-Training', 'Mittagessen', 'Abendessen', 'Snack']

export default function ErnaehrungPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null | undefined>(undefined)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = todayISO()

  // Manual DB query instead of useLiveQuery (more robust on Safari)
  useEffect(() => {
    async function load() {
      try {
        const plan = await db.mealPlans.where('datum').equals(today).first()
        setMealPlan(plan ?? null)
      } catch (e) {
        setError(`DB-Fehler: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    load()
  }, [today])

  // Re-load after changes
  async function reload() {
    try {
      const plan = await db.mealPlans.where('datum').equals(today).first()
      setMealPlan(plan ?? null)
    } catch (e) {
      setError(`Reload-Fehler: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const meals = mealPlan?.mahlzeiten ?? []
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0)
  const totalProtein = meals.reduce((s, m) => s + m.protein_g, 0)

  async function handleAddMeal(kategorie: MealKategorie) {
    try {
      const plan = mealPlan ?? {
        id: crypto.randomUUID(),
        datum: today,
        typ: 'Trainingstag' as const,
        kcal_gesamt: 0,
        protein_gesamt_g: 0,
        mahlzeiten: [],
      }
      const snackCount = plan.mahlzeiten.filter(m => m.kategorie === 'Snack').length
      const newMeal: Meal = {
        name: kategorie === 'Snack' ? `Snack ${snackCount + 1}` : kategorie,
        kategorie,
        items: [],
        lebensmittel: '',
        kcal: 0,
        protein_g: 0,
        gegessen: false,
      }
      const updated = { ...plan, mahlzeiten: [...plan.mahlzeiten, newMeal] }
      updated.kcal_gesamt = updated.mahlzeiten.reduce((s, m) => s + m.kcal, 0)
      updated.protein_gesamt_g = updated.mahlzeiten.reduce((s, m) => s + m.protein_g, 0)
      await db.mealPlans.put(updated)
      setShowAddMenu(false)
      await reload()
      setEditingIndex(updated.mahlzeiten.length - 1)
    } catch (e) {
      setError(`Add-Fehler: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleDeleteMeal(index: number) {
    if (!mealPlan) return
    const updated = {
      ...mealPlan,
      mahlzeiten: mealPlan.mahlzeiten.filter((_, i) => i !== index),
    }
    updated.kcal_gesamt = updated.mahlzeiten.reduce((s, m) => s + m.kcal, 0)
    updated.protein_gesamt_g = updated.mahlzeiten.reduce((s, m) => s + m.protein_g, 0)
    await db.mealPlans.put(updated)
    await reload()
  }

  async function handleToggleEaten(index: number) {
    if (!mealPlan) return
    const updated = { ...mealPlan, mahlzeiten: [...mealPlan.mahlzeiten] }
    updated.mahlzeiten[index] = { ...updated.mahlzeiten[index], gegessen: !updated.mahlzeiten[index].gegessen }
    await db.mealPlans.put(updated)
    await reload()
  }

  async function handleMealSave(index: number, updatedMeal: Meal) {
    if (!mealPlan) return
    const updated = { ...mealPlan, mahlzeiten: [...mealPlan.mahlzeiten] }
    updated.mahlzeiten[index] = updatedMeal
    updated.kcal_gesamt = updated.mahlzeiten.reduce((s, m) => s + m.kcal, 0)
    updated.protein_gesamt_g = updated.mahlzeiten.reduce((s, m) => s + m.protein_g, 0)
    await db.mealPlans.put(updated)
    setEditingIndex(null)
    await reload()
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Ernährung
        </h1>
        <div className="flex gap-2">
          <Link href="/lebensmittel" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold glass"
            style={{ color: 'var(--color-text-secondary)' }}>
            <Apple size={13} />
          </Link>
          <Link href="/ernaehrung/uebersicht" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass"
            style={{ color: 'var(--color-text-secondary)' }}>
            <CalendarDays size={14} />
            Übersicht
          </Link>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--color-danger-dim)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Summary bar */}
      <NutritionSummaryBar
        kcalConsumed={meals.filter(m => m.gegessen).reduce((s, m) => s + m.kcal, 0)}
        kcalBudget={2200}
        proteinConsumed={meals.filter(m => m.gegessen).reduce((s, m) => s + m.protein_g, 0)}
        proteinBudget={135}
      />

      {/* Plan summary */}
      {meals.length > 0 ? (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Mit dem Essensplan erreichst du{' '}
          <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{totalKcal} kcal</span>
          {' '}und{' '}
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{totalProtein}g Protein</span>
          {' '}mit {meals.length} Mahlzeiten
        </p>
      ) : mealPlan === null ? (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          Kein Essensplan für heute. Füge Mahlzeiten hinzu!
        </p>
      ) : mealPlan === undefined ? (
        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>Lade…</p>
      ) : null}

      {/* Meal list */}
      <div className="space-y-3">
        {meals.map((meal, i) => (
          <SimpleMealCard
            key={i}
            meal={meal}
            onToggle={() => handleToggleEaten(i)}
            onEdit={() => setEditingIndex(i)}
            onDelete={() => handleDeleteMeal(i)}
          />
        ))}
      </div>

      {/* Add meal */}
      <div className="relative">
        {showAddMenu && (
          <div className="absolute left-0 right-0 bottom-full mb-2 rounded-xl overflow-hidden z-20 shadow-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {KATEGORIE_OPTIONS.map(k => (
              <button
                key={k}
                onClick={() => handleAddMeal(k)}
                className="w-full text-left px-4 py-3 text-sm font-medium active:opacity-70"
                style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}
              >
                {k}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold active:scale-95"
          style={{ border: '2px dashed var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
        >
          <Plus size={16} />
          Mahlzeit hinzufügen
        </button>
      </div>

      {/* Meal editor (lazy loaded) */}
      {editingIndex !== null && mealPlan && (
        <MealEditor
          meal={mealPlan.mahlzeiten[editingIndex]}
          onSave={(meal) => handleMealSave(editingIndex, meal)}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  )
}

// ─── Simple inline MealCard (no external dependencies) ──────────────────────

function SimpleMealCard({
  meal, onToggle, onEdit, onDelete
}: {
  meal: Meal; onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="rounded-xl p-4 glass"
      style={{ borderColor: meal.gegessen ? 'rgba(34,197,94,0.3)' : 'var(--color-border)', opacity: meal.gegessen ? 0.7 : 1 }}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background: meal.gegessen ? 'var(--color-success-dim)' : 'var(--color-surface-elevated)',
            border: `2px solid ${meal.gegessen ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
          }}>
          {meal.gegessen && <Check size={14} style={{ color: 'var(--color-success)' }} />}
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{meal.name}</span>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {meal.lebensmittel || 'Noch keine Lebensmittel'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>{meal.kcal} kcal</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>{meal.protein_g}g Protein</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
