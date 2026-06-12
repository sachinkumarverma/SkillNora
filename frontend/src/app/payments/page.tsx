"use client"
import React, { useState } from 'react'
import api from '../../lib/api'

export default function PaymentsPage() {
    const [amount, setAmount] = useState('49')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function createOrder(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        try {
            const payload = { amount: Number(amount), currency: 'INR' }
            const res = await api.api('/api/payments/create-order', { method: 'POST', body: JSON.stringify(payload) })
            setResult(res)
        } catch (err: any) {
            setResult({ error: String(err) })
        } finally { setLoading(false) }
    }

    async function simulateWebhook() {
        setLoading(true)
        setResult(null)
        try {
            const res = await api.api('/api/payments/simulate', { method: 'POST' })
            setResult(res)
        } catch (err: any) {
            setResult({ error: String(err) })
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto mt-12">
            <div className="p-6 rounded-xl glass">
                <h2 className="text-2xl font-semibold">Payments (dev)</h2>
                <form className="mt-4 flex gap-2 items-center" onSubmit={createOrder}>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} className="p-3 rounded-md border w-32" />
                    <button disabled={loading} className="btn btn-primary">Create Order</button>
                    <button type="button" onClick={simulateWebhook} disabled={loading} className="btn btn-outline">Simulate webhook</button>
                </form>

                {result && (
                    <pre className="mt-4 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
                )}
            </div>
        </div>
    )
}
