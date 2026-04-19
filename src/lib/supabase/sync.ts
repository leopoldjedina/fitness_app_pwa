import { supabase } from './client'
import { db } from '../db/database'
import type {
  UserProfile, DailyTracking, TrainingSession,
  ExerciseLog, WeekPlan, MealPlan,
} from '../db/types'
import type { FoodItem } from '../constants/foods'

// ─── Explicit field mappers (no generic camel↔snake, too error-prone) ───────

function profileToRow(p: UserProfile) {
  return {
    id: p.id,
    name: p.name,
    alter_jahre: p.alter,
    groesse_cm: p.groesse_cm,
    startgewicht_kg: p.startgewicht_kg,
    start_bauchumfang_cm: p.start_bauchumfang_cm,
    ziel_bauchumfang_cm: p.ziel_bauchumfang_cm,
    ziel_kfa_prozent: p.ziel_kfa_prozent,
    kcal_trainingstag: p.kcal_trainingstag,
    kcal_ruhetag: p.kcal_ruhetag,
    protein_ziel_g: p.protein_ziel_g,
    vo2max_start: p.vo2max_start,
    vo2max_ziel: p.vo2max_ziel,
    hf_max_bpm: p.hf_max_bpm,
    standort: p.standort,
  }
}

function rowToProfile(r: Record<string, unknown>): UserProfile {
  return {
    id: String(r.id),
    name: String(r.name),
    alter: Number(r.alter_jahre),
    groesse_cm: Number(r.groesse_cm),
    startgewicht_kg: Number(r.startgewicht_kg),
    start_bauchumfang_cm: Number(r.start_bauchumfang_cm),
    ziel_bauchumfang_cm: Number(r.ziel_bauchumfang_cm),
    ziel_kfa_prozent: Number(r.ziel_kfa_prozent),
    kcal_trainingstag: Number(r.kcal_trainingstag),
    kcal_ruhetag: Number(r.kcal_ruhetag),
    protein_ziel_g: Number(r.protein_ziel_g),
    vo2max_start: Number(r.vo2max_start),
    vo2max_ziel: Number(r.vo2max_ziel),
    hf_max_bpm: Number(r.hf_max_bpm),
    standort: String(r.standort) as UserProfile['standort'],
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }
}

function trackingToRow(t: DailyTracking) {
  return {
    id: t.id,
    datum: t.datum,
    gewicht_kg: t.gewicht_kg ?? null,
    bauchumfang_cm: t.bauchumfang_cm ?? null,
    schlaf_h: t.schlaf_h ?? null,
    schlafindex: t.schlafindex ?? null,
    ruhepuls_bpm: t.ruhepuls_bpm ?? null,
    vo2max: t.vo2max ?? null,
    energielevel: t.energielevel ?? null,
    training_typ: t.training_typ ?? null,
    kcal_soll: t.kcal_soll,
    kcal_ist: t.kcal_ist ?? null,
    protein_soll_g: t.protein_soll_g,
    protein_ist_g: t.protein_ist_g ?? null,
    durchschnitts_hf_zone2_bpm: t.durchschnitts_hf_zone2_bpm ?? null,
    notizen: t.notizen ?? null,
  }
}

function rowToTracking(r: Record<string, unknown>): DailyTracking {
  return {
    id: String(r.id),
    datum: String(r.datum),
    gewicht_kg: r.gewicht_kg != null ? Number(r.gewicht_kg) : undefined,
    bauchumfang_cm: r.bauchumfang_cm != null ? Number(r.bauchumfang_cm) : undefined,
    schlaf_h: r.schlaf_h != null ? Number(r.schlaf_h) : undefined,
    schlafindex: r.schlafindex != null ? Number(r.schlafindex) : undefined,
    ruhepuls_bpm: r.ruhepuls_bpm != null ? Number(r.ruhepuls_bpm) : undefined,
    vo2max: r.vo2max != null ? Number(r.vo2max) : undefined,
    energielevel: r.energielevel != null ? Number(r.energielevel) as DailyTracking['energielevel'] : undefined,
    training_typ: r.training_typ != null ? String(r.training_typ) as DailyTracking['training_typ'] : undefined,
    kcal_soll: Number(r.kcal_soll),
    kcal_ist: r.kcal_ist != null ? Number(r.kcal_ist) : undefined,
    protein_soll_g: Number(r.protein_soll_g),
    protein_ist_g: r.protein_ist_g != null ? Number(r.protein_ist_g) : undefined,
    durchschnitts_hf_zone2_bpm: r.durchschnitts_hf_zone2_bpm != null ? Number(r.durchschnitts_hf_zone2_bpm) : undefined,
    notizen: r.notizen != null ? String(r.notizen) : undefined,
  }
}

function sessionToRow(s: TrainingSession) {
  return {
    id: s.id,
    datum: s.datum,
    trainingstyp: s.trainingstyp,
    dauer_min: s.dauer_min ?? null,
    durchschnitts_hf_bpm: s.durchschnitts_hf_bpm ?? null,
    feedback: s.feedback ?? null,
    abgeschlossen: s.abgeschlossen,
  }
}

function rowToSession(r: Record<string, unknown>): TrainingSession {
  return {
    id: String(r.id),
    datum: String(r.datum),
    trainingstyp: String(r.trainingstyp) as TrainingSession['trainingstyp'],
    dauer_min: r.dauer_min != null ? Number(r.dauer_min) : undefined,
    durchschnitts_hf_bpm: r.durchschnitts_hf_bpm != null ? Number(r.durchschnitts_hf_bpm) : undefined,
    feedback: r.feedback != null ? String(r.feedback) : undefined,
    abgeschlossen: Boolean(r.abgeschlossen),
  }
}

function logToRow(l: ExerciseLog) {
  return {
    id: l.id,
    session_id: l.sessionId,
    standort: l.standort ?? null,
    uebungsname: l.uebungsname,
    reihenfolge: l.reihenfolge,
    gewicht_kg: l.gewicht_kg,
    sets: l.sets,
    reps_ziel: l.reps_ziel,
    reps_ist: l.reps_ist ?? null,
    erledigt: l.erledigt,
    notizen: l.notizen ?? null,
  }
}

function rowToLog(r: Record<string, unknown>): ExerciseLog {
  return {
    id: String(r.id),
    sessionId: String(r.session_id),
    standort: r.standort != null ? String(r.standort) as ExerciseLog['standort'] : undefined,
    uebungsname: String(r.uebungsname) as ExerciseLog['uebungsname'],
    reihenfolge: Number(r.reihenfolge),
    gewicht_kg: String(r.gewicht_kg),
    sets: Number(r.sets),
    reps_ziel: String(r.reps_ziel),
    reps_ist: r.reps_ist != null ? String(r.reps_ist) : undefined,
    erledigt: Boolean(r.erledigt),
    notizen: r.notizen != null ? String(r.notizen) : undefined,
  }
}

function weekPlanToRow(w: WeekPlan) {
  return {
    id: w.id,
    kw: w.kw,
    jahr: w.jahr,
    start_datum: w.start_datum,
    tage: w.tage, // Supabase JS handles JSONB natively
  }
}

function rowToWeekPlan(r: Record<string, unknown>): WeekPlan {
  return {
    id: String(r.id),
    kw: Number(r.kw),
    jahr: Number(r.jahr),
    start_datum: String(r.start_datum),
    tage: r.tage as WeekPlan['tage'],
  }
}

function mealPlanToRow(m: MealPlan) {
  return {
    id: m.id,
    datum: m.datum,
    typ: m.typ,
    kcal_gesamt: m.kcal_gesamt,
    protein_gesamt_g: m.protein_gesamt_g,
    mahlzeiten: m.mahlzeiten, // Supabase JS handles JSONB natively
  }
}

function rowToMealPlan(r: Record<string, unknown>): MealPlan {
  return {
    id: String(r.id),
    datum: String(r.datum),
    typ: String(r.typ) as MealPlan['typ'],
    kcal_gesamt: Number(r.kcal_gesamt),
    protein_gesamt_g: Number(r.protein_gesamt_g),
    mahlzeiten: r.mahlzeiten as MealPlan['mahlzeiten'],
  }
}

function foodToRow(f: FoodItem) {
  return {
    id: f.id,
    name: f.name,
    portion_menge: f.portion_menge,
    portion_einheit: f.portion_einheit,
    kcal: f.kcal,
    protein_g: f.protein_g,
    kategorie: f.kategorie,
    keywords: f.keywords,
  }
}

function rowToFood(r: Record<string, unknown>): FoodItem {
  return {
    id: String(r.id),
    name: String(r.name),
    portion_menge: Number(r.portion_menge),
    portion_einheit: String(r.portion_einheit) as FoodItem['portion_einheit'],
    kcal: Number(r.kcal),
    protein_g: Number(r.protein_g),
    kategorie: String(r.kategorie) as FoodItem['kategorie'],
    keywords: (r.keywords as string[]) ?? [],
  }
}

// ─── Pull: Supabase → IndexedDB ─────────────────────────────────────────────

export async function pullFromSupabase(): Promise<{ pulled: number; errors: string[] }> {
  if (!supabase) return { pulled: 0, errors: ['Supabase nicht konfiguriert'] }

  let pulled = 0
  const errors: string[] = []

  async function pullTable<T>(
    table: string,
    mapper: (r: Record<string, unknown>) => T,
    store: { put: (item: T) => Promise<unknown> }
  ) {
    const { data, error } = await supabase!.from(table).select('*')
    if (error) { errors.push(`${table}: ${error.message}`); return }
    if (data) {
      for (const row of data) {
        await store.put(mapper(row as Record<string, unknown>))
        pulled++
      }
    }
  }

  try {
    await pullTable('user_profile', rowToProfile, db.userProfile)
    await pullTable('daily_tracking', rowToTracking, db.dailyTracking)
    await pullTable('training_sessions', rowToSession, db.trainingSessions)
    await pullTable('exercise_logs', rowToLog, db.exerciseLogs)
    await pullTable('week_plans', rowToWeekPlan, db.weekPlans)
    await pullTable('meal_plans', rowToMealPlan, db.mealPlans)
    await pullTable('custom_foods', rowToFood, db.customFoods)
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

  async function pushTable<T>(
    table: string,
    items: T[],
    mapper: (item: T) => Record<string, unknown>
  ) {
    if (items.length === 0) return
    const rows = items.map(mapper)
    // Batch upsert in chunks of 50
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50)
      const { error } = await supabase!.from(table).upsert(chunk)
      if (error) { errors.push(`${table}: ${error.message}`); return }
      pushed += chunk.length
    }
  }

  try {
    await pushTable('user_profile', await db.userProfile.toArray(), profileToRow)
    await pushTable('daily_tracking', await db.dailyTracking.toArray(), trackingToRow)
    await pushTable('training_sessions', await db.trainingSessions.toArray(), sessionToRow)
    await pushTable('exercise_logs', await db.exerciseLogs.toArray(), logToRow)
    await pushTable('week_plans', await db.weekPlans.toArray(), weekPlanToRow)
    await pushTable('meal_plans', await db.mealPlans.toArray(), mealPlanToRow)
    await pushTable('custom_foods', await db.customFoods.toArray(), foodToRow)
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
  }

  return { pushed, errors }
}

// ─── Full Sync ──────────────────────────────────────────────────────────────

export async function fullSync(): Promise<{ pushed: number; pulled: number; errors: string[] }> {
  const pushResult = await pushToSupabase()
  const pullResult = await pullFromSupabase()
  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    errors: [...pushResult.errors, ...pullResult.errors],
  }
}
