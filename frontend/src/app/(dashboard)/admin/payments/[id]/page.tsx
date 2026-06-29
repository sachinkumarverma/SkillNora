"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function PaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [payment, setPayment] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await apiClient.get('/api/admin/payments')
                const found = res.data?.payments?.find((p: any) => String(p.id) === String(id))
                setPayment(found)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPayment()
    }, [id])

    if (loading) return <Loader type="receipt" />

    if (!payment) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 text-center">
                <h1 className="text-2xl font-bold">Payment not found</h1>
                <Link href="/admin/payments" className="text-blue-600 hover:underline">Back to Payments</Link>
            </div>
        )
    }

    const handleDownloadReceipt = () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;
        
        const generatePdf = () => {
            const opt = {
                margin:       [0.5, 0.5, 0.5, 0.5],
                filename:     `SkillNora_Receipt_${payment.transaction_id || payment.id}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            (window as any).html2pdf().set(opt).from(element).save();
        };

        if ((window as any).html2pdf) {
            generatePdf();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = generatePdf;
            document.body.appendChild(script);
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <motion.div 
                id="receipt-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm max-w-2xl mx-auto overflow-hidden"
            >

                <div className="relative z-10 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-[#113a5f] dark:text-white mb-2">Invoice Receipt</h1>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            payment.status === 'created' || payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                            payment.status === 'refunded' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                            'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'created' || payment.status === 'paid' ? 'bg-emerald-500' : payment.status === 'refunded' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            {payment.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-right flex items-center justify-end gap-3 text-3xl font-bold text-[#113a5f] dark:text-white">
                        <span className="bg-[#113a5f] text-white px-3 py-1 rounded-lg shadow-sm text-2xl flex items-center justify-center">S</span>
                        Skillnora
                    </div>
                </div>

                <div className="relative z-10 bg-[#113a5f] dark:bg-slate-800 text-white rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4 mb-6 shadow-sm">
                    <div><strong className="text-blue-200 dark:text-slate-400">Invoice Number:</strong> {payment.transaction_id || payment.id}</div>
                    <div><strong className="text-blue-200 dark:text-slate-400">Invoice Date:</strong> {payment.date}</div>
                </div>

                <div className="relative z-10 border-b-2 border-dotted border-slate-300 dark:border-slate-700 mb-6"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-[#113a5f] dark:text-white mb-3">Billing Information:</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                            <p><strong className="text-slate-800 dark:text-slate-300">Company Name:</strong> Skillnora Inc.</p>
                            <p><strong className="text-slate-800 dark:text-slate-300">Email:</strong> support@skillnora.com</p>
                            <p><strong className="text-slate-800 dark:text-slate-300">Website:</strong> www.skillnora.com</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#113a5f] dark:text-white mb-3">Bill To:</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                            <p><strong className="text-slate-800 dark:text-slate-300">Customer Name:</strong> {payment.user_name}</p>
                            <p><strong className="text-slate-800 dark:text-slate-300">Email:</strong> {payment.user_email || 'Provided at checkout'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mb-8">
                    <h3 className="text-lg font-bold text-[#113a5f] dark:text-white mb-4">Course Details:</h3>
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#54b7ae] text-white">
                                <tr>
                                    <th className="p-3 font-bold">No</th>
                                    <th className="p-3 font-bold">Item Description</th>
                                    <th className="p-3 font-bold">Access</th>
                                    <th className="p-3 font-bold text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                <tr>
                                    <td className="p-3">1</td>
                                    <td className="p-3 font-semibold">{payment.course_title}</td>
                                    <td className="p-3">Lifetime Access</td>
                                    <td className="p-3 text-right font-bold">₹{Math.abs(Number(payment.amount))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="relative z-10 flex justify-end mb-10">
                    <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-blue-800/20 bg-[#113a5f] text-white">
                                <tr>
                                    <td className="p-3 font-medium text-blue-100">Subtotal</td>
                                    <td className="p-3 text-right font-bold">₹{Math.abs(Number(payment.amount))}</td>
                                </tr>
                                <tr className="bg-[#0c2944]">
                                    <td className="p-3 font-bold text-lg">Total Amount Paid</td>
                                    <td className="p-3 text-right font-black text-lg">₹{Math.abs(Number(payment.amount))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div>
                        <h3 className="text-lg font-bold text-[#113a5f] dark:text-white mb-3">Payment Information:</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                            <p><strong className="text-slate-800 dark:text-slate-300">Payment Method:</strong> Razorpay Gateway</p>
                            <p><strong className="text-slate-800 dark:text-slate-300">Status:</strong> {payment.status === 'refunded' ? 'Refunded successfully' : 'Paid successfully'}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#113a5f] dark:text-white mb-3">Terms and Conditions:</h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                            <li>Thank you for choosing Skillnora!</li>
                            <li>You can cancel any course within 30 days to get a partial refund.</li>
                            <li>The refund amount will be calculated by deducting the consumed days.</li>
                        </ul>
                    </div>
                </div>

                <div className="relative z-10 flex justify-end text-center mb-8">
                    <div>
                        <div className="text-sm text-slate-500 mb-2">Date: {payment.date}</div>
                        <div className="font-serif italic text-3xl text-slate-300 dark:text-slate-600 mb-1">Skillnora</div>
                        <div className="border-t border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-400 pt-1 px-4">Skillnora Inc.</div>
                    </div>
                </div>

                <div className="relative z-10 bg-[#113a5f] dark:bg-slate-800 text-white rounded-lg p-4 flex flex-col sm:flex-row justify-between text-sm shadow-sm opacity-90">
                    <div>support@skillnora.com</div>
                    <div>www.skillnora.com</div>
                </div>

                <div data-html2canvas-ignore className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center flex justify-center gap-4">
                    <button onClick={handleDownloadReceipt} className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm text-sm hover:opacity-90 transition-opacity">
                        Download Receipt
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
