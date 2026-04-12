import type { ExerciseLog, UebungsName } from '../db/types'
import { COMPOUND_EXERCISES, MACHINE_INCREMENTS } from '../constants/exercises'

export type OverloadHint = 'erhoehen' | 'halten' | 'reduzieren' | 'noch_offen'

export function parseRepsIst(repsIst: string): number[] {
  // "10/10/8" → [10, 10, 8]
  return repsIst.split('/').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

export function parseRepsZiel(repsZiel: string): { min: number; max: number } {
  // "3×10" → { min: 10, max: 10 }
  // "3×8–10" → { min: 8, max: 10 }
  const match = repsZiel.match(/(\d+)[–\-]?(\d+)?/)
  if (!match) return { min: 10, max: 10 }
  const min = parseInt(match[1], 10)
  const max = match[2] ? parseInt(match[2], 10) : min
  return { min, max }
}

export function evaluateOverload(log: ExerciseLog): OverloadHint {
  if (!log.reps_ist || !log.erledigt) return 'noch_offen'

  const reps = parseRepsIst(log.reps_ist)
  if (reps.length === 0) return 'noch_offen'

  const { max } = parseRepsZiel(log.reps_ziel)

  // Check if all sets met the target
  const allMet = reps.every(r => r >= max)
  if (allMet) return 'erhoehen'

  // Check significant drop (last set < 70% of first)
  if (reps.length >= 2 && reps[reps.length - 1] < reps[0] * 0.7) {
    return 'reduzieren'
  }

  return 'halten'
}

export function getNextWeight(
  currentWeight: string,
  uebungsname: UebungsName,
  isCompound: boolean
): string {
  const current = parseFloat(currentWeight)
  if (isNaN(current)) return currentWeight

  const increments = MACHINE_INCREMENTS[uebungsname]
  if (increments) {
    const nextIdx = increments.findIndex(w => w > current)
    if (nextIdx !== -1) {
      const next = increments[nextIdx]
      const diff = (next - current).toFixed(1)
      return `${next} (+${diff} kg)`
    }
    return currentWeight + ' (Maximum)'
  }

  // Free weights
  const step = COMPOUND_EXERCISES.includes(uebungsname) ? 2.5 : 1.25
  return String(current + step)
}

export function getOverloadHintText(
  hint: OverloadHint,
  log: ExerciseLog
): string | null {
  if (hint === 'erhoehen') {
    const nextWeight = getNextWeight(log.gewicht_kg, log.uebungsname, COMPOUND_EXERCISES.includes(log.uebungsname))
    return `Ziel erreicht → nächstes Mal: ${nextWeight} kg`
  }
  if (hint === 'reduzieren') {
    return 'Gewicht war zu hoch → nächstes Mal reduzieren'
  }
  return null
}
