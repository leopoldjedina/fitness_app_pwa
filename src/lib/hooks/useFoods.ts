'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { FOOD_REFERENCE, type FoodItem } from '../constants/foods'

/** All foods: built-in (overridden by custom if same ID) + user-created */
export function useAllFoods(): FoodItem[] {
  const custom = useLiveQuery(() => db.customFoods.toArray(), [])
  const customMap = new Map((custom ?? []).map(f => [f.id, f]))
  // Built-in foods, replaced by custom override if same ID exists
  const merged = FOOD_REFERENCE.map(f => customMap.get(f.id) ?? f)
  // Add purely custom foods (IDs not in built-in)
  const builtInIds = new Set(FOOD_REFERENCE.map(f => f.id))
  const pureCustom = (custom ?? []).filter(f => !builtInIds.has(f.id))
  return [...merged, ...pureCustom]
}

export function useSearchFoods(query: string): FoodItem[] {
  const all = useAllFoods()
  if (!query) return all.slice(0, 15)
  const lower = query.toLowerCase()
  return all.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.keywords.some(k => k.includes(lower))
  )
}

export async function addCustomFood(food: FoodItem): Promise<void> {
  await db.customFoods.add(food)
}

export async function deleteCustomFood(id: string): Promise<void> {
  await db.customFoods.delete(id)
}

export async function updateCustomFood(id: string, updates: Partial<FoodItem>): Promise<void> {
  await db.customFoods.update(id, updates)
}
