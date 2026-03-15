import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import type { ReactNode } from 'react'

import Sidebar from '@/components/dashboard/sidebar'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={{ name: session.user.name, image: session.user.image }} />

      {/* Main Content — offset for sidebar on desktop, offset for top bar on mobile */}
      <main className="pt-14 lg:ml-64 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
