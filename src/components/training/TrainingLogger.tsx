'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExerciseCard from './ExerciseCard'
import {
  useTrainingSession,
  useExerciseLogs,
  createTrainingSession,
  finishTrainingSession,
  getPreviousLog,
} from '@/lib/hooks/useTrainingSession'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { upsertTodayTracking } from '@/lib/hooks/useTodayTracking'
import { formatDayName } from '@/lib/utils/dates'
import type { ExerciseLog, TrainingsTyp } from '@/lib/db/types'
import { ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react'

interface TrainingLoggerProps {
  datum: string
}

export default function TrainingLogger({ datum }: TrainingLoggerProps) {
  const profile = useUserProfile()
  const session = useTrainingSession(datum)
  const logs = useExerciseLogs(session?.id)
  const weekPlan = useCurrentWeekPlan()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [previousLogs, setPreviousLogs] = useState<Record<string, ExerciseLog>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [creating, setCreating] = useState(false)

  // Determine training type for today from week plan
  const dayShort = formatDayName(datum)
  const todayPlan = weekPlan?.tage.find(t => t.wochentag === dayShort)
  const trainingstyp = (todayPlan?.training_typ ?? 'Push') as TrainingsTyp

  // Auto-create session if none exists
  useEffect(() => {
    if (session === undefined || creating) return
    if (session === null && profile) {
      setCreating(true)
      createTrainingSession(datum, trainingstyp, profile.standort).finally(() => setCreating(false))
    }
  }, [session, datum, trainingstyp, profile, creating])

  // Load previous logs for each exercise
  useEffect(() => {
    if (!logs || logs.length === 0 || !profile) return
    const safeLogs: ExerciseLog[] = logs
    const load = async () => {
      const map: Record<string, ExerciseLog> = {}
      await Promise.all(
        safeLogs.map(async (log) => {
          const prev = await getPreviousLog(log.uebungsname, profile.standort, datum)
          if (prev) map[log.uebungsname] = prev
        })
      )
      setPreviousLogs(map)
    }
    load()
  }, [logs?.length, datum, profile])

  function navigate(dir: number) {
    if (!logs) return
    const next = currentIndex + dir
    if (next < 0 || next >= logs.length) return
    setDirection(dir)
    setCurrentIndex(next)
  }

  async function handleFinish() {
    if (!session) return
    await finishTrainingSession(session.id, feedback)
    await upsertTodayTracking({ training_typ: trainingstyp })
    setShowFeedback(false)
  }

  if (session === undefined || creating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lade Training…</div>
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4 gap-4">
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {trainingstyp === 'Ruhetag' || trainingstyp === 'Active Recovery'
            ? 'Heute ist Ruhetag. Erholung ist Teil des Plans!'
            : 'Kein Training-Template für diesen Tag.'}
        </p>
      </div>
    )
  }

  const safeLogs = logs as ExerciseLog[]
  const currentLog = safeLogs[currentIndex]
  const prevLog = currentLog ? previousLogs[currentLog.uebungsname] : undefined
  const doneCount = safeLogs.filter(l => l.erledigt).length

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {trainingstyp}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {doneCount}/{safeLogs.length} erledigt
          </p>
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-success-dim)', color: 'var(--color-success)' }}
        >
          <CheckCheck size={14} />
          Abschließen
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-3 px-4">
        {safeLogs.map((l, i) => (
          <button
            key={l.id}
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i) }}
            className="rounded-full transition-all"
            style={{
              width: i === currentIndex ? 20 : 8,
              height: 8,
              background: l.erledigt
                ? 'var(--color-success)'
                : i === currentIndex
                ? 'var(--color-accent)'
                : 'var(--color-border-strong)',
            }}
          />
        ))}
      </div>

      {/* Exercise card with swipe */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentLog?.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) navigate(1)
              else if (info.offset.x > 50) navigate(-1)
            }}
          >
            {currentLog && (
              <ExerciseCard log={currentLog} previousLog={prevLog} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between items-center px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {currentIndex + 1} / {safeLogs.length}
        </span>

        <button
          onClick={() => navigate(1)}
          disabled={currentIndex === safeLogs.length - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <ChevronRight size={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Feedback sheet */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="w-full rounded-t-2xl p-6 space-y-4"
            style={{ background: 'var(--color-surface)' }}
          >
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Training abschließen
            </h3>
            <textarea
              placeholder="Wie war das Training? (optional)"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold glass"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Zurück
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--color-success)', color: '#fff' }}
              >
                Fertig ✓
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
