import { supabase } from '../../lib/supabase.js'
import crypto from 'crypto'
import Razorpay from 'razorpay'

const RZ_ID = process.env.RAZORPAY_KEY_ID
const RZ_SECRET = process.env.RAZORPAY_KEY_SECRET
let razor = null
if (RZ_ID && RZ_SECRET) {
    try { razor = new Razorpay({ key_id: RZ_ID, key_secret: RZ_SECRET }) } catch (e) { console.warn('Failed to init Razorpay client', e) }
}

export async function createOrder(payload) {
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
        await supabase.from('orders').insert({ razorpay_order_id: order.id, user_id: payload.user_id ?? null, course_id: payload.course_id ?? null, amount: payload.amount, currency: options.currency, status: 'created', receipt: options.receipt })
    } catch (e) { console.warn('Failed to persist order', e) }

    return order
}

export async function handleWebhook(rawBody, headers) {
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
        try { await supabase.from('orders').update({ status }).eq('razorpay_order_id', rpOrderId) } catch (e) { console.warn('Failed to update order', e) }
        // If paid, create enrollment
        if (status === 'captured' || status === 'paid') {
            try {
                const orderRow = await supabase.from('orders').select('*').eq('razorpay_order_id', rpOrderId).maybeSingle()
                if (orderRow.data && orderRow.data.user_id && orderRow.data.course_id) {
                    await supabase.from('enrollments').insert({ user_id: orderRow.data.user_id, course_id: orderRow.data.course_id })
                }
            } catch (e) { console.warn('Failed to create enrollment after payment', e) }
        }
    }
}
