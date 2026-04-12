'use client'

import { useState, useEffect } from 'react'
import { useUserProfile, updateUserProfile } from '@/lib/hooks/useUserProfile'
import { db } from '@/lib/db/database'
import type { UserProfile, Standort } from '@/lib/db/types'
import { MapPin, Download, CheckCircle } from 'lucide-react'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  unit,
}: {
  label: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors"
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {unit && (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ProfilPage() {
  const profile = useUserProfile()
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm(profile)
    }
  }, [profile])

  function set(key: keyof UserProfile, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function setNum(key: keyof UserProfile, val: string) {
    const num = parseFloat(val)
    setForm(prev => ({ ...prev, [key]: isNaN(num) ? val : num }))
  }

  async function handleSave() {
    await updateUserProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const data = {
      userProfile: await db.userProfile.toArray(),
      dailyTracking: await db.dailyTracking.toArray(),
      trainingSessions: await db.trainingSessions.toArray(),
      exerciseLogs: await db.exerciseLogs.toArray(),
      weekPlans: await db.weekPlans.toArray(),
      mealPlans: await db.mealPlans.toArray(),
      shoppingLists: await db.shoppingLists.toArray(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leofit-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center pt-20">
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Lade Profil…
        </div>
      </div>
    )
  }

  const bauchumfang = profile.start_bauchumfang_cm
  const ziel = profile.ziel_bauchumfang_cm
  const meilensteine = [80, 78, 76, 74]

  return (
    <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Profil
        </h1>
        {/* Standort toggle */}
        <div
          className="flex rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {(['Berlin', 'Salzburg'] as Standort[]).map(s => (
            <button
              key={s}
              onClick={() => setForm(prev => ({ ...prev, standort: s }))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: form.standort === s ? 'var(--color-accent)' : 'var(--color-surface)',
                color: form.standort === s ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              <MapPin size={12} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Persönliche Daten */}
      <section className="rounded-xl p-4 space-y-3 glass">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Persönliche Daten
        </h2>
        <Field label="Name" value={form.name ?? ''} onChange={v => set('name', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Alter" value={form.alter ?? ''} onChange={v => setNum('alter', v)} type="number" unit="Jahre" />
          <Field label="Größe" value={form.groesse_cm ?? ''} onChange={v => setNum('groesse_cm', v)} type="number" unit="cm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Startgewicht" value={form.startgewicht_kg ?? ''} onChange={v => setNum('startgewicht_kg', v)} type="number" unit="kg" />
          <Field label="Start-Bauchumfang" value={form.start_bauchumfang_cm ?? ''} onChange={v => setNum('start_bauchumfang_cm', v)} type="number" unit="cm" />
        </div>
      </section>

      {/* Zielwerte */}
      <section className="rounded-xl p-4 space-y-3 glass">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Zielwerte
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ziel Bauchumfang" value={form.ziel_bauchumfang_cm ?? ''} onChange={v => setNum('ziel_bauchumfang_cm', v)} type="number" unit="cm" />
          <Field label="Ziel KFA" value={form.ziel_kfa_prozent ?? ''} onChange={v => setNum('ziel_kfa_prozent', v)} type="number" unit="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="kcal Trainingstag" value={form.kcal_trainingstag ?? ''} onChange={v => setNum('kcal_trainingstag', v)} type="number" unit="kcal" />
          <Field label="kcal Ruhetag" value={form.kcal_ruhetag ?? ''} onChange={v => setNum('kcal_ruhetag', v)} type="number" unit="kcal" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Protein-Ziel" value={form.protein_ziel_g ?? ''} onChange={v => setNum('protein_ziel_g', v)} type="number" unit="g" />
          <Field label="HF max" value={form.hf_max_bpm ?? ''} onChange={v => setNum('hf_max_bpm', v)} type="number" unit="bpm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="VO2max Start" value={form.vo2max_start ?? ''} onChange={v => setNum('vo2max_start', v)} type="number" />
          <Field label="VO2max Ziel" value={form.vo2max_ziel ?? ''} onChange={v => setNum('vo2max_ziel', v)} type="number" />
        </div>
      </section>

      {/* Meilensteine */}
      <section className="rounded-xl p-4 space-y-3 glass">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Bauchumfang-Meilensteine
        </h2>
        <div className="space-y-2">
          {meilensteine.map(m => {
            const reached = bauchumfang <= m
            return (
              <div key={m} className="flex items-center gap-3">
                <CheckCircle
                  size={18}
                  style={{ color: reached ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                  fill={reached ? 'currentColor' : 'none'}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: reached ? 'var(--color-success)' : 'var(--color-text-primary)' }}
                >
                  Bauchumfang {'< '}{m} cm
                </span>
                {m === ziel && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                    Ziel
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{
            background: saved ? 'var(--color-success)' : 'var(--color-accent)',
            color: '#fff',
          }}
        >
          {saved ? 'Gespeichert ✓' : 'Speichern'}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 glass"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Download size={16} />
          Export
        </button>
      </div>

    </div>
  )
}
