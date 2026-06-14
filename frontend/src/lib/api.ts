// In production, use the provided environment variable or fallback to your Render URL.
// In development, always default to localhost:4000.
const BASE = process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://skillnora-backend.onrender.com') 
    : 'http://localhost:4000';

export async function api(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...opts,
    })
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
    return res.json()
}

export default { api }
