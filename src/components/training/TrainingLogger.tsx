'use client'

import { useState, useEffect } from 'react'
// framer-motion removed for Safari compatibility
import {
  useTrainingSession,
  useExerciseLogs,
  createTrainingSession,
  updateExerciseLog,
  finishTrainingSession,
} from '@/lib/hooks/useTrainingSession'
import { db } from '@/lib/db/database'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { upsertTodayTracking } from '@/lib/hooks/useTodayTracking'
import { formatDayName } from '@/lib/utils/dates'
import { TRAININGS_TYPEN } from '@/lib/constants/exercises'
import type { ExerciseLog, TrainingsTyp, UebungsName } from '@/lib/db/types'
import { CheckCheck, Plus, Trash2, Search, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'

// All available exercises for picking
const ALL_EXERCISES: { name: UebungsName; typ: string }[] = [
  { name: 'Brustpresse Maschine', typ: 'Push' },
  { name: 'Butterfly Maschine', typ: 'Push' },
  { name: 'Schulterdrücken KH', typ: 'Push' },
  { name: 'Seitheben KH', typ: 'Push' },
  { name: 'Trizeps Pushdown Kabel', typ: 'Push' },
  { name: 'Latzug Maschine', typ: 'Pull' },
  { name: 'Rudermaschine sitzend', typ: 'Pull' },
  { name: 'Face Pulls Kabel', typ: 'Pull' },
  { name: 'Bizeps Curls KH', typ: 'Pull' },
  { name: 'Reverse Fly Maschine', typ: 'Pull' },
  { name: 'Beinpresse', typ: 'Beine' },
  { name: 'Beinbeuger Maschine', typ: 'Beine' },
  { name: 'Beinstrecker Maschine', typ: 'Beine' },
  { name: 'Wadenmaschine', typ: 'Beine' },
  { name: 'Wadenheber stehend KH', typ: 'Beine' },
  { name: 'Cable Crunch', typ: 'Core' },
  { name: 'Plank', typ: 'Core' },
  { name: 'Russian Twist', typ: 'Core' },
  { name: 'Dead Bug', typ: 'Core' },
  { name: 'Reverse Crunch', typ: 'Core' },
  { name: 'Mountain Climbers', typ: 'Core' },
  { name: 'Crosstrainer', typ: 'Cardio' },
  { name: 'Ergometer', typ: 'Cardio' },
  { name: 'Rudergerät', typ: 'Cardio' },
  { name: 'Stepper', typ: 'Cardio' },
  { name: 'Joggen', typ: 'Cardio' },
  { name: 'Fahrrad', typ: 'Cardio' },
]

interface TrainingLoggerProps {
  datum: string
}

export default function TrainingLogger({ datum }: TrainingLoggerProps) {
  const profile = useUserProfile()
  const session = useTrainingSession(datum)
  const logs = useExerciseLogs(session?.id) as ExerciseLog[] | undefined
  const weekPlan = useCurrentWeekPlan()
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [creating, setCreating] = useState(false)

  const dayShort = formatDayName(datum)
  const todayPlan = weekPlan?.tage.find(t => t.wochentag === dayShort)
  const trainingstyp = (todayPlan?.training_typ ?? 'Push') as TrainingsTyp
  const isRestDay = trainingstyp === 'Ruhetag' || trainingstyp === 'Active Recovery'

  // Auto-create session if none exists
  useEffect(() => {
    if (session === undefined || creating || isRestDay) return
    if (session === null && profile) {
      setCreating(true)
      createTrainingSession(datum, trainingstyp, profile.standort).finally(() => setCreating(false))
    }
  }, [session, datum, trainingstyp, profile, creating, isRestDay])

  async function handleAddExercise(name: UebungsName) {
    if (!session) return
    const newLog: ExerciseLog = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      standort: profile?.standort,
      uebungsname: name,
      reihenfolge: (logs?.length ?? 0) + 1,
      gewicht_kg: '',
      sets: 3,
      reps_ziel: '3×10',
      erledigt: false,
    }
    await db.exerciseLogs.add(newLog)
    setShowExercisePicker(false)
    setExerciseSearch('')
  }

  async function handleDeleteExercise(id: string) {
    await db.exerciseLogs.delete(id)
  }

  async function handleFinish() {
    if (!session) return
    await finishTrainingSession(session.id, feedback)
    await upsertTodayTracking({ training_typ: trainingstyp })
    setShowFeedback(false)
  }

  const filteredExercises = exerciseSearch
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
    : ALL_EXERCISES

  if (isRestDay) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4 gap-4">
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Heute ist {trainingstyp}. Erholung ist Teil des Plans!
        </p>
        <Link href="/training" className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>
    )
  }

  if (session === undefined || creating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lade Training…</div>
      </div>
    )
  }

  const doneCount = logs?.filter(l => l.erledigt).length ?? 0

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center gap-3">
          <Link href="/training" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {trainingstyp}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {doneCount}/{logs?.length ?? 0} erledigt
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-success-dim)', color: 'var(--color-success)' }}
        >
          <CheckCheck size={14} />
          Fertig
        </button>
      </div>

      {/* Exercise list */}
      <div className="px-4 space-y-3 pb-4">
        {logs?.map(log => (
          <ExerciseRow
            key={log.id}
            log={log}
            onDelete={() => handleDeleteExercise(log.id)}
          />
        ))}

        {/* Add exercise button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ border: '2px dashed var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
        >
          <Plus size={16} />
          Übung hinzufügen
        </button>
      </div>

      {/* Exercise picker */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-h-[70dvh] rounded-t-2xl overflow-hidden"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Übung wählen</h3>
              <button onClick={() => { setShowExercisePicker(false); setExerciseSearch('') }}
                style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Suchen…" value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text-primary)' }} autoFocus />
            </div>
            <div className="overflow-y-auto max-h-[50dvh]">
              {filteredExercises.map(ex => (
                <button key={ex.name} onClick={() => handleAddExercise(ex.name)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors active:opacity-70"
                  style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{ex.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>{ex.typ}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback sheet */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full rounded-t-2xl p-6 space-y-4" style={{ background: 'var(--color-surface)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Training abschließen</h3>
            <textarea placeholder="Wie war das Training? (optional)" value={feedback}
              onChange={e => setFeedback(e.target.value)} rows={3}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
              style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={() => setShowFeedback(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold glass"
                style={{ color: 'var(--color-text-secondary)' }}>Zurück</button>
              <button onClick={handleFinish}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--color-success)', color: '#fff' }}>Fertig ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inline ExerciseRow ─────────────────────────────────────────────────────

function ExerciseRow({ log, onDelete }: { log: ExerciseLog; onDelete: () => void }) {
  const [gewicht, setGewicht] = useState(log.gewicht_kg)
  const [repsZiel, setRepsZiel] = useState(log.reps_ziel)
  const [repsIst, setRepsIst] = useState(log.reps_ist ?? '')
  const [erledigt, setErledigt] = useState(log.erledigt)

  async function handleToggle() {
    const next = !erledigt
    setErledigt(next)
    await updateExerciseLog(log.id, { erledigt: next, gewicht_kg: gewicht, reps_ziel: repsZiel, reps_ist: repsIst || undefined })
  }

  async function saveField(field: string, value: string) {
    await updateExerciseLog(log.id, { [field]: value || undefined })
  }

  return (
    <div className="rounded-xl p-4 glass space-y-2"
      style={{ borderColor: erledigt ? 'rgba(34,197,94,0.3)' : 'var(--color-border)', opacity: erledigt ? 0.8 : 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{log.uebungsname}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleToggle}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: erledigt ? 'var(--color-success-dim)' : 'var(--color-surface-elevated)',
              border: `2px solid ${erledigt ? 'var(--color-success)' : 'var(--color-border)'}`,
              color: erledigt ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}>
            {erledigt && <CheckCheck size={12} />}
          </button>
          <button onClick={onDelete} className="p-1" style={{ color: 'var(--color-text-muted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Gewicht</label>
          <input type="text" value={gewicht} placeholder="–"
            onChange={e => setGewicht(e.target.value)}
            onBlur={() => saveField('gewicht_kg', gewicht)}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
        </div>
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>SOLL</label>
          <input type="text" value={repsZiel} placeholder="3×10"
            onChange={e => setRepsZiel(e.target.value)}
            onBlur={() => saveField('reps_ziel', repsZiel)}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
        </div>
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>IST</label>
          <input type="text" value={repsIst} placeholder="10/10/8"
            onChange={e => setRepsIst(e.target.value)}
            onBlur={() => saveField('reps_ist', repsIst)}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
        </div>
      </div>
    </div>
  )
}
