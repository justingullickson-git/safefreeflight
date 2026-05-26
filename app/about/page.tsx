import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg mr-6"><span>🪂</span> SafeFreeFlight</div>
        <Link href="/" className="text-blue-200 hover:text-white text-sm">Database</Link>
        <Link href="/analytics" className="text-blue-200 hover:text-white text-sm">Analytics</Link>
        <Link href="/discussion" className="text-blue-200 hover:text-white text-sm">Discussion</Link>
        <Link href="/about" className="text-white text-sm font-medium">About</Link>
        <Link href="/submit" className="ml-auto bg-white text-blue-800 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
          Report an occurrence
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-xl">🪂</div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">SafeFreeFlight</h1>
              <p className="text-gray-500 text-sm">Canadian Free Flight Safety Database</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            SafeFreeFlight is a community-driven accident and incident database for Canadian free flight pilots — paragliders, hang gliders, speedflyers, and mini-wing pilots. It exists for one reason: to help pilots learn from each other's experiences so we can all fly safer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10">

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">🛡️ Non-punitive reporting</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              SafeFreeFlight operates on a non-punitive reporting philosophy — the same principle used by aviation safety agencies worldwide. The intent is never to assign blame or embarrass pilots. Accidents and incidents happen to experienced, skilled pilots. What matters is that the community learns from them.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              Pilot names are always optional. You can submit a report completely anonymously, or choose to be identified. Either way, your report is equally valuable.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">🔒 Privacy & data use</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reporter contact information (name, email, phone) is kept strictly private and is only used if the safety committee needs to follow up on a report. It is never published or shared.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              Location, site, date, aircraft details, and incident descriptions are published because they are essential for community learning. A report that omits the site or conditions is far less useful to pilots who fly those areas.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              All reports are reviewed before publication. You will always be contacted before your report goes live if we have questions.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">📋 What to report</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Accidents</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Serious injury or fatality</li>
                  <li>• Significant damage to aircraft</li>
                  <li>• Reserve deployments</li>
                  <li>• Tree or terrain contact</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Incidents</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Minor injury or near miss</li>
                  <li>• Equipment failures</li>
                  <li>• Collapses or unusual flight</li>
                  <li>• Anything others should know about</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              When in doubt, report it. An incident that seems minor to you may be exactly what another pilot needs to read.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">🇨🇦 About HPAC reporting</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              SafeFreeFlight is an independent community tool and is not affiliated with HPAC/ACVL. However, we strongly encourage pilots to also file reports with the official HPAC safety reporting system at <a href="https://www.hpac.ca" target="_blank" className="text-blue-600 hover:underline">hpac.ca</a>. Official reports contribute to national safety statistics and regulatory oversight.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              SafeFreeFlight exists to complement HPAC reporting with a searchable, community-focused database where pilots can read, discuss, and learn from incidents in detail.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">🌎 International reports</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Although SafeFreeFlight is a Canadian initiative, we welcome incident reports from anywhere in the world. Canadian pilots travel frequently to fly internationally, and incidents that happen abroad are just as valuable to the community. Reports are tagged by country so you can filter by location.
            </p>
          </div>

        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">📬 Contact</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Have a question, want to flag a report, or interested in getting involved with SafeFreeFlight? We would love to hear from you.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span>✉️</span>
              <a href="mailto:safety@safefreeflight.ca" className="text-blue-600 hover:underline">safety@safefreeflight.ca</a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span>🔗</span>
              <a href="https://www.hpac.ca/safety" target="_blank" className="text-blue-600 hover:underline">HPAC Safety Committee</a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-900 inline-block mr-3">
            Submit a report
          </Link>
          <Link href="/" className="bg-white text-gray-700 px-6 py-3 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-400 inline-block">
            Browse the database
          </Link>
        </div>

      </div>
    </main>
  )
}
