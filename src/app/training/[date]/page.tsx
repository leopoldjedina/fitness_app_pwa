export default async function TrainingDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Training – {date}
      </h1>
      <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        Kommt in Phase 2
      </p>
    </div>
  )
}
