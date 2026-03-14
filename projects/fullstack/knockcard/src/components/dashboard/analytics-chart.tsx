'use client'

import { formatNumber } from '@/lib/utils'

interface DailyView {
  date: string
  count: number
}

interface AnalyticsChartProps {
  totalViews: number
  totalSaves: number
  totalExchanges: number
  dailyViews: DailyView[]
}

export default function AnalyticsChart({
  totalViews,
  totalSaves,
  totalExchanges,
  dailyViews,
}: AnalyticsChartProps) {
  const maxCount = Math.max(...dailyViews.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Views" value={totalViews} />
        <StatCard label="Saves" value={totalSaves} />
        <StatCard label="Exchanges" value={totalExchanges} />
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Views (Last 30 Days)</h3>

        {dailyViews.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No data yet</p>
        ) : (
          <div className="flex items-end gap-1" style={{ height: '160px' }}>
            {dailyViews.map(day => {
              const heightPercent = (day.count / maxCount) * 100

              return (
                <div key={day.date} className="group relative flex-1" style={{ height: '100%' }}>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                    {day.date}: {day.count}
                  </div>

                  {/* Bar */}
                  <div className="flex h-full flex-col justify-end">
                    <div
                      className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                      style={{
                        height: `${Math.max(heightPercent, 2)}%`,
                        minHeight: '2px',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
    </div>
  )
}
