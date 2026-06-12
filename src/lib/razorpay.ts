import Razorpay from 'razorpay'

const keyId = process.env.RAZORPAY_KEY_ID || ''
const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

if (!keyId || !keySecret) {
    console.warn('Razorpay keys not set in env (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)')
}

const client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
})

export default client
