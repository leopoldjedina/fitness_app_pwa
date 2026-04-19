'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { FOOD_REFERENCE, type FoodItem } from '../constants/foods'

/** All foods: built-in + user-created */
export function useAllFoods(): FoodItem[] {
  const custom = useLiveQuery(() => db.customFoods.toArray(), [])
  return [...FOOD_REFERENCE, ...(custom ?? [])]
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
