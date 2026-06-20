import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import coursesRoutes from './features/courses/routes.js'
import paymentsRoutes from './features/payments/routes.js'
import uploadRoutes from './features/upload/routes.js'
import aiRoutes from './features/ai/routes.js'
import enrollRoutes from './features/enroll/routes.js'
import authRoutes from './features/auth/routes.js'

dotenv.config({ path: '../.env' })

const app = express()
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))

app.use(express.json({ limit: '5mb' }))

import raw from 'body-parser'
app.use('/api/payments/webhook', raw.raw({ type: '*/*' }))

app.use('/api/payments/webhook', (req, _res, next) => {
    try {
        if (req && req.body && Buffer.isBuffer(req.body)) req.bodyRaw = req.body.toString('utf8')
    } catch (e) { /* ignore */ }
    next()
})

app.use('/api/courses', coursesRoutes)
app.use('/api/payments', paymentsRoutes)
import { uploadApi } from './features/upload/uploadApi.js'
app.use('/api/upload', uploadRoutes)
app.use('/api/upload', uploadApi)
app.use('/api/ai', aiRoutes)
app.use('/api/enroll', enrollRoutes)
app.use('/api/auth', authRoutes)
import { commentsApi } from './features/comments/commentsApi.js'
app.use('/api/comments', commentsApi)

app.get('/health', (_req, res) => res.json({ ok: true }))

const PORT = process.env.BACKEND_PORT || 4000
app.listen(PORT, () => console.log(`Backend API listening on http://localhost:${PORT}`))
