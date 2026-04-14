'use client'

import { use } from 'react'
import TrainingLogger from '@/components/training/TrainingLogger'

export default function TrainingDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params)
  return (
    <div className="flex flex-col h-[calc(100dvh-64px)]">
      <TrainingLogger datum={date} />
    </div>
  )
}
