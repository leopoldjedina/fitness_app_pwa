'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { todayISO } from '../utils/dates'
import type { MealPlan, Meal } from '../db/types'

export function useTodayMealPlan(): MealPlan | undefined | null {
  const today = todayISO()
  return useLiveQuery(
    () => db.mealPlans.where('datum').equals(today).first().then(r => r ?? null),
    [today]
  )
}

export function useMealPlanForDate(datum: string): MealPlan | undefined | null {
  return useLiveQuery(
    () => db.mealPlans.where('datum').equals(datum).first().then(r => r ?? null),
    [datum]
  )
}

export function useWeekMealPlans(weekDates: string[]): MealPlan[] | undefined {
  return useLiveQuery(
    () => db.mealPlans.where('datum').anyOf(weekDates).toArray(),
    [weekDates.join(',')]
  )
}

export async function upsertMealPlan(plan: MealPlan): Promise<void> {
  await db.mealPlans.put(plan)
}

export async function updateMeal(
  datum: string,
  mealIndex: number,
  updates: Partial<Meal>
): Promise<void> {
  const plan = await db.mealPlans.where('datum').equals(datum).first()
  if (!plan) return
  const updated = [...plan.mahlzeiten]
  updated[mealIndex] = { ...updated[mealIndex], ...updates }
  await db.mealPlans.update(plan.id, { mahlzeiten: updated })
}
