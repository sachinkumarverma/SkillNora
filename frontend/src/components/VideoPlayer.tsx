"use client"

type Props = { src?: string, poster?: string, onEnded?: () => void }

export default function VideoPlayer({ src, poster, onEnded }: Props) {
    if (!src) return <div className="p-6 rounded-md border text-slate-500">No video available</div>

    return (
        <div className="rounded-md overflow-hidden bg-black w-full h-full flex items-center justify-center">
            <video controls src={src} poster={poster} onEnded={onEnded} className="w-full h-full max-h-full object-contain bg-black" />
        </div>
    )
}
