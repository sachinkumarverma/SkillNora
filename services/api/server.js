import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

dotenv.config({ path: '../../.env' })

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })

const razor = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })

app.get('/health', (_req, res) => res.json({ ok: true }))

// Profile: validate token and return user
app.get('/api/profile', async (req, res) => {
    try {
        const auth = req.headers.authorization || ''
        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data, error } = await supabaseServer.auth.getUser(token)
        if (error) return res.status(401).json({ error: error.message })
        res.json({ user: data.user })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Courses list
app.get('/api/courses', async (_req, res) => {
    try {
        const { data, error } = await supabaseServer
            .from('courses')
            .select('id, title, slug, description, price, instructor_id, is_published, created_at')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(50)
        if (error) return res.status(500).json({ error: error.message })
        res.json({ courses: data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Create course (protected)
app.post('/api/courses', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return res.status(401).json({ error: 'Invalid token' })

        const body = req.body
        const instructorId = userData.user.id
        const { data: profile, error: profileErr } = await supabaseServer.from('users').select('role').eq('id', instructorId).single()
        if (profileErr || !profile) return res.status(403).json({ error: 'Instructor profile not found' })
        if (profile.role !== 'instructor' && profile.role !== 'admin') return res.status(403).json({ error: 'Only instructors can create courses' })

        const insert = {
            instructor_id: instructorId,
            title: body.title,
            slug: body.slug,
            description: body.description || null,
            price: body.price ?? 0,
            is_published: body.is_published ?? false
        }
        const { data, error } = await supabaseServer.from('courses').insert(insert).select().single()
        if (error) return res.status(500).json({ error: error.message })
        res.json({ course: data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Course detail
app.get('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { data, error } = await supabaseServer.from('courses').select('*, lectures(*)').eq('id', id).single()
        if (error) return res.status(404).json({ error: error.message })
        res.json({ course: data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Update course
app.put('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return res.status(401).json({ error: 'Invalid token' })
        const body = req.body
        const { data: course } = await supabaseServer.from('courses').select('instructor_id').eq('id', id).single()
        if (!course) return res.status(404).json({ error: 'Course not found' })
        if (course.instructor_id !== userData.user.id) return res.status(403).json({ error: 'Forbidden' })
        const { data, error } = await supabaseServer.from('courses').update(body).eq('id', id).select().single()
        if (error) return res.status(500).json({ error: error.message })
        res.json({ course: data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Delete course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return res.status(401).json({ error: 'Invalid token' })
        const { data: course } = await supabaseServer.from('courses').select('instructor_id').eq('id', id).single()
        if (!course) return res.status(404).json({ error: 'Course not found' })
        if (course.instructor_id !== userData.user.id) return res.status(403).json({ error: 'Forbidden' })
        const { error } = await supabaseServer.from('courses').delete().eq('id', id)
        if (error) return res.status(500).json({ error: error.message })
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Upload signed url
app.post('/api/upload-url', async (req, res) => {
    try {
        const { bucket = 'course-thumbnails', filePath } = req.body
        if (!filePath) return res.status(400).json({ error: 'filePath required' })
        const { data, error } = await supabaseServer.storage.from(bucket).createSignedUploadUrl(filePath, 60)
        if (error) return res.status(500).json({ error: error.message })
        res.json({ uploadUrl: data.signedUploadUrl, publicPath: data.filePath })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Payments: create razorpay order
app.post('/api/payments/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, user_id = null, course_id = null } = req.body
        const amt = Math.round(Number(amount) * 100)
        if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' })
        const options = { amount: amt, currency, receipt: receipt || `rcpt_${Date.now()}`, payment_capture: 1, notes: {} }
        const order = await razor.orders.create(options)
        try {
            await supabaseServer.from('orders').insert({ razorpay_order_id: order.id, user_id, course_id, amount, currency, status: 'created', receipt: options.receipt })
        } catch (e) { console.warn('Failed to persist order', e) }
        res.json({ order })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Payments webhook
app.post('/api/payments/webhook', express.text({ type: '*/*' }), async (req, res) => {
    try {
        const raw = req.body
        const signature = req.headers['x-razorpay-signature'] || ''
        const secret = process.env.RAZORPAY_KEY_SECRET || ''
        if (!secret) return res.status(500).json({ error: 'Razorpay secret not configured' })
        const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
        if (signature !== expected) return res.status(401).json({ error: 'Invalid signature' })
        const event = JSON.parse(raw)
        const payment = event.payload?.payment?.entity
        if (payment) {
            const rpOrderId = payment.order_id
            const status = payment.status || 'unknown'
            try { await supabaseServer.from('orders').update({ status }).eq('razorpay_order_id', rpOrderId) } catch (e) { console.warn('Failed to update order', e) }
        }
        res.json({ ok: true })
    } catch (err) { res.status(400).json({ error: String(err) }) }
})

// AI summary via OpenAI
app.post('/api/ai/summary', async (req, res) => {
    try {
        const { text } = req.body
        if (!text) return res.status(400).json({ error: 'text required' })
        const key = process.env.OPENAI_API_KEY
        if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
        const body = { model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' }, { role: 'user', content: `Summarize the following content in 3-5 bullet points:\n\n${text}` }], max_tokens: 250, temperature: 0.2 }
        const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) })
        if (!r.ok) { const txt = await r.text(); return res.status(500).json({ error: txt }) }
        const data = await r.json()
        res.json({ data })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

// Enroll (free courses)
app.post('/api/enroll', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null
        if (!token) return res.status(401).json({ error: 'Missing token' })
        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return res.status(401).json({ error: 'Invalid token' })
        const { course_id } = req.body
        if (!course_id) return res.status(400).json({ error: 'course_id required' })
        const { data: course } = await supabaseServer.from('courses').select('price').eq('id', course_id).single()
        if (!course) return res.status(404).json({ error: 'Course not found' })
        if (Number(course.price) === 0) {
            const { data, error } = await supabaseServer.from('enrollments').insert({ user_id: userData.user.id, course_id }).select().single()
            if (error) return res.status(500).json({ error: error.message })
            return res.json({ enrollment: data })
        }
        res.status(400).json({ message: 'Paid enrollments should use payments flow' })
    } catch (err) { res.status(500).json({ error: String(err) }) }
})

const PORT = process.env.API_PORT || 4000
app.listen(PORT, () => console.log(`Skillnora API running on http://localhost:${PORT}`))
