"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/lib/useUser'

import { wishlistService } from '@/services/wishlistService'

const WISHLIST_EVENT = 'wishlistUpdated'

export function useWishlist() {
    const [wishlist, setWishlist] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()
    const { user } = useUser()

    useEffect(() => {
        const loadWishlist = async () => {
            setLoading(true)
            if (user) {
                const data = await wishlistService.getWishlist()
                setWishlist(data)
            } else {
                try {
                    const stored = localStorage.getItem('skillnora_wishlist')
                    if (stored) setWishlist(JSON.parse(stored))
                } catch (e) {}
            }
            setLoading(false)
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

        const isCurrentlyWishlisted = wishlist.includes(courseId)

        // Optimistic update
        setWishlist(prev => 
            isCurrentlyWishlisted 
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        )

        try {
            if (isCurrentlyWishlisted) {
                await wishlistService.removeFromWishlist(courseId)
            } else {
                await wishlistService.addToWishlist(courseId)
            }
        } catch (error) {
            // Revert on error
            setWishlist([...wishlist])
        }
    }

    const isInWishlist = (courseId: string) => wishlist.includes(courseId)

    return { wishlist, loading, toggleWishlist, isInWishlist }
}
