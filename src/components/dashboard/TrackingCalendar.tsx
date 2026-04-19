'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/database'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns'
import { toISODate } from '@/lib/utils/dates'
import type { DailyTracking } from '@/lib/db/types'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

interface TrackingCalendarProps {
  onClose: () => void
}

export default function TrackingCalendar({ onClose }: TrackingCalendarProps) {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Load all tracking data for the visible month
  const startISO = toISODate(monthStart)
  const endISO = toISODate(monthEnd)
  const trackingData = useLiveQuery(
    () => db.dailyTracking.where('datum').between(startISO, endISO, true, true).toArray(),
    [startISO, endISO]
  )
  const dataMap = new Map(trackingData?.map(d => [d.datum, d]) ?? [])

  const selectedTracking = selectedDate ? dataMap.get(selectedDate) : null

  // Calculate padding for first day of month (Monday-based)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7 // 0=Mon

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Tracking-Verlauf
          </h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 rounded-lg active:scale-90" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {MONATE[month.getMonth()]} {month.getFullYear()}
          </span>
          <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-lg active:scale-90" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WOCHENTAGE.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for padding */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map(day => {
            const iso = toISODate(day)
            const hasData = dataMap.has(iso)
            const isSelected = selectedDate === iso
            const isToday = iso === toISODate(new Date())
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(isSelected ? null : iso)}
                className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-90 relative"
                style={{
                  background: isSelected ? 'var(--color-accent)' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  border: isToday && !isSelected ? '1px solid var(--color-accent)' : 'none',
                }}
              >
                {day.getDate()}
                {hasData && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: 'var(--color-success)' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day detail */}
        {selectedDate && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--color-surface-elevated)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {format(new Date(selectedDate + 'T12:00:00'), 'dd.MM.yyyy')}
            </h3>
            {selectedTracking ? (
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Energie" value={selectedTracking.energielevel != null ? String(selectedTracking.energielevel) : '–'} />
                <MiniStat label="Schlaf" value={selectedTracking.schlafindex != null ? String(selectedTracking.schlafindex) : '–'} />
                <MiniStat label="Dauer" value={selectedTracking.schlaf_h != null ? `${selectedTracking.schlaf_h}h` : '–'} />
                <MiniStat label="Gewicht" value={selectedTracking.gewicht_kg != null ? `${selectedTracking.gewicht_kg.toFixed(1)} kg` : '–'} />
                <MiniStat label="Bauch" value={selectedTracking.bauchumfang_cm != null ? `${selectedTracking.bauchumfang_cm.toFixed(1)} cm` : '–'} />
                <MiniStat label="Puls" value={selectedTracking.ruhepuls_bpm != null ? `${selectedTracking.ruhepuls_bpm} bpm` : '–'} />
                <MiniStat label="kcal IST" value={selectedTracking.kcal_ist != null ? String(selectedTracking.kcal_ist) : '–'} />
                <MiniStat label="Protein" value={selectedTracking.protein_ist_g != null ? `${selectedTracking.protein_ist_g}g` : '–'} />
                <MiniStat label="Training" value={selectedTracking.training_typ ?? '–'} />
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Keine Daten für diesen Tag.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold" style={{ color: value === '–' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}
