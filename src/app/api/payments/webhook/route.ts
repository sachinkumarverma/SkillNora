import { NextResponse } from 'next/server'
import crypto from 'crypto'

const secret = process.env.RAZORPAY_KEY_SECRET || ''

export async function POST(req: Request) {
    const raw = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    if (!secret) {
        return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 })
    }

    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    try {
        const event = JSON.parse(raw)
        // handle payment events: payment.captured, payment.failed, order.paid etc.
        const type = event.event || event.event_type || ''
        // update orders table by razorpay_order_id when order paid
        if (event.payload?.payment && event.payload.payment.entity) {
            const payment = event.payload.payment.entity
            // payment.order_id
            const rpOrderId = payment.order_id
            const status = payment.status || 'unknown'
            try {
                const { supabaseServer } = await import('../../../../lib/supabaseServer')
                await supabaseServer.from('orders').update({ status }).eq('razorpay_order_id', rpOrderId)
            } catch (e) {
                console.warn('Failed to update order status in DB', e)
            }
        }

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 400 })
    }
}
