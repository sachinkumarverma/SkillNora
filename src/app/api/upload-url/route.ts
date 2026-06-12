import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { bucket = 'course-thumbnails', filePath } = body
        if (!filePath) return NextResponse.json({ error: 'filePath is required' }, { status: 400 })

        // create a signed upload URL (server-side) — client should PUT the file to `uploadUrl`
        const { data, error } = await supabaseServer.storage
            .from(bucket)
            .createSignedUploadUrl(filePath, 60) // expires in 60s

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ uploadUrl: data.signedUploadUrl, publicPath: data.filePath })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
