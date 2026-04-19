import { supabase } from './client'
import { db } from '../db/database'
import type {
  UserProfile, DailyTracking, TrainingSession,
  ExerciseLog, WeekPlan, MealPlan,
} from '../db/types'
import type { FoodItem } from '../constants/foods'

// ─── Field mapping: camelCase (IndexedDB) ↔ snake_case (Supabase) ───────────

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      .replace('session_id', 'session_id') // already correct
    // Special mappings
    const mappedKey = key === 'sessionId' ? 'session_id'
      : key === 'alter' ? 'alter_jahre'
      : snakeKey
    result[mappedKey] = value
  }
  return result
}

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key === 'session_id' ? 'sessionId'
      : key === 'alter_jahre' ? 'alter'
      : key === 'updated_at' ? 'updatedAt'
      : key === 'created_at' ? 'createdAt'
      : key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = value
  }
  return result
}

// ─── Pull: Supabase → IndexedDB ─────────────────────────────────────────────

export async function pullFromSupabase(): Promise<{ pulled: number; errors: string[] }> {
  if (!supabase) return { pulled: 0, errors: ['Supabase nicht konfiguriert'] }

  let pulled = 0
  const errors: string[] = []

  try {
    // User Profile
    const { data: profiles } = await supabase.from('user_profile').select('*')
    if (profiles?.length) {
      for (const row of profiles) {
        const local = snakeToCamel(row) as unknown as UserProfile
        await db.userProfile.put(local)
        pulled++
      }
    }

    // Daily Tracking
    const { data: tracking } = await supabase.from('daily_tracking').select('*')
    if (tracking?.length) {
      for (const row of tracking) {
        const local = snakeToCamel(row) as unknown as DailyTracking
        local.datum = String(local.datum) // ensure string
        await db.dailyTracking.put(local)
        pulled++
      }
    }

    // Training Sessions
    const { data: sessions } = await supabase.from('training_sessions').select('*')
    if (sessions?.length) {
      for (const row of sessions) {
        const local = snakeToCamel(row) as unknown as TrainingSession
        local.datum = String(local.datum)
        await db.trainingSessions.put(local)
        pulled++
      }
    }

    // Exercise Logs
    const { data: logs } = await supabase.from('exercise_logs').select('*')
    if (logs?.length) {
      for (const row of logs) {
        const local = snakeToCamel(row) as unknown as ExerciseLog
        await db.exerciseLogs.put(local)
        pulled++
      }
    }

    // Week Plans
    const { data: weekPlans } = await supabase.from('week_plans').select('*')
    if (weekPlans?.length) {
      for (const row of weekPlans) {
        const local = snakeToCamel(row) as unknown as WeekPlan
        local.tage = typeof local.tage === 'string' ? JSON.parse(local.tage as string) : local.tage
        await db.weekPlans.put(local)
        pulled++
      }
    }

    // Meal Plans
    const { data: mealPlans } = await supabase.from('meal_plans').select('*')
    if (mealPlans?.length) {
      for (const row of mealPlans) {
        const local = snakeToCamel(row) as unknown as MealPlan
        local.datum = String(local.datum)
        local.mahlzeiten = typeof local.mahlzeiten === 'string' ? JSON.parse(local.mahlzeiten as string) : local.mahlzeiten
        await db.mealPlans.put(local)
        pulled++
      }
    }

    // Custom Foods
    const { data: foods } = await supabase.from('custom_foods').select('*')
    if (foods?.length) {
      for (const row of foods) {
        const local = snakeToCamel(row) as unknown as FoodItem
        await db.customFoods.put(local)
        pulled++
      }
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
  }

  return { pulled, errors }
}

// ─── Push: IndexedDB → Supabase ─────────────────────────────────────────────

export async function pushToSupabase(): Promise<{ pushed: number; errors: string[] }> {
  if (!supabase) return { pushed: 0, errors: ['Supabase nicht konfiguriert'] }

  let pushed = 0
  const errors: string[] = []

  try {
    // User Profile
    const profiles = await db.userProfile.toArray()
    for (const p of profiles) {
      const row = camelToSnake(p as unknown as Record<string, unknown>)
      const { error } = await supabase.from('user_profile').upsert(row)
      if (error) errors.push(`user_profile: ${error.message}`)
      else pushed++
    }

    // Daily Tracking
    const tracking = await db.dailyTracking.toArray()
    if (tracking.length) {
      const rows = tracking.map(t => camelToSnake(t as unknown as Record<string, unknown>))
      const { error } = await supabase.from('daily_tracking').upsert(rows)
      if (error) errors.push(`daily_tracking: ${error.message}`)
      else pushed += tracking.length
    }

    // Training Sessions
    const sessions = await db.trainingSessions.toArray()
    if (sessions.length) {
      const rows = sessions.map(s => camelToSnake(s as unknown as Record<string, unknown>))
      const { error } = await supabase.from('training_sessions').upsert(rows)
      if (error) errors.push(`training_sessions: ${error.message}`)
      else pushed += sessions.length
    }

    // Exercise Logs
    const exerciseLogs = await db.exerciseLogs.toArray()
    if (exerciseLogs.length) {
      const rows = exerciseLogs.map(l => camelToSnake(l as unknown as Record<string, unknown>))
      const { error } = await supabase.from('exercise_logs').upsert(rows)
      if (error) errors.push(`exercise_logs: ${error.message}`)
      else pushed += exerciseLogs.length
    }

    // Week Plans
    const weekPlans = await db.weekPlans.toArray()
    if (weekPlans.length) {
      const rows = weekPlans.map(w => {
        const row = camelToSnake(w as unknown as Record<string, unknown>)
        row.tage = JSON.stringify(w.tage) // JSONB needs string
        return row
      })
      const { error } = await supabase.from('week_plans').upsert(rows)
      if (error) errors.push(`week_plans: ${error.message}`)
      else pushed += weekPlans.length
    }

    // Meal Plans
    const mealPlans = await db.mealPlans.toArray()
    if (mealPlans.length) {
      const rows = mealPlans.map(m => {
        const row = camelToSnake(m as unknown as Record<string, unknown>)
        row.mahlzeiten = JSON.stringify(m.mahlzeiten) // JSONB needs string
        return row
      })
      const { error } = await supabase.from('meal_plans').upsert(rows)
      if (error) errors.push(`meal_plans: ${error.message}`)
      else pushed += mealPlans.length
    }

    // Custom Foods
    const customFoods = await db.customFoods.toArray()
    if (customFoods.length) {
      const rows = customFoods.map(f => camelToSnake(f as unknown as Record<string, unknown>))
      const { error } = await supabase.from('custom_foods').upsert(rows)
      if (error) errors.push(`custom_foods: ${error.message}`)
      else pushed += customFoods.length
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
  }

  return { pushed, errors }
}

// ─── Full Sync: Push local → Pull remote ────────────────────────────────────

export async function fullSync(): Promise<{ pushed: number; pulled: number; errors: string[] }> {
  // Push first (local changes → cloud), then pull (cloud → local)
  const pushResult = await pushToSupabase()
  const pullResult = await pullFromSupabase()
  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    errors: [...pushResult.errors, ...pullResult.errors],
  }
}
