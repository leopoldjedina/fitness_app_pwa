'use client'

import dynamic from 'next/dynamic'

const SyncManager = dynamic(() => import('./SyncManager'), { ssr: false })

export default function SyncLoader() {
  return <SyncManager />
}
