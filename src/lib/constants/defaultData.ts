import type { UserProfile, WeekPlan } from '../db/types'
import { getWeekStart, getKW, getKWYear, toISODate } from '../utils/dates'

export function createDefaultUserProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    id: 'singleton',
    name: 'Leopold',
    alter: 45,
    groesse_cm: 180,
    startgewicht_kg: 71.1,
    start_bauchumfang_cm: 84.0,
    ziel_bauchumfang_cm: 78.0,
    ziel_kfa_prozent: 11,
    kcal_trainingstag: 2200,
    kcal_ruhetag: 2000,
    protein_ziel_g: 135,
    vo2max_start: 41.1,
    vo2max_ziel: 45,
    hf_max_bpm: 188,
    standort: 'Berlin',
    createdAt: now,
    updatedAt: now,
  }
}

export function createDefaultWeekPlan(date: Date = new Date()): WeekPlan {
  const monday = getWeekStart(date)
  return {
    id: crypto.randomUUID(),
    kw: getKW(date),
    jahr: getKWYear(date),
    start_datum: toISODate(monday),
    tage: [
      { wochentag: 'Mo', training_typ: 'Zone 2' },
      { wochentag: 'Di', training_typ: 'Pull' },
      { wochentag: 'Mi', training_typ: 'Zone 2' },
      { wochentag: 'Do', training_typ: 'Push' },
      { wochentag: 'Fr', training_typ: 'Zone 2' },
      { wochentag: 'Sa', training_typ: 'Beine' },
      { wochentag: 'So', training_typ: 'Ruhetag' },
    ],
  }
}
