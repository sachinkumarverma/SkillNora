"use client"
import React, { useState } from 'react'
import api from '../../lib/api'
import DashboardLayout from '../../components/layouts/DashboardLayout'

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
        <DashboardLayout title="Payments" breadcrumbs={[{ label: 'Payments' }]}>
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Payments (Dev Mode)</h2>
                    <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={createOrder}>
                        <div className="w-full sm:w-auto">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Amount (INR)</label>
                            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full sm:w-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </div>
                        <button disabled={loading} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 whitespace-nowrap transition h-[48px]">Create Order</button>
                        <button type="button" onClick={simulateWebhook} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition h-[48px]">Simulate Webhook</button>
                    </form>

                    {result && (
                        <div className="mt-8 rounded-xl bg-slate-950 p-4 overflow-hidden">
                            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Response payload</div>
                            <pre className="text-sm text-slate-300 overflow-x-auto custom-scrollbar">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
