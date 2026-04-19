'use client'

import { useState } from 'react'
import DrumPicker, {
  ENERGIELEVEL_ITEMS,
  SCHLAFSCORE_ITEMS,
  SCHLAFDAUER_ITEMS,
  GEWICHT_ITEMS,
  BAUCHUMFANG_ITEMS,
  RUHEPULS_ITEMS,
} from '@/components/ui/DrumPicker'
import { useYesterdayTracking } from '@/lib/hooks/useYesterdayTracking'
import { useTodayTracking, upsertTodayTracking } from '@/lib/hooks/useTodayTracking'
import type { DailyTracking, Energielevel } from '@/lib/db/types'
import { Pencil, Save, SkipForward } from 'lucide-react'

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

interface CheckInState {
  energielevel: Energielevel | null
  schlafindex: number | null
  schlaf_h: number | null
  gewicht_kg: number | null
  bauchumfang_cm: number | null
  ruhepuls_bpm: number | null
}

export default function MorningCheckIn() {
  const yesterday = useYesterdayTracking()
  const today = useTodayTracking()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<CheckInState | null>(null)

  const hasSavedData = today && (
    today.energielevel !== undefined ||
    today.gewicht_kg !== undefined ||
    today.schlafindex !== undefined
  )

  function startEditing() {
    setForm({
      energielevel: (today?.energielevel ?? yesterday?.energielevel ?? 3) as Energielevel,
      schlafindex: today?.schlafindex ?? yesterday?.schlafindex ?? 75,
      schlaf_h: today?.schlaf_h ?? yesterday?.schlaf_h ?? 7.5,
      gewicht_kg: today?.gewicht_kg ?? yesterday?.gewicht_kg ?? 70.0,
      bauchumfang_cm: today?.bauchumfang_cm ?? yesterday?.bauchumfang_cm ?? 82.0,
      ruhepuls_bpm: today?.ruhepuls_bpm ?? yesterday?.ruhepuls_bpm ?? 55,
    })
    setIsEditing(true)
  }

  async function handleSave() {
    if (!form) return
    const updates: Partial<DailyTracking> = {}
    if (form.energielevel !== null) updates.energielevel = form.energielevel
    if (form.schlafindex !== null) updates.schlafindex = form.schlafindex
    if (form.schlaf_h !== null) updates.schlaf_h = form.schlaf_h
    if (form.gewicht_kg !== null) updates.gewicht_kg = form.gewicht_kg
    if (form.bauchumfang_cm !== null) updates.bauchumfang_cm = form.bauchumfang_cm
    if (form.ruhepuls_bpm !== null) updates.ruhepuls_bpm = form.ruhepuls_bpm
    await upsertTodayTracking(updates)
    setIsEditing(false)
    setForm(null)
  }

  function clearField(field: keyof CheckInState) {
    if (!form) return
    setForm({ ...form, [field]: null })
  }

  // ─── Saved view (compact summary) ────────────────────────────────────
  if (hasSavedData && !isEditing) {
    return (
      <div className="rounded-xl p-4 glass">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Morgen-Check-in
          </h2>
          <button
            onClick={startEditing}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all active:scale-95"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-dim)' }}
          >
            <Pencil size={12} />
            Bearbeiten
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ValueChip label="Energie" value={today?.energielevel ? ENERGY_LABELS[today.energielevel - 1] : '–'} />
          <ValueChip label="Schlaf" value={today?.schlafindex != null ? `${today.schlafindex}` : '–'} unit="Score" />
          <ValueChip label="Dauer" value={today?.schlaf_h != null ? `${today.schlaf_h}` : '–'} unit="h" />
          <ValueChip label="Gewicht" value={today?.gewicht_kg != null ? `${today.gewicht_kg.toFixed(1)}` : '–'} unit="kg" />
          <ValueChip label="Bauch" value={today?.bauchumfang_cm != null ? `${today.bauchumfang_cm.toFixed(1)}` : '–'} unit="cm" />
          <ValueChip label="Puls" value={today?.ruhepuls_bpm != null ? `${today.ruhepuls_bpm}` : '–'} unit="bpm" />
        </div>
      </div>
    )
  }

  // ─── Not yet saved: show edit button or editing view ──────────────────
  if (!isEditing) {
    return (
      <div className="rounded-xl p-4 glass">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Morgen-Check-in
          </h2>
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Daten eingeben
          </button>
        </div>
      </div>
    )
  }

  // ─── Editing view with DrumPickers ────────────────────────────────────
  return (
    <div className="rounded-xl p-4 glass space-y-4">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        Morgen-Check-in
      </h2>

      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        <EditField label="Energie" unit="/5" isEmpty={form?.energielevel === null} onClear={() => clearField('energielevel')}>
          <DrumPicker
            items={[...ENERGIELEVEL_ITEMS]}
            value={form?.energielevel ?? 3}
            onChange={(v) => setForm(f => f ? { ...f, energielevel: v as Energielevel } : f)}
            renderItem={(v) => ENERGY_LABELS[(v as number) - 1]}
            itemHeight={44}
            width={68}
          />
        </EditField>

        <EditField label="Schlaf" unit="Score" isEmpty={form?.schlafindex === null} onClear={() => clearField('schlafindex')}>
          <DrumPicker
            items={SCHLAFSCORE_ITEMS}
            value={findNearest(SCHLAFSCORE_ITEMS, form?.schlafindex, 75)}
            onChange={(v) => setForm(f => f ? { ...f, schlafindex: v } : f)}
            itemHeight={44}
            width={72}
          />
        </EditField>

        <EditField label="Dauer" unit="h" isEmpty={form?.schlaf_h === null} onClear={() => clearField('schlaf_h')}>
          <DrumPicker
            items={SCHLAFDAUER_ITEMS}
            value={findNearest(SCHLAFDAUER_ITEMS, form?.schlaf_h, 7.5)}
            onChange={(v) => setForm(f => f ? { ...f, schlaf_h: v } : f)}
            renderItem={(v) => v.toFixed(2)}
            itemHeight={44}
            width={72}
          />
        </EditField>

        <EditField label="Gewicht" unit="kg" isEmpty={form?.gewicht_kg === null} onClear={() => clearField('gewicht_kg')}>
          <DrumPicker
            items={GEWICHT_ITEMS}
            value={findNearest(GEWICHT_ITEMS, form?.gewicht_kg, 70.0)}
            onChange={(v) => setForm(f => f ? { ...f, gewicht_kg: v } : f)}
            renderItem={(v) => v.toFixed(1)}
            itemHeight={44}
            width={80}
          />
        </EditField>

        <EditField label="Bauch" unit="cm" isEmpty={form?.bauchumfang_cm === null} onClear={() => clearField('bauchumfang_cm')}>
          <DrumPicker
            items={BAUCHUMFANG_ITEMS}
            value={findNearest(BAUCHUMFANG_ITEMS, form?.bauchumfang_cm, 82.0)}
            onChange={(v) => setForm(f => f ? { ...f, bauchumfang_cm: v } : f)}
            renderItem={(v) => v.toFixed(1)}
            itemHeight={44}
            width={80}
          />
        </EditField>

        <EditField label="Puls" unit="bpm" isEmpty={form?.ruhepuls_bpm === null} onClear={() => clearField('ruhepuls_bpm')}>
          <DrumPicker
            items={RUHEPULS_ITEMS}
            value={findNearest(RUHEPULS_ITEMS, form?.ruhepuls_bpm, 55)}
            onChange={(v) => setForm(f => f ? { ...f, ruhepuls_bpm: v } : f)}
            itemHeight={44}
            width={68}
          />
        </EditField>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setIsEditing(false); setForm(null) }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold glass transition-all active:scale-95"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <Save size={14} />
          Speichern
        </button>
      </div>
    </div>
  )
}

function ValueChip({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--color-surface-elevated)' }}>
      <div className="text-lg font-bold" style={{ color: value === '–' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
        {value}
        {unit && value !== '–' && (
          <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>
        )}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}

function EditField({
  label, unit, isEmpty, onClear, children
}: {
  label: string; unit: string; isEmpty: boolean; onClear: () => void; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      {isEmpty ? (
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 68, height: 220, background: 'var(--color-surface-elevated)', border: '1px dashed var(--color-border-strong)' }}
        >
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>–</span>
        </div>
      ) : (
        children
      )}
      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <button
        onClick={isEmpty ? undefined : onClear}
        className="text-[9px] px-1.5 py-0.5 rounded transition-all"
        style={{
          color: isEmpty ? 'var(--color-accent)' : 'var(--color-text-muted)',
          opacity: isEmpty ? 0 : 0.7,
        }}
      >
        <SkipForward size={10} />
      </button>
    </div>
  )
}
