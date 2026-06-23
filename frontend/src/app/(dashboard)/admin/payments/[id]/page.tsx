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

    if (loading) return <Loader />

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
            <Link href="/admin/payments" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 inline-block">&larr; Back to Payments</Link>
            
            <motion.div 
                id="receipt-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm max-w-2xl mx-auto overflow-hidden"
            >
                {/* Skillnora watermark */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] dark:opacity-[0.02]">
                    <img 
                        src="/logo.png" 
                        alt="" 
                        className="w-[80%] h-[80%] object-contain"
                    />
                </div>
                
                <div className="relative z-10 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Receipt</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Transaction: {payment.transaction_id || payment.id}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-1.5 ${
                            payment.status === 'created' || payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                            payment.status === 'Failed' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                            'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'created' || payment.status === 'paid' ? 'bg-emerald-500' : payment.status === 'Failed' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            {payment.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Billed To</p>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{payment.user_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{payment.date}</p>
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Course Purchased</p>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{payment.course_title}</p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
                        <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Amount Paid</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">Rs. {payment.amount}</p>
                    </div>
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
