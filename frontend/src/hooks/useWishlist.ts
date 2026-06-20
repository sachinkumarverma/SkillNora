"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/lib/useUser'

import { wishlistService } from '@/services/wishlistService'

const WISHLIST_EVENT = 'wishlistUpdated'

export function useWishlist() {
    const [wishlist, setWishlist] = useState<string[]>([])
    const router = useRouter()
    const { user } = useUser()

    useEffect(() => {
        const loadWishlist = async () => {
            if (user) {
                const data = await wishlistService.getWishlist()
                setWishlist(data)
            } else {
                try {
                    const stored = localStorage.getItem('skillnora_wishlist')
                    if (stored) setWishlist(JSON.parse(stored))
                } catch (e) {}
            }
        }
        
        loadWishlist()
        
        const handleUpdate = () => loadWishlist()
        window.addEventListener(WISHLIST_EVENT, handleUpdate)
        return () => window.removeEventListener(WISHLIST_EVENT, handleUpdate)
    }, [user])

    const toggleWishlist = async (courseId: string) => {
        if (!user) {
            router.push('/auth')
            return
        }
        if (wishlist.includes(courseId)) {
            await wishlistService.removeFromWishlist(courseId)
        } else {
            await wishlistService.addToWishlist(courseId)
        }
    }

    const isInWishlist = (courseId: string) => wishlist.includes(courseId)

    return { wishlist, toggleWishlist, isInWishlist }
}
