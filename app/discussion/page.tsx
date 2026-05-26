'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const CATEGORIES = ['All','Technique','Equipment','Sites','Weather','General']
const CAT_COLORS: Record<string, string> = {
  'Technique': 'bg-green-100 text-green-800',
  'Equipment': 'bg-amber-100 text-amber-800',
  'Sites': 'bg-purple-100 text-purple-800',
  'Weather': 'bg-orange-100 text-orange-800',
  'General': 'bg-blue-100 text-blue-800',
}
const CAT_EMOJI: Record<string, string> = {
  'Technique': '✈️',
  'Equipment': '🔧',
  'Sites': '📍',
  'Weather': '🌤',
  'General': '💬',
}

function Avatar({ name, size = 8 }: { name: string, size?: number }) {
  const colors = ['bg-blue-600','bg-green-600','bg-amber-600','bg-purple-600','bg-red-600','bg-teal-600']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {name.slice(0,2).toUpperCase()}
    </div>
  )
}

export default function DiscussionPage() {
  const [threads, setThreads] = useState([] as any[])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list')
  const [selected, setSelected] = useState(null as any)
  const [replies, setReplies] = useState([] as any[])
  const [newReply, setNewReply] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('')
  const [posting, setPosting] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', body: '', category: 'General', author: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchThreads() }, [category, search])

  async function fetchThreads() {
    setLoading(true)
    let query = supabase.from('threads').select('*').order('created_at', { ascending: false })
    if (category !== 'All') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)
    const { data } = await query
    if (data) {
      const withCounts = await Promise.all(data.map(async t => {
        const { count } = await supabase.from('replies').select('*', { count: 'exact', head: true }).eq('thread_id', t.id)
        return { ...t, reply_count: count || 0 }
      }))
      setThreads(withCounts)
    }
    setLoading(false)
  }

  async function openThread(thread: any) {
    setSelected(thread)
    const { data } = await supabase.from('replies').select('*').eq('thread_id', thread.id).order('created_at', { ascending: true })
    setReplies(data || [])
    setView('thread')
  }

  async function postReply() {
    if (!newReply.trim() || !selected) return
    setPosting(true)
    const { data, error } = await supabase.from('replies').insert([{
      thread_id: selected.id,
      author: replyAuthor.trim() || 'Anonymous',
      text: newReply.trim()
    }]).select()
    if (!error && data) {
      setReplies([...replies, data[0]])
      setNewReply('')
      setReplyAuthor('')
    }
    setPosting(false)
  }

  async function postThread() {
    if (!newThread.title.trim() || !newThread.body.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('threads').insert([{
      title: newThread.title.trim(),
      body: newThread.body.trim(),
      category: newThread.category,
      author: newThread.author.trim() || 'Anonymous',
      pinned: false,
    }])
    if (!error) {
      setNewThread({ title: '', body: '', category: 'General', author: '' })
      setView('list')
      fetchThreads()
    }
    setSubmitting(false)
  }

  const Nav = () => (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
      <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
      <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
      <Link href="/discussion" className="text-white text-sm font-medium">Discussion</Link>
      <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
      <Link href="/submit" className="ml-auto bg-white text-blue-800 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
        Report an occurrence
      </Link>
    </nav>
  )

  if (view === 'new') return (
    <main className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setView('list')} className="text-blue-500 text-sm mb-6 hover:text-blue-700">← Back to discussion</button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Start a new thread</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Your name (optional)</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              value={newThread.author} onChange={e => setNewThread(t => ({ ...t, author: e.target.value }))}
              placeholder="Leave blank to post anonymously" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 bg-white"
              value={newThread.category} onChange={e => setNewThread(t => ({ ...t, category: e.target.value }))}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              value={newThread.title} onChange={e => setNewThread(t => ({ ...t, title: e.target.value }))}
              placeholder="e.g. Best practices for pre-flight on 2-liners" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Message</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-none"
              rows={6} value={newThread.body} onChange={e => setNewThread(t => ({ ...t, body: e.target.value }))}
              placeholder="Start the discussion…" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button onClick={postThread} disabled={submitting || !newThread.title.trim() || !newThread.body.trim()}
              className="bg-blue-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50">
              {submitting ? 'Posting…' : 'Post thread'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )

  if (view === 'thread' && selected) return (
    <main className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => { setView('list'); fetchThreads() }} className="text-blue-500 text-sm mb-6 hover:text-blue-700">← Back to discussion</button>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {selected.pinned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">📌 Pinned</span>}
          <span className={`text-xs px-2 py-0.5 rounded ${CAT_COLORS[selected.category] || 'bg-gray-100 text-gray-600'}`}>
            {CAT_EMOJI[selected.category]} {selected.category}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{selected.title}</h1>
        <div className="text-xs text-gray-400 mb-6">Started by {selected.author} · {new Date(selected.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-3">
            <Avatar name={selected.author} />
            <div className="flex-1 bg-white rounded-lg border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-900">{selected.author}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">OP</span>
                <span className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
            </div>
          </div>

          {replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <Avatar name={reply.author} />
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                  <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add a reply</h3>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 mb-2"
            placeholder="Your name (or leave blank for Anonymous)"
            value={replyAuthor} onChange={e => setReplyAuthor(e.target.value)} />
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 resize-none mb-3"
            rows={3} placeholder="Share your thoughts…"
            value={newReply} onChange={e => setNewReply(e.target.value)} />
          <button onClick={postReply} disabled={posting || !newReply.trim()}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50">
            {posting ? 'Posting…' : 'Post reply'}
          </button>
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Safety Discussion</h1>
            <p className="text-gray-500 text-sm">Community forum for free flight safety topics</p>
          </div>
          <button onClick={() => setView('new')}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 flex items-center gap-2">
            + New thread
          </button>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <input type="text" placeholder="Search discussions…"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${category === c ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
              {c !== 'All' && CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading discussions…</div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-3">No threads yet — be the first to start a discussion!</p>
            <button onClick={() => setView('new')} className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900">
              Start a thread
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {threads.map(thread => (
              <div key={thread.id} onClick={() => openThread(thread)}
                className={`bg-white rounded-lg border p-4 cursor-pointer hover:border-gray-400 transition-colors ${thread.pinned ? 'border-blue-300' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <Avatar name={thread.author} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {thread.pinned && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${CAT_COLORS[thread.category] || 'bg-gray-100 text-gray-600'}`}>
                        {CAT_EMOJI[thread.category]} {thread.category}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 mb-1">{thread.title}</div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{thread.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>By {thread.author}</span>
                      <span>💬 {thread.reply_count} repl{thread.reply_count !== 1 ? 'ies' : 'y'}</span>
                      <span>{new Date(thread.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-500 flex-shrink-0">Read →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}