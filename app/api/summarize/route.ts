import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { description, prevention, site, country, severity, pilot_injury } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are writing a concise summary for a paragliding/hang gliding safety incident report. Write exactly 2-3 sentences that capture the key facts: what happened, the outcome, and the primary lesson. Be factual and direct. Do not use the pilot's name. Do not start with "A pilot" every time — vary the opening.

Site: ${site}, ${country}
Severity: ${severity}
Injury: ${pilot_injury}
Description: ${description}
Prevention: ${prevention}

Write only the summary, nothing else.`
        }
      ]
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Summary generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}