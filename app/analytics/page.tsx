'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

function NavBar() {
  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
      <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
      <Link href="/analytics" className="text-white text-sm font-medium">Analytics</Link>
      <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
      <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
      <Link href="/submit" className="ml-auto bg-white text-blue-800 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
        Report an occurrence
      </Link>
    </nav>
  )
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const SEV_COLORS: Record<string, string> = {
  'Fatal': '#991B1B',
  'Serious': '#92400E',
  'Minor': '#166534',
  'Incident': '#1E40AF',
}
const SEV_BG: Record<string, string> = {
  'Fatal': 'bg-red-100 text-red-800',
  'Serious': 'bg-amber-100 text-amber-800',
  'Minor': 'bg-green-100 text-green-800',
  'Incident': 'bg-blue-100 text-blue-800',
}

export default function AnalyticsPage() {
  const [incidents, setIncidents] = useState([] as any[])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('all')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('incidents').select('*').order('date', { ascending: true })
      setIncidents(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = yearFilter === 'all' ? incidents : incidents.filter(i => i.date?.startsWith(yearFilter))

  const years = [...new Set(incidents.map(i => i.date?.slice(0,4)).filter(Boolean))].sort().reverse() as string[]

  // KPIs
  const total = filtered.length
  const fatal = filtered.filter(i => i.severity === 'Fatal').length
  const serious = filtered.filter(i => i.severity === 'Serious').length
  const minor = filtered.filter(i => i.severity === 'Minor').length
  const incident = filtered.filter(i => i.severity === 'Incident').length

  // By severity
  const severityCounts = [
    { label: 'Fatal', count: fatal },
    { label: 'Serious', count: serious },
    { label: 'Minor', count: minor },
    { label: 'Incident', count: incident },
  ]

  // By country
  const countryCounts = Object.entries(
    filtered.reduce((acc: Record<string, number>, i) => {
      const c = i.country || 'Unknown'
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  // By month
  const monthCounts = MONTHS.map((m, idx) => ({
    month: m,
    count: filtered.filter(i => i.date && parseInt(i.date.slice(5,7)) === idx + 1).length
  }))

  // By year
  const yearCounts = years.map(y => ({
    year: y,
    fatal: incidents.filter(i => i.date?.startsWith(y) && i.severity === 'Fatal').length,
    serious: incidents.filter(i => i.date?.startsWith(y) && i.severity === 'Serious').length,
    minor: incidents.filter(i => i.date?.startsWith(y) && i.severity === 'Minor').length,
    incident: incidents.filter(i => i.date?.startsWith(y) && i.severity === 'Incident').length,
    total: incidents.filter(i => i.date?.startsWith(y)).length,
  }))

  // By aircraft type
  const aircraftCounts = Object.entries(
    filtered.reduce((acc: Record<string, number>, i) => {
      const types = i.aircraft_type || []
      types.forEach((t: string) => { acc[t] = (acc[t] || 0) + 1 })
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  // Top sites
  const siteCounts = Object.entries(
    filtered.reduce((acc: Record<string, any>, i) => {
      const s = i.site || 'Unknown'
      if (!acc[s]) acc[s] = { count: 0, country: i.country, severities: [] }
      acc[s].count++
      acc[s].severities.push(i.severity)
      return acc
    }, {})
  ).sort((a, b) => b[1].count - a[1].count).slice(0, 8)

  const maxMonthCount = Math.max(...monthCounts.map(m => m.count), 1)
  const maxYearTotal = Math.max(...yearCounts.map(y => y.total), 1)
  const maxCountryCount = Math.max(...countryCounts.map(c => c[1]), 1)
  const maxAircraftCount = Math.max(...aircraftCounts.map(a => a[1]), 1)

  const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%'

  if (loading) return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="text-center py-12 text-gray-400">Loading analytics…</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Safety Analytics</h1>
          <p className="text-gray-500 text-sm">Trend analysis and site data — {total} reports</p>
        </div>

        {/* Year filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setYearFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm border ${yearFilter === 'all' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            All time
          </button>
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 rounded-full text-sm border ${yearFilter === y ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
              {y}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Total reports</div>
            <div className="text-2xl font-semibold text-gray-900">{total}</div>
          </div>
          {severityCounts.map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-semibold`} style={{ color: SEV_COLORS[s.label] }}>{s.count}</div>
              <div className="text-xs text-gray-400 mt-1">{pct(s.count)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Monthly seasonality */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Incidents by month <span className="text-xs text-gray-400 font-normal">seasonal pattern</span></h2>
            <div className="flex items-end gap-1.5 h-32">
              {monthCounts.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">{m.count > 0 ? m.count : ''}</div>
                  <div className="w-full rounded-t"
                    style={{ height: `${Math.max((m.count / maxMonthCount) * 100, m.count > 0 ? 4 : 0)}%`, background: '#1E40AF', minHeight: m.count > 0 ? '4px' : '0' }} />
                  <div className="text-xs text-gray-400">{m.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              ⚠️ Peak season is typically July–September when thermic activity and flight volumes are highest.
            </div>
          </div>

          {/* By year */}
          {yearCounts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Reports per year</h2>
              <div className="flex flex-col gap-2">
                {yearCounts.map(y => (
                  <div key={y.year} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-10">{y.year}</div>
                    <div className="flex-1 flex h-6 rounded overflow-hidden gap-px">
                      {(['Fatal','Serious','Minor','Incident'] as const).map(sev => {
                        const count = y[sev.toLowerCase() as keyof typeof y] as number
                        const w = y.total > 0 ? (count / maxYearTotal) * 100 : 0
                        return w > 0 ? (
                          <div key={sev} style={{ width: `${w}%`, background: SEV_COLORS[sev] }}
                            className="flex items-center justify-center text-white text-xs" title={`${sev}: ${count}`} />
                        ) : null
                      })}
                    </div>
                    <div className="text-xs text-gray-500 w-6 text-right">{y.total}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {Object.entries(SEV_COLORS).map(([sev, color]) => (
                  <span key={sev} className="text-xs flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: color }} />
                    {sev}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Severity donut */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Severity distribution</h2>
            <div className="flex items-center gap-6">
              <svg width="100" height="100" viewBox="0 0 100 100">
                {(() => {
                  const data = severityCounts.filter(s => s.count > 0)
                  const totalCount = data.reduce((a, b) => a + b.count, 0)
                  let offset = 0
                  const circumference = 2 * Math.PI * 35
                  return data.map(s => {
                    const dash = (s.count / totalCount) * circumference
                    const el = (
                      <circle key={s.label} cx="50" cy="50" r="35" fill="none"
                        stroke={SEV_COLORS[s.label]} strokeWidth="18"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 50 50)" />
                    )
                    offset += dash
                    return el
                  })
                })()}
                <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="600" fill="#111">{total}</text>
                <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#888">reports</text>
              </svg>
              <div className="flex flex-col gap-2">
                {severityCounts.map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm" style={{ background: SEV_COLORS[s.label] }} />
                    <span className="text-gray-600">{s.label}</span>
                    <span className="ml-auto font-medium text-gray-900">{pct(s.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By country */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Reports by country</h2>
            <div className="flex flex-col gap-3">
              {countryCounts.map(([country, count]) => (
                <div key={country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{country}</span>
                    <span className="font-medium text-gray-900">{count as number}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-800 rounded-full" style={{ width: `${((count as number) / maxCountryCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By aircraft */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Reports by aircraft type</h2>
            {aircraftCounts.length === 0 ? (
              <div className="text-sm text-gray-400">No aircraft data yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {aircraftCounts.map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-medium text-gray-900">{count as number}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((count as number) / maxAircraftCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top sites table */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Most reported sites</h2>
            {siteCounts.length === 0 ? (
              <div className="text-sm text-gray-400">No site data yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Site</th>
                    <th className="text-left pb-3 font-medium">Country</th>
                    <th className="text-left pb-3 font-medium">Reports</th>
                    <th className="text-left pb-3 font-medium">Worst outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {siteCounts.map(([site, data]) => {
                    const sevOrder = ['Fatal','Serious','Minor','Incident']
                    const worst = sevOrder.find(s => data.severities.includes(s)) || 'Incident'
                    return (
                      <tr key={site} className="border-t border-gray-100">
                        <td className="py-2.5 text-sm font-medium text-gray-900">{site}</td>
                        <td className="py-2.5 text-sm text-gray-500">{data.country}</td>
                        <td className="py-2.5 text-sm text-gray-500">{data.count}</td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded ${SEV_BG[worst]}`}>{worst}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}