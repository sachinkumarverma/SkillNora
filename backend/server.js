import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env', override: true })

import { usersApi } from './src/features/users/usersApi.js'
import { coursesApi } from './src/features/courses/coursesApi.js'
import { enrollmentsApi } from './src/features/enrollments/enrollmentsApi.js'
import { paymentsApi } from './src/features/payments/paymentsApi.js'
import { uploadApi } from './src/features/upload/uploadApi.js'
import { aiApi } from './src/features/ai/aiApi.js'
import { certificatesApi } from './src/features/certificates/certificatesApi.js'
import { commentsApi } from './src/features/comments/commentsApi.js'
import { statisticsApi } from './src/features/statistics/statisticsApi.js'

const app = express()

const allowedOrigins = [
    'http://localhost:7000',
    process.env.FRONTEND_URL,
    'https://skillnora.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') return next();
    express.json({ limit: '5mb' })(req, res, next);
});

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/users', usersApi)
app.use('/api/courses', coursesApi)
app.use('/api/enrollments', enrollmentsApi)
app.use('/api/upload', uploadApi)
app.use('/api/payments', paymentsApi)
app.use('/api/ai', aiApi)
app.use('/api/certificates', certificatesApi)
app.use('/api/comments', commentsApi)
app.use('/api/statistics', statisticsApi)

import { cartApi } from './src/features/cart/cartApi.js'
import { wishlistApi } from './src/features/wishlist/wishlistApi.js'
import { notesApi } from './src/features/notes/notesApi.js'
app.use('/api/cart', cartApi)
app.use('/api/wishlist', wishlistApi)
app.use('/api/notes', notesApi)

import { notificationsApi } from './src/features/notifications/notificationsApi.js'
app.use('/api/notifications', notificationsApi)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
