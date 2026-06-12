import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1] ?? null

    if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 })

    const { data, error } = await supabaseServer.auth.getUser(token)
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })

    // Return minimal profile info; server can join extended profile tables as needed
    return NextResponse.json({ user: data.user })
}
