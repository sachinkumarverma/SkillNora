"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import useUser from '@/lib/useUser'
import apiClient from '@/lib/apiClient'
import { useRouter } from 'next/navigation'
import { cartService } from '@/services/cartService'

import Loader from '@/components/ui/Loader'

export default function CartPage() {
    const [cart, setCart] = useState<any[]>([])
    const { user, loading: userLoading } = useUser()
    const router = useRouter()
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userLoading) return;
        setLoading(true)
        if (user) {
            Promise.all([
                cartService.getCart(),
                apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] }))
            ]).then(async ([cartData, enrollmentsData]) => {
                const enrolledIds = new Set(enrollmentsData.enrolledIds || [])
                let updatedCart = cartData
                
                // Find items that are already enrolled
                const itemsToRemove = cartData.filter((item: any) => enrolledIds.has(item.id || item.course_id))
                
                if (itemsToRemove.length > 0) {
                    // Remove them silently from the backend
                    for (const item of itemsToRemove) {
                        await cartService.removeFromCart(item.id || item.course_id)
                    }
                    // Get the fresh cart after removal
                    updatedCart = await cartService.getCart()
                }
                
                setCart(updatedCart)
                setLoading(false)
            })
        } else {
            setCart([])
            setLoading(false)
        }
    }, [user, userLoading])

    const removeFromCart = async (id: string) => {
        if (user) {
            await cartService.removeFromCart(id)
            setCart(await cartService.getCart())
        }
    }

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const priceStr = String(item.price).replace(/[^0-9.]/g, '')
            return total + (Number(priceStr) || 0)
        }, 0)
    }

    const handleCheckout = async () => {
        if (!user) return router.push('/auth')
        if (cart.length === 0) return
        setIsCheckingOut(true)

        try {
            const totalAmount = calculateTotal()
            
            // Generate dummy order ID for now
            const orderId = 'order_' + crypto.randomUUID().substring(0, 8)
            
            const enrollmentsToInsert = cart.map(item => ({
                course_id: item.id || item.course_id,
                price: item.price
            }))
            
            // Send to backend to record order and enroll
            await apiClient.post('/api/payments/record-order-and-enroll', {
                orderId,
                totalAmount,
                enrollments: enrollmentsToInsert
            });

            // Clear cart
            if (user) {
                await cartService.clearCart()
            }
            setCart([])
            
            alert('Payment successful! You are now enrolled in these courses.')
            router.push('/enrolled')
        } catch (err: any) {
            console.error('Checkout error:', err)
            alert('Failed to checkout: ' + err.message)
        } finally {
            setIsCheckingOut(false)
        }
    }

    if (loading || userLoading) {
        return <Loader />
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-8">Your Cart</h1>
            
            {cart.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-6">Looks like you haven't added any courses to your cart yet.</p>
                    <Link href="/courses" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block">Browse Courses</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                                <Link href={`/courses/${item.slug}/${item.id}`} className="w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 block">
                                    <img src={item.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600'} alt="" className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:gap-4">
                                        <Link href={`/courses/${item.slug}/${item.id}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-base sm:text-lg line-clamp-2 mb-1 sm:mb-0">{item.title}</Link>
                                        <div className="font-black text-slate-900 dark:text-white shrink-0 text-base sm:text-lg">{item.price}</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm text-slate-500">1 Year Access</div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
                            <div className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span className="text-slate-900 dark:text-white">₹{calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>- ₹0</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                <span className="text-3xl font-black text-slate-900 dark:text-white">₹{calculateTotal().toLocaleString()}</span>
                            </div>
                            
                            <button 
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-transform transform active:scale-95 disabled:opacity-70 disabled:pointer-events-none shadow-sm flex items-center justify-center gap-2"
                            >
                                {isCheckingOut && (
                                    <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {isCheckingOut ? 'Processing Checkout...' : 'Checkout All Courses'}
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">By proceeding, you agree to our terms of service and automatically enroll in the selected courses.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
