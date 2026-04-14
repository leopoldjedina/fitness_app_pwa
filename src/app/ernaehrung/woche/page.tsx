'use client'

import { useState, useEffect } from 'react'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { useWeekMealPlans, upsertMealPlan } from '@/lib/hooks/useTodayMealPlan'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { computeKcalSoll } from '@/lib/logic/calories'
import { getWeekDates, formatShortDate, formatDayName, todayISO } from '@/lib/utils/dates'
import { FOOD_REFERENCE } from '@/lib/constants/foods'
import type { MealPlan, Meal, TrainingsTyp } from '@/lib/db/types'
import { ChevronDown, ChevronUp, Search, Check } from 'lucide-react'

const DEFAULT_MEAL_NAMES = ['Frühstück', 'Mittagessen', 'Snack', 'Abendessen', 'Abend-Snack']

const DEFAULT_MEALS: Record<'Trainingstag' | 'Ruhetag', Meal[]> = {
  Trainingstag: [
    { name: 'Frühstück', lebensmittel: 'Porridge mit Skyr & Beeren', kcal: 420, protein_g: 28, gegessen: false },
    { name: 'Mittagessen', lebensmittel: 'Hühnchen-Reis mit Gemüse', kcal: 580, protein_g: 42, gegessen: false },
    { name: 'Snack', lebensmittel: 'Magerquark mit Walnüssen', kcal: 200, protein_g: 25, gegessen: false },
    { name: 'Abendessen', lebensmittel: 'Rührei mit Hüttenkäse & Brot', kcal: 450, protein_g: 30, gegessen: false },
    { name: 'Abend-Snack', lebensmittel: 'Skyr mit Beeren', kcal: 150, protein_g: 20, gegessen: false },
  ],
  Ruhetag: [
    { name: 'Frühstück', lebensmittel: 'Rührei mit Brot', kcal: 380, protein_g: 24, gegessen: false },
    { name: 'Mittagessen', lebensmittel: 'Thunfisch-Bowl', kcal: 480, protein_g: 40, gegessen: false },
    { name: 'Snack', lebensmittel: 'Magerquark mit Walnüssen', kcal: 180, protein_g: 22, gegessen: false },
    { name: 'Abendessen', lebensmittel: 'Lachs mit Gemüse', kcal: 420, protein_g: 32, gegessen: false },
    { name: 'Abend-Snack', lebensmittel: 'Skyr', kcal: 120, protein_g: 20, gegessen: false },
  ],
}

function isTrained(typ: TrainingsTyp): boolean {
  return ['Push', 'Pull', 'Beine', 'Zone 2', 'HIIT'].includes(typ)
}

export default function WochenplanPage() {
  const weekPlan = useCurrentWeekPlan()
  const profile = useUserProfile()
  const weekDates = getWeekDates(new Date())
  const existingPlans = useWeekMealPlans(weekDates)
  const today = todayISO()

  // Local editing state: day index → meals array
  const [editing, setEditing] = useState<Record<number, Meal[]>>({})
  const [expanded, setExpanded] = useState<number | null>(
    weekDates.findIndex(d => d === today)
  )
  const [foodSearch, setFoodSearch] = useState<string>('')
  const [activeMealPicker, setActiveMealPicker] = useState<{ day: number; meal: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedDays, setSavedDays] = useState<number[]>([])

  // Init editing state from existing plans or defaults
  useEffect(() => {
    if (!weekPlan || existingPlans === undefined) return
    const init: Record<number, Meal[]> = {}
    weekDates.forEach((date, i) => {
      const existing = existingPlans.find(p => p.datum === date)
      if (existing) {
        init[i] = existing.mahlzeiten.map(m => ({ ...m, gegessen: false }))
      } else {
        const dayTyp = weekPlan.tage[i]
        const typ = dayTyp && isTrained(dayTyp.training_typ) ? 'Trainingstag' : 'Ruhetag'
        init[i] = DEFAULT_MEALS[typ].map(m => ({ ...m }))
      }
    })
    setEditing(init)
  }, [weekPlan?.id, existingPlans?.length])

  async function handleSaveDay(dayIndex: number) {
    if (!weekPlan || !profile) return
    const date = weekDates[dayIndex]
    const dayTyp = weekPlan.tage[dayIndex]
    const typ = dayTyp && isTrained(dayTyp.training_typ) ? 'Trainingstag' : 'Ruhetag'
    const meals = editing[dayIndex] ?? []
    const kcal_gesamt = meals.reduce((s, m) => s + m.kcal, 0)
    const protein_gesamt_g = meals.reduce((s, m) => s + m.protein_g, 0)

    const existing = existingPlans?.find(p => p.datum === date)
    const plan: MealPlan = {
      id: existing?.id ?? crypto.randomUUID(),
      datum: date,
      typ,
      kcal_gesamt,
      protein_gesamt_g,
      mahlzeiten: meals,
    }
    setSaving(true)
    await upsertMealPlan(plan)
    setSaving(false)
    setSavedDays(prev => [...prev, dayIndex])
    setTimeout(() => setSavedDays(prev => prev.filter(d => d !== dayIndex)), 2000)
  }

  async function handleSaveAll() {
    for (let i = 0; i < 7; i++) {
      await handleSaveDay(i)
    }
  }

  function updateMealField(day: number, mealIdx: number, field: keyof Meal, value: unknown) {
    setEditing(prev => {
      const meals = [...(prev[day] ?? [])]
      meals[mealIdx] = { ...meals[mealIdx], [field]: value }
      return { ...prev, [day]: meals }
    })
  }

  const filteredFoods = foodSearch
    ? FOOD_REFERENCE.filter(f =>
        f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
        f.keywords.some(k => k.includes(foodSearch.toLowerCase()))
      )
    : FOOD_REFERENCE.slice(0, 8)

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Wochenplan
        </h1>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#fff', opacity: saving ? 0.6 : 1 }}
        >
          Alle speichern
        </button>
      </div>

      {/* Day accordions */}
      {weekDates.map((date, dayIndex) => {
        const dayTyp = weekPlan?.tage[dayIndex]
        const isToday = date === today
        const isExpanded = expanded === dayIndex
        const meals = editing[dayIndex] ?? []
        const totalKcal = meals.reduce((s, m) => s + m.kcal, 0)
        const totalProtein = meals.reduce((s, m) => s + m.protein_g, 0)
        const isSaved = savedDays.includes(dayIndex)
        const hasExisting = existingPlans?.some(p => p.datum === date)

        return (
          <div key={date} className="rounded-xl overflow-hidden glass"
            style={{ borderColor: isToday ? 'var(--color-accent)' : 'var(--color-border)' }}>

            {/* Day header */}
            <button
              onClick={() => setExpanded(isExpanded ? null : dayIndex)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {formatDayName(date)} {formatShortDate(date)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                        heute
                      </span>
                    )}
                    {hasExisting && !isSaved && (
                      <span className="text-[10px]" style={{ color: 'var(--color-success)' }}>✓ gespeichert</span>
                    )}
                    {isSaved && (
                      <span className="text-[10px]" style={{ color: 'var(--color-success)' }}>✓ gespeichert</span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {dayTyp?.training_typ} · {totalKcal} kcal · {totalProtein}g P
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>

            {/* Expanded meals */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {meals.map((meal, mealIdx) => (
                  <div key={mealIdx} className="space-y-2 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {meal.name}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Was gibt es? (z.B. Porridge mit Skyr)"
                      value={meal.lebensmittel}
                      onChange={e => updateMealField(dayIndex, mealIdx, 'lebensmittel', e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                      style={{
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <div className="flex gap-2 items-center">
                      <NumInput
                        label="kcal"
                        value={meal.kcal}
                        onChange={v => updateMealField(dayIndex, mealIdx, 'kcal', v)}
                      />
                      <NumInput
                        label="g P"
                        value={meal.protein_g}
                        onChange={v => updateMealField(dayIndex, mealIdx, 'protein_g', v)}
                      />
                      <button
                        onClick={() => setActiveMealPicker(
                          activeMealPicker?.day === dayIndex && activeMealPicker?.meal === mealIdx
                            ? null : { day: dayIndex, meal: mealIdx }
                        )}
                        className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg flex-shrink-0"
                        style={{
                          background: 'var(--color-surface-elevated)',
                          color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <Search size={12} />
                        Aus Liste
                      </button>
                    </div>

                    {/* Food picker */}
                    {activeMealPicker?.day === dayIndex && activeMealPicker?.meal === mealIdx && (
                      <div className="rounded-lg overflow-hidden"
                        style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Lebensmittel suchen…"
                            value={foodSearch}
                            onChange={e => setFoodSearch(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: 'var(--color-text-primary)' }}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredFoods.map(food => (
                            <button
                              key={food.name}
                              onClick={() => {
                                updateMealField(dayIndex, mealIdx, 'lebensmittel', `${food.name} (${food.portion})`)
                                updateMealField(dayIndex, mealIdx, 'kcal', food.kcal)
                                updateMealField(dayIndex, mealIdx, 'protein_g', food.protein_g)
                                setActiveMealPicker(null)
                                setFoodSearch('')
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:opacity-80 transition-opacity"
                              style={{ borderBottom: '1px solid var(--color-border)' }}
                            >
                              <div>
                                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                  {food.name}
                                </span>
                                <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                                  {food.portion}
                                </span>
                              </div>
                              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                {food.kcal} kcal · {food.protein_g}g
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => handleSaveDay(dayIndex)}
                  disabled={saving}
                  className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: isSaved ? 'var(--color-success)' : 'var(--color-surface-elevated)', color: isSaved ? '#fff' : 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                >
                  {isSaved ? <><Check size={14} /> Gespeichert</> : 'Tag speichern'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function NumInput({
  label, value, onChange
}: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-16 text-sm text-center rounded-lg px-2 py-1.5 outline-none"
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      />
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}
