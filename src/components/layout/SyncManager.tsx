'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

export default function SyncManager() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Only initialize after mount (pure client-side)
  useEffect(() => {
    setReady(true)
  }, [])

  const doSync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    setError(null)
    try {
      // Dynamic import to avoid any SSR issues
      const { fullSync } = await import('@/lib/supabase/sync')
      const { supabase } = await import('@/lib/supabase/client')
      if (!supabase) {
        setError('Supabase nicht konfiguriert')
        setSyncing(false)
        return
      }
      const result = await fullSync()
      if (result.errors.length > 0) {
        setError(result.errors[0])
      } else {
        setLastSync(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync fehlgeschlagen')
    }
    setSyncing(false)
  }, [syncing])

  // Auto-sync on mount
  useEffect(() => {
    if (ready) doSync()
  }, [ready])

  if (!ready) return null

  return (
    <div className="fixed top-2 right-2 z-40 flex flex-col items-end gap-1" style={{ paddingTop: 'var(--spacing-safe-top)' }}>
      <button
        onClick={doSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95"
        style={{
          background: error ? 'var(--color-danger-dim)' : syncing ? 'var(--color-surface-elevated)' : 'var(--color-success-dim)',
          color: error ? 'var(--color-danger)' : syncing ? 'var(--color-text-muted)' : 'var(--color-success)',
        }}
      >
        <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Sync…' : error ? 'Fehler ↓' : lastSync ? `✓ ${lastSync}` : 'Sync'}
      </button>
      {error && (
        <div className="max-w-[250px] rounded-lg p-2 text-[10px] break-all"
          style={{ background: 'var(--color-danger-dim)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}
    </div>
  )
}
