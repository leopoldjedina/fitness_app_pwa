'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { getKW, getKWYear } from '../utils/dates'
import type { WeekPlan } from '../db/types'

export function useCurrentWeekPlan(): WeekPlan | undefined {
  const now = new Date()
  const kw = getKW(now)
  const jahr = getKWYear(now)
  return useLiveQuery(
    async () => {
      // Try compound index first, fallback to filter
      try {
        const result = await db.weekPlans.where('[jahr+kw]').equals([jahr, kw]).first()
        if (result) return result
      } catch {
        // compound index may not exist
      }
      // Fallback: scan all and filter
      return db.weekPlans.filter(p => p.kw === kw && p.jahr === jahr).first()
    },
    [kw, jahr]
  )
}

export async function upsertWeekPlan(plan: WeekPlan): Promise<void> {
  await db.weekPlans.put(plan)
}
