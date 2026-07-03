import apiClient from '@/lib/apiClient'

let wishlistPromise: Promise<string[]> | null = null;
let wishlistCache: string[] | null = null;

const getWishlist = async (forceRefetch = false) => {
    if (!forceRefetch && wishlistCache !== null) {
        return wishlistCache;
    }
    if (!forceRefetch && wishlistPromise) {
        return wishlistPromise;
    }

    wishlistPromise = (async () => {
        try {
            const res = await apiClient.get('/api/wishlist')
            wishlistCache = res.data.wishlist || []
            return wishlistCache;
        } catch {
            return []
        } finally {
            wishlistPromise = null;
        }
    })();

    return wishlistPromise;
}

const addToWishlist = async (courseId: string) => {
    await apiClient.post('/api/wishlist', { course_id: courseId })
    wishlistCache = null;
    window.dispatchEvent(new Event('wishlistUpdated'))
}

const removeFromWishlist = async (courseId: string) => {
    await apiClient.delete(`/api/wishlist/${courseId}`)
    wishlistCache = null;
    window.dispatchEvent(new Event('wishlistUpdated'))
}

export const wishlistService = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
}
