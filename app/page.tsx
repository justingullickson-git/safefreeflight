'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Link from 'next/link'

const severityStyles = {
  'Fatal': 'bg-red-100 text-red-800',
  'Serious': 'bg-amber-100 text-amber-800',
  'Minor': 'bg-green-100 text-green-800',
  'Incident': 'bg-blue-100 text-blue-800',
}

export default function Home() {
const [incidents, setIncidents] = useState([] as any[])
const [filtered, setFiltered] = useState([] as any[])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
   async function fetchIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('live', true)
    .order('date', { ascending: false })
  if (error) console.error(error)
  else {
    setIncidents(data)
    setFiltered(data)
  }

  const { count } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('live', false)
  setPendingCount(count || 0)

  setLoading(false)
}
    fetchIncidents()
  }, [])

  useEffect(() => {
    let results = incidents
    if (search) {
      const q = search.toLowerCase()
      results = results.filter(i =>
        i.site?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q) ||
        i.country?.toLowerCase().includes(q) ||
        i.glider?.toLowerCase().includes(q) ||
        i.weather?.toLowerCase().includes(q) ||
        i.summary?.toLowerCase().includes(q) ||
        i.tags?.some((t: string) => t.toLowerCase().includes(q))
      )
    }
    if (country) results = results.filter(i => i.country === country)
    if (severity) results = results.filter(i => i.severity === severity)
    setFiltered(results)
  }, [search, country, severity, incidents])

  const liveCount = incidents.filter(i => i.live).length
  const seriousCount = incidents.filter(i => i.severity === 'Serious' || i.severity === 'Fatal').length
  const countries = [...new Set(incidents.map(i => i.country))].sort()

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg mr-6">
          <span>🪂</span> SafeFreeFlight
        </div>
        <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
        <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
        <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
        <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
        <Link href="/submit" className="ml-auto bg-white text-blue-800 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
          Report an occurrence
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">SafeFreeFlight Safety Database</h1>
        <p className="text-gray-500 text-sm mb-6">Canadian free flight accident & incident registry — international reports included</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total reports</div>
            <div className="text-2xl font-semibold">{incidents.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Live</div>
            <div className="text-2xl font-semibold text-green-700">{liveCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Serious injuries</div>
            <div className="text-2xl font-semibold text-amber-700">{seriousCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Pending consent</div>
            <div className="text-2xl font-semibold text-amber-700">{pendingCount}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search by site, country, equipment, conditions…"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
          >
            <option value="">All severity</option>
            <option>Fatal</option>
            <option>Serious</option>
            <option>Minor</option>
            <option>Incident</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Reports</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Showing {filtered.length} of {incidents.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading reports…</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(incident => (
              <Link href={`/incident/${incident.id}`} key={incident.id}>
                <div className={`bg-white rounded-lg border p-4 hover:border-gray-400 transition-colors cursor-pointer ${incident.live ? 'border-green-400' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded mt-0.5 ${severityStyles[incident.severity as keyof typeof severityStyles] || 'bg-gray-100 text-gray-700'}`}>
                      {incident.severity}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                        {incident.site}
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {incident.country === 'Canada' ? '🇨🇦' : '🌎'} {incident.country}
                        </span>
                        {incident.live && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ Live</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                        <span>📅 {incident.date}</span>
                        <span>📍 {incident.location}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {incident.live && !incident.pilot_anonymous ? incident.pilot_name : incident.live ? 'Anonymous' : 'Pending consent'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{incident.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {incident.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-blue-500">Full report →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}