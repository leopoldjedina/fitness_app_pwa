'use client'

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

interface FieldConfig {
  label: string
  unit: string
  width: number
}

const FIELDS: FieldConfig[] = [
  { label: 'Energie', unit: '/5', width: 68 },
  { label: 'Schlaf', unit: 'Score', width: 72 },
  { label: 'Dauer', unit: 'h', width: 72 },
  { label: 'Gewicht', unit: 'kg', width: 80 },
  { label: 'Bauch', unit: 'cm', width: 80 },
  { label: 'Puls', unit: 'bpm', width: 68 },
]

function findNearest<T>(items: T[], target: T | undefined, fallback: T): T {
  if (target === undefined) return fallback
  if (items.includes(target)) return target
  // Find nearest numeric value
  const targetNum = Number(target)
  let nearest = items[0]
  let minDiff = Math.abs(Number(items[0]) - targetNum)
  for (const item of items) {
    const diff = Math.abs(Number(item) - targetNum)
    if (diff < minDiff) { minDiff = diff; nearest = item }
  }
  return nearest
}

export default function MorningCheckIn() {
  const yesterday = useYesterdayTracking()
  const today = useTodayTracking()

  async function handleChange(field: keyof DailyTracking, value: unknown) {
    await upsertTodayTracking({ [field]: value } as Partial<DailyTracking>)
  }

  // Use today's value if exists, else yesterday's, else sensible default
  const energielevel = (today?.energielevel ?? yesterday?.energielevel ?? 3) as Energielevel
  const schlafindex = today?.schlafindex ?? yesterday?.schlafindex ?? 75
  const schlaf_h = today?.schlaf_h ?? yesterday?.schlaf_h ?? 7.5
  const gewicht = today?.gewicht_kg ?? yesterday?.gewicht_kg ?? 70.0
  const bauch = today?.bauchumfang_cm ?? yesterday?.bauchumfang_cm ?? 82.0
  const puls = today?.ruhepuls_bpm ?? yesterday?.ruhepuls_bpm ?? 55

  return (
    <div className="rounded-xl p-4 glass">
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Morgen-Check-in
      </h2>
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {/* Energielevel */}
        <PickerField config={FIELDS[0]}>
          <DrumPicker
            items={[...ENERGIELEVEL_ITEMS]}
            value={energielevel}
            onChange={(v) => handleChange('energielevel', v)}
            renderItem={(v) => ['😴', '😕', '😐', '😊', '⚡'][v - 1]}
            itemHeight={44}
            width={FIELDS[0].width}
          />
        </PickerField>

        {/* Schlafscore */}
        <PickerField config={FIELDS[1]}>
          <DrumPicker
            items={SCHLAFSCORE_ITEMS}
            value={findNearest(SCHLAFSCORE_ITEMS, schlafindex, 75)}
            onChange={(v) => handleChange('schlafindex', v)}
            itemHeight={44}
            width={FIELDS[1].width}
          />
        </PickerField>

        {/* Schlafdauer */}
        <PickerField config={FIELDS[2]}>
          <DrumPicker
            items={SCHLAFDAUER_ITEMS}
            value={findNearest(SCHLAFDAUER_ITEMS, schlaf_h, 7.5)}
            onChange={(v) => handleChange('schlaf_h', v)}
            renderItem={(v) => v.toFixed(2)}
            itemHeight={44}
            width={FIELDS[2].width}
          />
        </PickerField>

        {/* Gewicht */}
        <PickerField config={FIELDS[3]}>
          <DrumPicker
            items={GEWICHT_ITEMS}
            value={findNearest(GEWICHT_ITEMS, gewicht, 70.0)}
            onChange={(v) => handleChange('gewicht_kg', v)}
            renderItem={(v) => v.toFixed(1)}
            itemHeight={44}
            width={FIELDS[3].width}
          />
        </PickerField>

        {/* Bauchumfang */}
        <PickerField config={FIELDS[4]}>
          <DrumPicker
            items={BAUCHUMFANG_ITEMS}
            value={findNearest(BAUCHUMFANG_ITEMS, bauch, 82.0)}
            onChange={(v) => handleChange('bauchumfang_cm', v)}
            renderItem={(v) => v.toFixed(1)}
            itemHeight={44}
            width={FIELDS[4].width}
          />
        </PickerField>

        {/* Ruhepuls */}
        <PickerField config={FIELDS[5]}>
          <DrumPicker
            items={RUHEPULS_ITEMS}
            value={findNearest(RUHEPULS_ITEMS, puls, 55)}
            onChange={(v) => handleChange('ruhepuls_bpm', v)}
            itemHeight={44}
            width={FIELDS[5].width}
          />
        </PickerField>
      </div>
    </div>
  )
}

function PickerField({
  config,
  children,
}: {
  config: FieldConfig
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      {children}
      <span className="text-[10px] leading-none" style={{ color: 'var(--color-text-muted)' }}>
        {config.label}
      </span>
      <span className="text-[9px] leading-none" style={{ color: 'var(--color-text-muted)' }}>
        {config.unit}
      </span>
    </div>
  )
}
