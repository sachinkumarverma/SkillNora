"use client"
import React from 'react'

type Props = { src?: string, poster?: string }

export default function VideoPlayer({ src, poster }: Props) {
    if (!src) return <div className="p-6 rounded-md border">No video available</div>

    return (
        <div className="rounded-md overflow-hidden bg-black">
            <video controls src={src} poster={poster} className="w-full h-auto max-h-[64vh] bg-black" />
        </div>
    )
}
