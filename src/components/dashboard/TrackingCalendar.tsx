'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db/database'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns'
import { toISODate } from '@/lib/utils/dates'
import type { DailyTracking, Energielevel } from '@/lib/db/types'
import DrumPicker, {
  ENERGIELEVEL_ITEMS,
  SCHLAFSCORE_ITEMS,
  SCHLAFDAUER_ITEMS,
  GEWICHT_ITEMS,
  BAUCHUMFANG_ITEMS,
  RUHEPULS_ITEMS,
} from '@/components/ui/DrumPicker'
import { ChevronLeft, ChevronRight, X, Pencil, Save } from 'lucide-react'

const ENERGY_LABELS = ['😴', '😕', '😐', '😊', '⚡']

function findNearest<T>(items: T[], target: T | undefined | null, fallback: T): T {
  if (target === undefined || target === null) return fallback
  if (items.includes(target)) return target
  const targetNum = Number(target)
  let nearest = items[0]
  let minDiff = Math.abs(Number(items[0]) - targetNum)
  for (const item of items) {
    const diff = Math.abs(Number(item) - targetNum)
    if (diff < minDiff) { minDiff = diff; nearest = item }
  }
  return nearest
}

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

interface TrackingCalendarProps {
  onClose: () => void
}

export default function TrackingCalendar({ onClose }: TrackingCalendarProps) {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState(false)
  const [editForm, setEditForm] = useState<Partial<DailyTracking>>({})

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

  // Load training sessions for the month
  const sessionData = useLiveQuery(
    () => db.trainingSessions.where('datum').between(startISO, endISO, true, true).toArray(),
    [startISO, endISO]
  )
  const sessionMap = new Map(sessionData?.map(s => [s.datum, s]) ?? [])

  const selectedTracking = selectedDate ? dataMap.get(selectedDate) : null
  const selectedSession = selectedDate ? sessionMap.get(selectedDate) : null

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
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--color-surface-elevated)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {format(new Date(selectedDate + 'T12:00:00'), 'dd.MM.yyyy')}
              </h3>
              {selectedTracking && !editingDay && (
                <button
                  onClick={() => { setEditingDay(true); setEditForm({ ...selectedTracking }) }}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'var(--color-accent)', background: 'var(--color-accent-dim)' }}
                >
                  <Pencil size={10} /> Bearbeiten
                </button>
              )}
            </div>

            {editingDay && selectedTracking ? (
              <div className="space-y-3">
                {/* DrumPicker row for biomarkers */}
                <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={[...ENERGIELEVEL_ITEMS]}
                      value={(editForm.energielevel ?? 3) as number}
                      onChange={(v) => setEditForm(f => ({ ...f, energielevel: v as Energielevel }))}
                      renderItem={(v) => ENERGY_LABELS[(v as number) - 1]}
                      itemHeight={36} width={56}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Energie</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={SCHLAFSCORE_ITEMS}
                      value={findNearest(SCHLAFSCORE_ITEMS, editForm.schlafindex, 75)}
                      onChange={(v) => setEditForm(f => ({ ...f, schlafindex: v }))}
                      itemHeight={36} width={56}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Schlaf</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={SCHLAFDAUER_ITEMS}
                      value={findNearest(SCHLAFDAUER_ITEMS, editForm.schlaf_h, 7.5)}
                      onChange={(v) => setEditForm(f => ({ ...f, schlaf_h: v }))}
                      renderItem={(v) => v.toFixed(2)}
                      itemHeight={36} width={56}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Dauer</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={GEWICHT_ITEMS}
                      value={findNearest(GEWICHT_ITEMS, editForm.gewicht_kg, 70.0)}
                      onChange={(v) => setEditForm(f => ({ ...f, gewicht_kg: v }))}
                      renderItem={(v) => v.toFixed(1)}
                      itemHeight={36} width={64}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Gewicht</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={BAUCHUMFANG_ITEMS}
                      value={findNearest(BAUCHUMFANG_ITEMS, editForm.bauchumfang_cm, 82.0)}
                      onChange={(v) => setEditForm(f => ({ ...f, bauchumfang_cm: v }))}
                      renderItem={(v) => v.toFixed(1)}
                      itemHeight={36} width={64}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Bauch</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <DrumPicker
                      items={RUHEPULS_ITEMS}
                      value={findNearest(RUHEPULS_ITEMS, editForm.ruhepuls_bpm, 55)}
                      onChange={(v) => setEditForm(f => ({ ...f, ruhepuls_bpm: v }))}
                      itemHeight={36} width={56}
                    />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Puls</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingDay(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold glass"
                    style={{ color: 'var(--color-text-secondary)' }}>Abbrechen</button>
                  <button
                    onClick={async () => {
                      if (selectedTracking) {
                        await db.dailyTracking.update(selectedTracking.id, editForm)
                        setEditingDay(false)
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  ><Save size={12} /> Speichern</button>
                </div>
              </div>
            ) : selectedTracking ? (
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Energie" value={selectedTracking.energielevel != null ? String(selectedTracking.energielevel) : '–'} />
                <MiniStat label="Schlaf" value={selectedTracking.schlafindex != null ? String(selectedTracking.schlafindex) : '–'} />
                <MiniStat label="Dauer" value={selectedTracking.schlaf_h != null ? `${selectedTracking.schlaf_h}h` : '–'} />
                <MiniStat label="Gewicht" value={selectedTracking.gewicht_kg != null ? `${selectedTracking.gewicht_kg.toFixed(1)} kg` : '–'} />
                <MiniStat label="Bauch" value={selectedTracking.bauchumfang_cm != null ? `${selectedTracking.bauchumfang_cm.toFixed(1)} cm` : '–'} />
                <MiniStat label="Puls" value={selectedTracking.ruhepuls_bpm != null ? `${selectedTracking.ruhepuls_bpm} bpm` : '–'} />
                <MiniStat label="kcal" value={selectedTracking.kcal_ist != null ? String(selectedTracking.kcal_ist) : '–'} />
                <MiniStat label="Protein" value={selectedTracking.protein_ist_g != null ? `${selectedTracking.protein_ist_g}g` : '–'} />
                <MiniStat label="Training" value={selectedSession?.abgeschlossen ? (selectedTracking.training_typ ?? '–') : '–'} />
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

function EditField({ label, value, onChange }: { label: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input
        type="number"
        step="any"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm rounded-lg px-2 py-1.5 outline-none mt-0.5"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
      />
    </div>
  )
}
