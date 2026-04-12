'use client'

import { useEffect } from 'react'
import { db } from '@/lib/db/database'
import { createDefaultUserProfile, createDefaultWeekPlan } from '@/lib/constants/defaultData'
import { getKW, getKWYear } from '@/lib/utils/dates'

export default function DBInitializer() {
  useEffect(() => {
    async function init() {
      // Seed UserProfile if not exists
      const profile = await db.userProfile.get('singleton')
      if (!profile) {
        await db.userProfile.add(createDefaultUserProfile())
      }

      // Seed current WeekPlan if not exists
      const now = new Date()
      const kw = getKW(now)
      const jahr = getKWYear(now)
      const existing = await db.weekPlans.where('[jahr+kw]').equals([jahr, kw]).first()
      if (!existing) {
        await db.weekPlans.add(createDefaultWeekPlan(now))
      }
    }
    init()
  }, [])

  return null
}
