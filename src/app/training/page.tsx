'use client'

import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/database'
import { getWeekDates, todayISO, formatShortDate, formatDayName } from '@/lib/utils/dates'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import type { TrainingsTyp } from '@/lib/db/types'

const TYP_COLORS: Record<TrainingsTyp, string> = {
  Push: 'var(--color-accent)',
  Pull: '#a78bfa',
  Beine: '#60a5fa',
  'Zone 2': 'var(--color-success)',
  HIIT: 'var(--color-danger)',
  'Active Recovery': 'var(--color-warning)',
  Ruhetag: 'var(--color-text-muted)',
}

export default function TrainingPage() {
  const weekPlan = useCurrentWeekPlan()
  const today = todayISO()
  const weekDates = getWeekDates(new Date())

  const sessions = useLiveQuery(
    () => db.trainingSessions
      .where('datum').anyOf(weekDates)
      .toArray(),
    [weekDates.join(',')]
  )

  const sessionMap = new Map(sessions?.map(s => [s.datum, s]) ?? [])

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Training
      </h1>

      {weekPlan ? (
        <div className="space-y-2">
          {weekDates.map((date, i) => {
            const day = weekPlan.tage[i]
            const session = sessionMap.get(date)
            const isToday = date === today
            const isPast = date < today
            const color = TYP_COLORS[day?.training_typ ?? 'Ruhetag']
            const isRest = day?.training_typ === 'Ruhetag' || day?.training_typ === 'Active Recovery'

            return (
              <Link
                key={date}
                href={isRest ? '#' : `/training/${date}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-all active:scale-98"
                style={{
                  background: isToday ? 'var(--color-surface-elevated)' : 'transparent',
                  border: `1px solid ${isToday ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  opacity: isPast && !session ? 0.5 : 1,
                  cursor: isRest ? 'default' : 'pointer',
                }}
              >
                {/* Date */}
                <div className="w-12 text-center flex-shrink-0">
                  <div className="text-xs font-bold" style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    {formatDayName(date)}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatShortDate(date)}
                  </div>
                </div>

                {/* Color bar */}
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />

                {/* Training type */}
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {day?.training_typ ?? '–'}
                  </div>
                  {day?.notizen && (
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {day.notizen}
                    </div>
                  )}
                </div>

                {/* Status */}
                {session?.abgeschlossen ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} fill="currentColor" />
                ) : isToday && !isRest ? (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                    Heute
                  </span>
                ) : (
                  !isRest && <Circle size={20} style={{ color: 'var(--color-border-strong)' }} />
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Kein Wochenplan gefunden.
        </p>
      )}
    </div>
  )
}
