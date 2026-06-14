"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '../lib/useUser'

const WISHLIST_EVENT = 'wishlist_updated'

export function useWishlist() {
    const [wishlist, setWishlist] = useState<string[]>([])
    const router = useRouter()
    const { user } = useUser()

    useEffect(() => {
        const loadWishlist = () => {
            try {
                const stored = localStorage.getItem('skillnora_wishlist')
                if (stored) {
                    setWishlist(JSON.parse(stored))
                }
            } catch (e) {}
        }
        
        loadWishlist()
        
        const handleUpdate = () => {
            loadWishlist()
        }

        window.addEventListener(WISHLIST_EVENT, handleUpdate)
        return () => window.removeEventListener(WISHLIST_EVENT, handleUpdate)
    }, [])

    const toggleWishlist = (courseId: string) => {
        if (!user) {
            router.push('/auth')
            return
        }
        try {
            const stored = localStorage.getItem('skillnora_wishlist')
            let current = stored ? JSON.parse(stored) : []
            
            if (current.includes(courseId)) {
                current = current.filter((id: string) => id !== courseId)
            } else {
                current.push(courseId)
            }
            
            localStorage.setItem('skillnora_wishlist', JSON.stringify(current))
            window.dispatchEvent(new Event(WISHLIST_EVENT))
        } catch (e) {}
    }

    const isInWishlist = (courseId: string) => wishlist.includes(courseId)

    return { wishlist, toggleWishlist, isInWishlist }
}
