import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'
import DBInitializer from '@/components/layout/DBInitializer'
import SyncLoader from '@/components/layout/SyncLoader'

export const metadata: Metadata = {
  title: 'LeoFit',
  description: 'Persönliches Fitness-Tracking',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LeoFit',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body>
        <DBInitializer />
        <SyncLoader />
        <main
          className="min-h-dvh"
          style={{
            paddingBottom: 'calc(64px + var(--spacing-safe-bottom))',
            paddingTop: 'var(--spacing-safe-top)',
          }}
        >
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
