import { supabase } from '../../lib/supabase.js'
import { query } from '../../config/db.js'
import crypto from 'crypto'
import Razorpay from 'razorpay'

const RZ_ID = process.env.RAZORPAY_KEY_ID
const RZ_SECRET = process.env.RAZORPAY_KEY_SECRET
let razor = null

if (RZ_ID && RZ_SECRET) {
    try { razor = new Razorpay({ key_id: RZ_ID, key_secret: RZ_SECRET }) } catch (e) { console.warn('Failed to init Razorpay client', e) }
}

const createOrder = async (payload) => {
    const amount = Math.round(Number(payload.amount) * 100)
    if (!amount || amount <= 0) throw new Error('Invalid amount')
    const options = { amount, currency: payload.currency || 'INR', receipt: payload.receipt || `rcpt_${Date.now()}`, payment_capture: 1 }

    let order
    if (razor) {
        order = await razor.orders.create(options)
    } else {
        // Local dev fallback: create a fake order object
        order = { id: `fake_order_${Date.now()}`, ...options }
    }

    try {
        await query(
            'INSERT INTO orders (razorpay_order_id, user_id, course_id, amount, currency, status, receipt) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [order.id, payload.user_id ?? null, payload.course_id ?? null, payload.amount, options.currency, 'created', options.receipt]
        )
    } catch (e) { console.warn('Failed to persist order', e) }

    return order
}

const handleWebhook = async (rawBody, headers) => {
    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    const signature = headers['x-razorpay-signature'] || headers['X-Razorpay-Signature'] || ''

    // If secret configured, validate signature. Otherwise allow (dev mode) but warn.
    if (secret) {
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
        if (signature !== expected) throw new Error('Invalid signature')
    } else {
        console.warn('Razorpay secret not configured — accepting webhook in dev mode')
    }

    const event = JSON.parse(rawBody)
    const payment = event.payload?.payment?.entity
    if (payment) {
        const rpOrderId = payment.order_id
        const status = payment.status || 'unknown'
        try { await query('UPDATE orders SET status = $1 WHERE razorpay_order_id = $2', [status, rpOrderId]) } catch (e) { console.warn('Failed to update order', e) }
        // If paid, create enrollment
        if (status === 'captured' || status === 'paid') {
            try {
                const orderRes = await query('SELECT * FROM orders WHERE razorpay_order_id = $1', [rpOrderId])
                if (orderRes.rows.length > 0) {
                    const orderRow = orderRes.rows[0]
                    if (orderRow.user_id && orderRow.course_id) {
                        await query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [orderRow.user_id, orderRow.course_id])
                    }
                }
            } catch (e) { console.warn('Failed to create enrollment after payment', e) }
        }
    }
}

export { createOrder, handleWebhook };
