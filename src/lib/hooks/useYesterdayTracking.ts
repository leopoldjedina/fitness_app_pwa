'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { subDays, format } from 'date-fns'
import { db } from '../db/database'
import type { DailyTracking } from '../db/types'

export function useYesterdayTracking(): DailyTracking | undefined {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  return useLiveQuery(
    () => db.dailyTracking.where('datum').equals(yesterday).first(),
    [yesterday]
  )
}
