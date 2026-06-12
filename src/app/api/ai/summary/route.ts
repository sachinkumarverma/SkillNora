import { NextResponse } from 'next/server'
import { generateSummary } from '../../../../lib/openaiClient'

export async function POST(req: Request) {
    try {
        const { text } = await req.json()
        if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

        const data = await generateSummary(text)
        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
