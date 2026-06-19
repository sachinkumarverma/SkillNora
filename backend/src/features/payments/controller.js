import * as service from './service.js'

const createOrder = async (req, res) => {
    try {
        const payload = req.body
        const order = await service.createOrder(payload)
        res.json({ order })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

const webhook = async (req, res) => {
    try {
        const raw = req.bodyRaw || JSON.stringify(req.body)
        const headers = req.headers
        await service.handleWebhook(raw, headers)
        res.json({ ok: true })
    } catch (err) { res.status(400).json({ error: String(err) }) }
}

const simulate = async (_req, res) => {
    try {
        // Create a fake payment event similar to Razorpay payload
        const fake = {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: `pay_fake_${Date.now()}`,
                        order_id: `fake_order_` + Date.now(),
                        status: 'captured',
                        amount: 100
                    }
                }
            }
        }
        const raw = JSON.stringify(fake)
        // compute signature using configured secret so handler accepts it
        const secret = process.env.RAZORPAY_KEY_SECRET || ''
        let headers = {}
        if (secret) {
            const crypto = await import('crypto')
            const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex')
            headers['x-razorpay-signature'] = sig
        }
        await service.handleWebhook(raw, headers)
        res.json({ ok: true, fake })
    } catch (err) { res.status(500).json({ error: String(err) }) }
}

export { createOrder, webhook, simulate };
