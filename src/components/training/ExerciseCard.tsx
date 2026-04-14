'use client'

import { useState, useEffect } from 'react'
import DrumPicker from '@/components/ui/DrumPicker'
import { MACHINE_INCREMENTS } from '@/lib/constants/exercises'
import { evaluateOverload, getOverloadHintText } from '@/lib/logic/progressiveOverload'
import { updateExerciseLog } from '@/lib/hooks/useTrainingSession'
import type { ExerciseLog } from '@/lib/db/types'
import { CheckCircle2, TrendingUp, Clock } from 'lucide-react'

interface ExerciseCardProps {
  log: ExerciseLog
  previousLog?: ExerciseLog
  isCardio?: boolean
}

// Generate weight items for a given exercise
function buildWeightItems(uebungsname: string): string[] {
  const increments = MACHINE_INCREMENTS[uebungsname as keyof typeof MACHINE_INCREMENTS]
  if (increments) return increments.map(String)
  // Free weights: 0, 2.5, 5 ... 100 in 1.25 steps for isolation, 2.5 for compound
  const items: string[] = ['–']
  for (let w = 2.5; w <= 100; w += 1.25) {
    items.push((Math.round(w * 100) / 100).toString())
  }
  return items
}

function buildRepsItems(): number[] {
  return Array.from({ length: 30 }, (_, i) => i + 1)
}

export default function ExerciseCard({ log, previousLog }: ExerciseCardProps) {
  const weightItems = buildWeightItems(log.uebungsname)
  const repsItems = buildRepsItems()

  const parseRepsIst = (str: string | undefined) => {
    if (!str) return [log.sets >= 1 ? 10 : 10, log.sets >= 2 ? 10 : 10, log.sets >= 3 ? 10 : 10]
    return str.split('/').map(s => parseInt(s.trim(), 10) || 10)
  }

  const [weight, setWeight] = useState(log.gewicht_kg)
  const [reps, setReps] = useState<number[]>(parseRepsIst(log.reps_ist))
  const [erledigt, setErledigt] = useState(log.erledigt)

  // Sync from DB if changed externally
  useEffect(() => {
    setWeight(log.gewicht_kg)
    setReps(parseRepsIst(log.reps_ist))
    setErledigt(log.erledigt)
  }, [log.id]) // only reset if exercise changes

  function findNearestWeight(target: string): string {
    if (weightItems.includes(target)) return target
    const targetNum = parseFloat(target)
    if (isNaN(targetNum)) return weightItems[0]
    let nearest = weightItems[0]
    let minDiff = Math.abs(parseFloat(weightItems[0]) - targetNum)
    for (const item of weightItems) {
      const diff = Math.abs(parseFloat(item) - targetNum)
      if (diff < minDiff) { minDiff = diff; nearest = item }
    }
    return nearest
  }

  async function handleWeightChange(val: string) {
    setWeight(val)
    await updateExerciseLog(log.id, { gewicht_kg: val })
  }

  async function handleRepsChange(setIndex: number, val: number) {
    const newReps = [...reps]
    newReps[setIndex] = val
    setReps(newReps)
    await updateExerciseLog(log.id, { reps_ist: newReps.join('/') })
  }

  async function handleToggleDone() {
    const newDone = !erledigt
    setErledigt(newDone)
    await updateExerciseLog(log.id, { erledigt: newDone, gewicht_kg: weight, reps_ist: reps.join('/') })
  }

  // Progressive overload hint
  const hint = evaluateOverload({ ...log, gewicht_kg: weight, reps_ist: reps.join('/'), erledigt })
  const hintText = getOverloadHintText(hint, { ...log, gewicht_kg: weight })

  return (
    <div className="h-full flex flex-col px-4 py-5 space-y-5">

      {/* Exercise name + done toggle */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            {log.uebungsname}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            SOLL: {log.reps_ziel} · {log.gewicht_kg} kg
          </p>
        </div>
        <button
          onClick={handleToggleDone}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: erledigt ? 'var(--color-success-dim)' : 'var(--color-surface-elevated)',
            border: `2px solid ${erledigt ? 'var(--color-success)' : 'var(--color-border)'}`,
          }}
        >
          <CheckCircle2
            size={20}
            style={{ color: erledigt ? 'var(--color-success)' : 'var(--color-text-muted)' }}
            fill={erledigt ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Weight picker */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Gewicht (kg)
        </p>
        <DrumPicker
          items={weightItems}
          value={findNearestWeight(weight)}
          onChange={handleWeightChange}
          renderItem={(v) => v === '–' ? '–' : v}
          itemHeight={44}
          width={100}
        />
      </div>

      {/* Reps per set */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Wiederholungen
        </p>
        <div className="flex gap-4">
          {Array.from({ length: log.sets }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Satz {i + 1}
              </span>
              <DrumPicker
                items={repsItems}
                value={reps[i] ?? 10}
                onChange={(val) => handleRepsChange(i, val)}
                itemHeight={44}
                width={64}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Last session reference */}
      {previousLog && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Letztes Mal: {previousLog.gewicht_kg} kg · {previousLog.reps_ist ?? previousLog.reps_ziel}
          </span>
        </div>
      )}

      {/* Progressive overload hint */}
      {hintText && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: hint === 'erhoehen' ? 'var(--color-success-dim)' : 'var(--color-warning-dim)' }}
        >
          <TrendingUp
            size={14}
            style={{ color: hint === 'erhoehen' ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          <span className="text-xs font-medium" style={{ color: hint === 'erhoehen' ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {hintText}
          </span>
        </div>
      )}
    </div>
  )
}
