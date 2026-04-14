'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { TEMPLATES } from '../constants/exercises'
import type { TrainingSession, ExerciseLog, TrainingsTyp, Standort } from '../db/types'

export function useTrainingSession(datum: string) {
  return useLiveQuery(
    () => db.trainingSessions.where('datum').equals(datum).first(),
    [datum]
  )
}

export function useExerciseLogs(sessionId: string | undefined): ExerciseLog[] | undefined {
  return useLiveQuery(
    async (): Promise<ExerciseLog[]> => {
      if (!sessionId) return []
      return db.exerciseLogs.where('sessionId').equals(sessionId).sortBy('reihenfolge')
    },
    [sessionId]
  )
}

export async function createTrainingSession(
  datum: string,
  trainingstyp: TrainingsTyp,
  standort: Standort
): Promise<TrainingSession> {
  const session: TrainingSession = {
    id: crypto.randomUUID(),
    datum,
    trainingstyp,
    abgeschlossen: false,
  }
  await db.trainingSessions.add(session)

  // Load last session's weights for this type to pre-fill
  const lastSession = await db.trainingSessions
    .where('datum').below(datum)
    .filter(s => s.trainingstyp === trainingstyp)
    .last()

  const lastLogs = lastSession
    ? await db.exerciseLogs.where('sessionId').equals(lastSession.id).toArray()
    : []

  const template = TEMPLATES[trainingstyp] ?? []
  const logs: ExerciseLog[] = template.map(t => {
    const lastLog = lastLogs.find(
      l => l.uebungsname === t.uebungsname && (l.standort === standort || !l.standort)
    )
    return {
      id: crypto.randomUUID(),
      sessionId: session.id,
      standort,
      uebungsname: t.uebungsname,
      reihenfolge: t.reihenfolge,
      gewicht_kg: lastLog?.gewicht_kg ?? t.gewicht_kg,
      sets: t.sets,
      reps_ziel: t.reps_ziel,
      erledigt: false,
    }
  })

  if (logs.length > 0) {
    await db.exerciseLogs.bulkAdd(logs)
  }

  return session
}

export async function updateExerciseLog(
  id: string,
  updates: Partial<ExerciseLog>
): Promise<void> {
  await db.exerciseLogs.update(id, updates)
}

export async function finishTrainingSession(
  sessionId: string,
  feedback?: string
): Promise<void> {
  await db.trainingSessions.update(sessionId, {
    abgeschlossen: true,
    feedback,
  })
  // Mark all logs as done
  const logs = await db.exerciseLogs.where('sessionId').equals(sessionId).toArray()
  await Promise.all(logs.map(l => db.exerciseLogs.update(l.id, { erledigt: true })))
}

export async function getPreviousLog(
  uebungsname: string,
  standort: Standort,
  beforeDatum: string
): Promise<ExerciseLog | undefined> {
  // Find last session before this date that has this exercise
  const prevSessions = await db.trainingSessions
    .where('datum').below(beforeDatum)
    .reverse()
    .limit(20)
    .toArray()

  for (const session of prevSessions) {
    const log = await db.exerciseLogs
      .where('sessionId').equals(session.id)
      .filter(l => l.uebungsname === uebungsname && (!l.standort || l.standort === standort))
      .first()
    if (log) return log
  }
  return undefined
}
