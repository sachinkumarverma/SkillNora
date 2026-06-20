import apiClient from '@/lib/apiClient'

const getWishlist = async () => {
    try {
        const res = await apiClient.get('/api/wishlist')
        return res.data.wishlist || []
    } catch {
        return []
    }
}

const addToWishlist = async (courseId: string) => {
    await apiClient.post('/api/wishlist', { course_id: courseId })
    window.dispatchEvent(new Event('wishlistUpdated'))
}

const removeFromWishlist = async (courseId: string) => {
    await apiClient.delete(`/api/wishlist/${courseId}`)
    window.dispatchEvent(new Event('wishlistUpdated'))
}

export const wishlistService = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
}
