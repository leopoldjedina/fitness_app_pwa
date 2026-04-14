'use client'

import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useTodayTracking } from '@/lib/hooks/useTodayTracking'
import { useCurrentWeekPlan } from '@/lib/hooks/useWeekPlan'
import { computeKcalSoll, computeProteinSoll } from '@/lib/logic/calories'
import { todayISO, formatDayName } from '@/lib/utils/dates'
import MorningCheckIn from '@/components/dashboard/MorningCheckIn'
import Link from 'next/link'
import { Dumbbell, UtensilsCrossed } from 'lucide-react'

const WOCHENTAG_MAP: Record<string, string> = {
  Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag',
  Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag',
}

export default function DashboardPage() {
  const profile = useUserProfile()
  const today = useTodayTracking()
  const weekPlan = useCurrentWeekPlan()
  const todayDate = todayISO()
  const todayShort = formatDayName(todayDate) as keyof typeof WOCHENTAG_MAP

  const todayPlan = weekPlan?.tage.find(t => t.wochentag === todayShort)
  const kcalSoll = profile ? computeKcalSoll(todayPlan?.training_typ, profile) : 2000
  const proteinSoll = profile ? computeProteinSoll(profile) : 135

  const kcalIst = today?.kcal_ist ?? 0
  const proteinIst = today?.protein_ist_g ?? 0
  const kcalPct = Math.min(100, Math.round((kcalIst / kcalSoll) * 100))
  const proteinPct = Math.min(100, Math.round((proteinIst / proteinSoll) * 100))

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 max-w-lg mx-auto">

      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {WOCHENTAG_MAP[todayShort] ?? todayShort}, {new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' })}
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Guten Morgen{profile?.name ? `, ${profile.name}` : ''} 👋
        </h1>
      </div>

      {/* Morning Check-in */}
      <MorningCheckIn />

      {/* Heutige Ziele */}
      <div className="rounded-xl p-4 glass space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Heutige Ziele
          </h2>
          {todayPlan && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              {todayPlan.training_typ}
            </span>
          )}
        </div>

        {/* Kalorien */}
        <MacroBar
          label="Kalorien"
          ist={kcalIst}
          soll={kcalSoll}
          pct={kcalPct}
          unit="kcal"
          color="var(--color-accent)"
        />

        {/* Protein */}
        <MacroBar
          label="Protein"
          ist={proteinIst}
          soll={proteinSoll}
          pct={proteinPct}
          unit="g"
          color="var(--color-success)"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/training/${todayDate}`}
          className="flex items-center gap-3 rounded-xl p-4 active:scale-95 transition-transform glass"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)' }}>
            <Dumbbell size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Training
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {todayPlan?.training_typ ?? 'starten'}
            </div>
          </div>
        </Link>

        <Link
          href="/ernaehrung"
          className="flex items-center gap-3 rounded-xl p-4 active:scale-95 transition-transform glass"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-success-dim)' }}>
            <UtensilsCrossed size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Ernährung
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {kcalSoll - kcalIst > 0 ? `${kcalSoll - kcalIst} kcal übrig` : 'Ziel erreicht!'}
            </div>
          </div>
        </Link>
      </div>

    </div>
  )
}

function MacroBar({
  label, ist, soll, pct, unit, color
}: {
  label: string; ist: number; soll: number; pct: number; unit: string; color: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ist}</span>
          {' / '}{soll} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
