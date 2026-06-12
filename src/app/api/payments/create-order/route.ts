import { NextResponse } from 'next/server'
import razorpay from '../../../../lib/razorpay'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const amount = Number(body.amount ?? 0)
        if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

        // Razorpay expects amount in smallest currency unit (paise for INR)
        const amountInPaise = Math.round(amount * 100)

        const options = {
            amount: amountInPaise,
            currency: body.currency || 'INR',
            receipt: body.receipt || `rcpt_${Date.now()}`,
            payment_capture: 1,
            notes: body.notes || {}
        }

        const order = await razorpay.orders.create(options)

        // persist order in DB (best-effort)
        try {
            await (await import('../../../../lib/supabaseServer')).supabaseServer
                .from('orders')
                .insert({
                    razorpay_order_id: order.id,
                    user_id: body.user_id ?? null,
                    course_id: body.course_id ?? null,
                    amount: amount,
                    currency: options.currency,
                    status: 'created',
                    receipt: options.receipt
                })
        } catch (e) {
            // do not fail the flow if DB persist fails
            console.warn('Failed to persist order in DB', e)
        }

        return NextResponse.json({ order })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
