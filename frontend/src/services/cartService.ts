import apiClient from '@/lib/apiClient'

const getCart = async () => {
    try {
        const res = await apiClient.get('/api/cart')
        return res.data.cart || []
    } catch {
        return []
    }
}

const addToCart = async (courseId: string) => {
    await apiClient.post('/api/cart', { course_id: courseId })
    window.dispatchEvent(new Event('cartUpdated'))
}

const removeFromCart = async (courseId: string) => {
    await apiClient.delete(`/api/cart/${courseId}`)
    window.dispatchEvent(new Event('cartUpdated'))
}

const clearCart = async () => {
    await apiClient.delete('/api/cart')
    window.dispatchEvent(new Event('cartUpdated'))
}

export const cartService = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
}
