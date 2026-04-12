'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { UserProfile } from '../db/types'

export function useUserProfile(): UserProfile | undefined {
  return useLiveQuery(() => db.userProfile.get('singleton'))
}

export async function updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<void> {
  await db.userProfile.update('singleton', {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}
