'use client'

import { useEffect, useState } from 'react'
import { fullSync } from '@/lib/supabase/sync'
import { supabase } from '@/lib/supabase/client'
import { RefreshCw } from 'lucide-react'

export default function SyncManager() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-sync on mount
  useEffect(() => {
    if (!supabase) return
    doSync()
  }, [])

  async function doSync() {
    if (!supabase || syncing) return
    setSyncing(true)
    setError(null)
    try {
      const result = await fullSync()
      if (result.errors.length > 0) {
        setError(result.errors[0])
      }
      setLastSync(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync fehlgeschlagen')
    }
    setSyncing(false)
  }

  if (!supabase) return null

  return (
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
      {syncing ? 'Sync…' : error ? 'Fehler' : lastSync ? `✓ ${lastSync}` : 'Sync'}
    </button>
  )
}
