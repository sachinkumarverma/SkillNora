import { supabase } from '../../lib/supabase.js'

export async function profile(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data, error } = await supabase.auth.getUser(token)
        if (error) return res.status(401).json({ error: error.message })
        res.json({ user: data.user })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}
