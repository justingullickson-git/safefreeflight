'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const RATINGS = ['Student','P1','P2','P3','P4','H1','H2','H3','H4','Paragliding Instructor','Paragliding Tandem','Hang Gliding Instructor','Hang Gliding Tandem','Other']
const AIRCRAFT_TYPES = ['Paraglider','Hang Glider','Mini Wing','Speedflyer','Paraglider Tandem','Hang Glider Tandem','Other']
const PROVINCES = ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon']
const TIME_OPTIONS = ['Early morning (before 9am)','Morning (9am–12pm)','Mid-day (12pm–2pm)','Afternoon (2pm–6pm)','Evening (after 6pm)','Night','Unknown']
const INJURY_OPTIONS = ['No injury','Minor (no medical aid or on-site aid only)','Serious (secondary medical aid)','Fatality','Unknown']

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    reporter_name: '', reporter_email: '', reporter_phone: '',
    pilot_name: '', pilot_anonymous: true,
    pilot_rating: [] as string[],
    date: '', time_of_day: '',
    country: 'Canada', province: '', site: '', location: '',
    aircraft_type: [] as string[],
    manufacturer: '', model: '', certification: '',
    pilot_injury: '', passenger_injury: '',
    injury_description: '', damage: '',
    description: '', prevention: '',
    publish: true,
  })

  function update(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleArray(field: string, value: string) {
    setForm(f => {
      const arr = f[field as keyof typeof f] as string[]
      return { ...f, [field]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { error } = await supabase.from('incidents').insert([{
      reporter_name: form.reporter_name,
      reporter_email: form.reporter_email,
      reporter_phone: form.reporter_phone,
      pilot_name: form.pilot_anonymous ? 'Anonymous' : form.pilot_name,
      pilot_anonymous: form.pilot_anonymous,
      pilot_rating: form.pilot_rating,
      date: form.date,
      time_of_day: form.time_of_day,
      country: form.country,
      province: form.province,
      site: form.site,
      location: form.location,
      aircraft_type: form.aircraft_type,
      manufacturer: form.manufacturer,
      model: form.model,
      certification: form.certification,
      pilot_injury: form.pilot_injury,
      passenger_injury: form.passenger_injury,
      injury_description: form.injury_description,
      damage: form.damage,
      description: form.description,
      prevention: form.prevention,
      live: false,
      summary: '',
      tags: [],
    }])
    setSubmitting(false)
    if (!error) setSubmitted(true)
    else console.error(error)
  }

  const Pill = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${selected ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
      {label}
    </button>
  )

  if (submitted) return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
        <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
        <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
        <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
        <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
      </nav>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Report submitted</h1>
        <p className="text-gray-500 mb-6">Thank you for contributing to the SafeFreeFlight community. Your report has been received and will be reviewed before publication.</p>
        <Link href="/" className="bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-blue-900">Back to database</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
        <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
        <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
        <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
        <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Submit an occurrence report</h1>
          <p className="text-gray-500 text-sm">SafeFreeFlight — confidential, non-punitive reporting</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-6">
          🛡️ This is a non-punitive system. Only personal identifying information is ever withheld from published reports. Location, aircraft, and incident details are always included as they are essential for community learning.
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Reporter','Pilot','Occurrence','Aircraft','Injury','Narrative','Publication'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${step === i+1 ? 'bg-blue-800 text-white' : step > i+1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i+1 ? '✓' : i+1}
              </div>
              {i < 6 && <div className={`h-0.5 flex-1 ${step > i+1 ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">

          {/* Step 1: Reporter */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Reporter</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us who is filing this report. This information is kept private and never published.</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">First name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.reporter_name.split(' ')[0]} onChange={e => update('reporter_name', e.target.value + ' ' + form.reporter_name.split(' ').slice(1).join(' '))} placeholder="Jane" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Last name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.reporter_name.split(' ').slice(1).join(' ')} onChange={e => update('reporter_name', form.reporter_name.split(' ')[0] + ' ' + e.target.value)} placeholder="Smith" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.reporter_email} onChange={e => update('reporter_email', e.target.value)} placeholder="name@example.com" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.reporter_phone} onChange={e => update('reporter_phone', e.target.value)} placeholder="+1 (506) 234-5678" /></div>
              </div>
            </div>
          )}

          {/* Step 2: Pilot */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Pilot in command</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us about the pilot involved in the occurrence.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">First name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.pilot_name.split(' ')[0]} onChange={e => update('pilot_name', e.target.value + ' ' + form.pilot_name.split(' ').slice(1).join(' '))} placeholder="Jane" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Last name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.pilot_name.split(' ').slice(1).join(' ')} onChange={e => update('pilot_name', form.pilot_name.split(' ')[0] + ' ' + e.target.value)} placeholder="Smith" /></div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 block mb-2">HPAC ratings (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {RATINGS.map(r => <Pill key={r} label={r} selected={form.pilot_rating.includes(r)} onClick={() => toggleArray('pilot_rating', r)} />)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">Keep pilot name anonymous</div>
                  <div className="text-xs text-gray-500">Name will appear as "Anonymous" in the published report</div>
                </div>
                <button type="button" onClick={() => update('pilot_anonymous', !form.pilot_anonymous)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.pilot_anonymous ? 'bg-blue-800' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.pilot_anonymous ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Occurrence */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Occurrence details</h2>
              <p className="text-sm text-gray-500 mb-4">When and where did the occurrence happen?</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.date} onChange={e => update('date', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Time of day</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white" value={form.time_of_day} onChange={e => update('time_of_day', e.target.value)}>
                    <option value="">Select…</option>
                    {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Site / location name</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.site} onChange={e => update('site', e.target.value)} placeholder="e.g. Mount Woodside" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Specific location</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. North launch" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Country</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.country} onChange={e => update('country', e.target.value)} placeholder="Canada" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Province / region</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.province} onChange={e => update('province', e.target.value)} placeholder="e.g. British Columbia, or state/region if international" /></div>
              </div>
            </div>
          )}

          {/* Step 4: Aircraft */}
          {step === 4 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Aircraft</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us about the aircraft involved.</p>
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 block mb-2">Type (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {AIRCRAFT_TYPES.map(t => <Pill key={t} label={t} selected={form.aircraft_type.includes(t)} onClick={() => toggleArray('aircraft_type', t)} />)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Manufacturer</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.manufacturer} onChange={e => update('manufacturer', e.target.value)} placeholder="e.g. Ozone" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Model</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.model} onChange={e => update('model', e.target.value)} placeholder="e.g. Rush 6" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Certification</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={form.certification} onChange={e => update('certification', e.target.value)} placeholder="e.g. EN B" /></div>
              </div>
            </div>
          )}

          {/* Step 5: Injury */}
          {step === 5 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Injury & damage</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us about any injuries or damage.</p>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">Pilot injury</label>
                  <div className="flex flex-col gap-2">
                    {INJURY_OPTIONS.map(o => (
                      <button key={o} type="button" onClick={() => update('pilot_injury', o)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${form.pilot_injury === o ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">Passenger injury</label>
                  <div className="flex flex-col gap-2">
                    {['No passenger / N/A', ...INJURY_OPTIONS].map(o => (
                      <button key={o} type="button" onClick={() => update('passenger_injury', o)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${form.passenger_injury === o ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Injury description</label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" rows={3} value={form.injury_description} onChange={e => update('injury_description', e.target.value)} placeholder="Describe any injuries…" /></div>
                <div><label className="text-xs font-medium text-gray-500 block mb-1">Damage to aircraft / property</label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" rows={3} value={form.damage} onChange={e => update('damage', e.target.value)} placeholder="Describe any damage…" /></div>
              </div>
            </div>
          )}

          {/* Step 6: Narrative */}
          {step === 6 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Narrative</h2>
              <p className="text-sm text-gray-500 mb-4">The most important part of the report. Be as detailed as you can.</p>
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 block mb-1">Description of occurrence</label>
                <p className="text-xs text-gray-400 mb-2">Include your role, preflight conditions, weather, distractions, emotions, and your thoughts on the causes.</p>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" rows={7} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe what happened in as much detail as you can…" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Action & prevention</label>
                <p className="text-xs text-gray-400 mb-2">What actions were taken after the occurrence? What would you recommend to prevent similar incidents?</p>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" rows={4} value={form.prevention} onChange={e => update('prevention', e.target.value)} placeholder="Actions taken and prevention recommendations…" />
              </div>
            </div>
          )}

          {/* Step 7: Publication */}
          {step === 7 && (
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Publication & consent</h2>
              <p className="text-sm text-gray-500 mb-4">Control how your report is shared with the community.</p>
              <div className="flex flex-col gap-3">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Publish report to the community database</div>
                      <div className="text-xs text-gray-500">Location, site, date, aircraft, and incident details will all be included. Only personal names and contact info are withheld. This helps the whole community learn and stay safer.</div>
                    </div>
                    <button type="button" onClick={() => update('publish', !form.publish)}
                      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${form.publish ? 'bg-blue-800' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.publish ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className={`mt-3 text-xs font-medium ${form.publish ? 'text-blue-800' : 'text-gray-400'}`}>
                    {form.publish ? '✓ Yes, publish this report' : 'No — report will be kept private (safety committee only)'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Include pilot name in published report</div>
                      <div className="text-xs text-gray-500">Some pilots choose to be identified to add accountability and context. Either way the report is equally valuable.</div>
                    </div>
                    <button type="button" onClick={() => update('pilot_anonymous', !form.pilot_anonymous)}
                      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${!form.pilot_anonymous ? 'bg-blue-800' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!form.pilot_anonymous ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className={`mt-3 text-xs font-medium ${!form.pilot_anonymous ? 'text-blue-800' : 'text-gray-400'}`}>
                    {!form.pilot_anonymous ? '✓ Yes — pilot name will be included' : 'No — pilot name will appear as Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
            ) : <div />}
            {step < 7 ? (
              <button type="button" onClick={() => setStep(s => s + 1)}
                className="bg-blue-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900">Continue →</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="bg-blue-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50">
                {submitting ? 'Submitting…' : '🪂 Submit report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}