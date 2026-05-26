'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const severityStyles: Record<string, string> = {
  'Fatal': 'bg-red-100 text-red-800',
  'Serious': 'bg-amber-100 text-amber-800',
  'Minor': 'bg-green-100 text-green-800',
  'Incident': 'bg-blue-100 text-blue-800',
}

export default function AdminPage() {
  const [incidents, setIncidents] = useState([] as any[])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null as any)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    fetchIncidents()
  }, [filter])

  async function fetchIncidents() {
    setLoading(true)
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false })
    if (filter === 'pending') query = query.eq('live', false)
    if (filter === 'live') query = query.eq('live', true)
    const { data } = await query
    setIncidents(data || [])
    setLoading(false)
  }

  function openIncident(incident: any) {
    setSelected(incident)
    setSummary(incident.summary || '')
    setTags(incident.tags?.join(', ') || '')
  }

  async function approve() {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from('incidents')
      .update({
        live: true,
        summary: summary,
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      })
      .eq('id', selected.id)
    if (!error) {
      setSelected(null)
      fetchIncidents()
    }
    setSaving(false)
  }

  async function unpublish() {
    if (!selected) return
    setSaving(true)
    await supabase.from('incidents').update({ live: false }).eq('id', selected.id)
    setSelected(null)
    fetchIncidents()
    setSaving(false)
  }

  async function deleteIncident() {
    if (!selected) return
    if (!confirm('Are you sure you want to delete this report? This cannot be undone.')) return
    setSaving(true)
    await supabase.from('incidents').delete().eq('id', selected.id)
    setSelected(null)
    fetchIncidents()
    setSaving(false)
  }

  async function saveSummary() {
    if (!selected) return
    setSaving(true)
    await supabase.from('incidents').update({
      summary,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    }).eq('id', selected.id)
    setSaving(false)
    alert('Saved!')
  }

  const Nav = () => (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
      <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
      <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
      <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
      <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
      <span className="ml-auto text-xs bg-blue-900 px-3 py-1 rounded-full">⚙️ Admin</span>
    </nav>
  )

  if (selected) return (
    <main className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-blue-500 text-sm flex items-center gap-1 mb-6 hover:text-blue-700">
          ← Back to admin
        </button>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`text-xs font-medium px-2 py-1 rounded ${severityStyles[selected.severity] || 'bg-gray-100 text-gray-700'}`}>
            {selected.severity}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${selected.live ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {selected.live ? '✓ Live' : '⏳ Pending'}
          </span>
          <span className="text-xs text-gray-400">Submitted: {new Date(selected.created_at).toLocaleDateString()}</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{selected.site}</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            ['Date', selected.date],
            ['Time', selected.time_of_day],
            ['Country', selected.country],
            ['Province', selected.province],
            ['Location', selected.location],
            ['Pilot', selected.pilot_anonymous ? 'Anonymous' : selected.pilot_name],
            ['Rating', selected.pilot_rating?.join(', ')],
            ['Glider', `${selected.manufacturer || ''} ${selected.model || ''} ${selected.certification || ''}`],
            ['Pilot injury', selected.pilot_injury],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className="text-sm font-medium text-gray-900">{value || '—'}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Full description</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.description || '—'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Action & prevention</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.prevention || '—'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Reporter info (private)</h2>
          <div className="grid grid-cols-3 gap-3">
            {[['Name', selected.reporter_name], ['Email', selected.reporter_email], ['Phone', selected.reporter_phone]].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="text-sm text-gray-700">{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Summary (shown on database card)</h2>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-900 resize-none mb-3"
            rows={4}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Write a concise 2-3 sentence summary for the database card view…"
          />
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tags (comma separated)</h2>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-900 mb-3"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. Collapse, Reserve deployment, Turbulence"
          />
          <button onClick={saveSummary} disabled={saving} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save summary & tags'}
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          {!selected.live && (
            <button onClick={approve} disabled={saving}
              className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
              {saving ? 'Publishing…' : '✓ Approve & publish'}
            </button>
          )}
          {selected.live && (
            <button onClick={unpublish} disabled={saving}
              className="bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
              {saving ? 'Saving…' : '⏸ Unpublish'}
            </button>
          )}
          <button onClick={deleteIncident} disabled={saving}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            🗑 Delete report
          </button>
          <Link href={`/incident/${selected.id}`} target="_blank"
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200">
            View public page →
          </Link>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin</h1>
            <p className="text-gray-500 text-sm">Review, approve, and manage incident reports</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[['pending','⏳ Pending'], ['live','✓ Live'], ['all','All']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === val ? 'bg-blue-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {filter === 'pending' ? '✅ No pending reports — all caught up!' : 'No reports found.'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {incidents.map(incident => (
              <div key={incident.id} onClick={() => openIncident(incident)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded mt-0.5 ${severityStyles[incident.severity] || 'bg-gray-100 text-gray-700'}`}>
                    {incident.severity}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                      {incident.site || 'No site specified'}
                      <span className={`text-xs px-2 py-0.5 rounded ${incident.live ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {incident.live ? '✓ Live' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                      <span>📅 {incident.date || 'No date'}</span>
                      <span>🌍 {incident.country}</span>
                      <span>📝 Submitted {new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-500">Review →</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {incident.summary || incident.description?.slice(0, 150) + '…' || 'No description'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}