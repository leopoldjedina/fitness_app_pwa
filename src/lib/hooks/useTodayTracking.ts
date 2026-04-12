'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { todayISO } from '../utils/dates'
import type { DailyTracking } from '../db/types'

export function useTodayTracking(): DailyTracking | undefined {
  const today = todayISO()
  return useLiveQuery(() => db.dailyTracking.where('datum').equals(today).first(), [today])
}

export async function upsertTodayTracking(updates: Partial<DailyTracking>): Promise<void> {
  const today = todayISO()
  const existing = await db.dailyTracking.where('datum').equals(today).first()
  if (existing) {
    await db.dailyTracking.update(existing.id, updates)
  } else {
    await db.dailyTracking.add({
      id: crypto.randomUUID(),
      datum: today,
      kcal_soll: 2000,
      protein_soll_g: 135,
      ...updates,
    })
  }
}
