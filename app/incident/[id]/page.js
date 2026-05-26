'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const severityStyles = {
  'Fatal': 'bg-red-100 text-red-800',
  'Serious': 'bg-amber-100 text-amber-800',
  'Minor': 'bg-green-100 text-green-800',
  'Incident': 'bg-blue-100 text-blue-800',
}

export default function IncidentPage() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: inc } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single()
      setIncident(inc)

      const { data: coms } = await supabase
        .from('comments')
        .select('*')
        .eq('incident_id', id)
        .order('created_at', { ascending: true })
      setComments(coms || [])
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  async function postComment() {
    if (!newComment.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        incident_id: id,
        author: author.trim() || 'Anonymous',
        text: newComment.trim()
      }])
      .select()
    if (!error && data) {
      setComments([...comments, data[0]])
      setNewComment('')
      setAuthor('')
    }
    setPosting(false)
  }

  if (loading) return (
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
      <div className="text-center py-12 text-gray-600">Loading report…</div>
    </main>
  )

  if (!incident) return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-center py-12 text-gray-600">Report not found.</div>
    </main>
  )

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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-500 text-sm flex items-center gap-1 mb-6 hover:text-blue-700">
          ← Back to database
        </Link>

        {incident.live ? (
          <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-2 text-sm text-green-700 mb-5 flex items-center gap-2">
            ✓ This report is live — published with pilot consent.
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2 text-sm text-amber-700 mb-5 flex items-center gap-2">
            ⏳ This report is pending pilot consent and is not yet publicly visible.
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-1 rounded ${severityStyles[incident.severity] || 'bg-gray-100 text-gray-700'}`}>
            {incident.severity}
          </span>
          {incident.tags?.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">{incident.site}</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Date & time</div>
            <div className="text-sm font-medium">{incident.date} · {incident.time_of_day}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Location</div>
            <div className="text-sm font-medium">{incident.location}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Country</div>
            <div className="text-sm font-medium">{incident.country}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Pilot</div>
            <div className="text-sm font-medium">
              {incident.pilot_anonymous ? <span className="text-gray-600 italic">Anonymous</span> : incident.pilot_name}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Rating</div>
            <div className="text-sm font-medium">{incident.pilot_rating?.join(', ') || 'Not specified'}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Glider</div>
            <div className="text-sm font-medium">{incident.glider}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-600 mb-1">Harness</div>
            <div className="text-sm font-medium">{incident.harness}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 col-span-2">
            <div className="text-xs text-gray-600 mb-1">Weather</div>
            <div className="text-sm font-medium">{incident.weather}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{incident.summary}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Full incident description</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{incident.description}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Action & prevention</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{incident.prevention}</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-5">
            Discussion ({comments.length})
          </h2>

          {comments.length === 0 && (
            <p className="text-sm text-gray-600 mb-6">No comments yet — be the first to add to the discussion.</p>
          )}

          <div className="flex flex-col gap-4 mb-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                  {comment.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(comment.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          {incident.live ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add a comment</h3>
              <input
                type="text"
                placeholder="Your name (or leave blank for Anonymous)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-blue-400"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
              <textarea
                placeholder="Share your thoughts, experience, or advice…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400 resize-none"
                rows={3}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button
                onClick={postComment}
                disabled={posting}
                className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50"
              >
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600 text-center">
              Discussion will open once this report is published.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}