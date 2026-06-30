"use client"
import { useRef } from 'react'

export default function HeroCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -600, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 600, behavior: 'smooth' })
        }
    }

    const banners = [
        {
            id: 1,
            tag: 'Skillnora Plus',
            title: 'Ends soon! Save more on skills that stand out',
            description: 'It\'s a brilliant time to begin with 10,000+ programs for ₹6,999/year. Price goes up soon.',
            buttonText: 'Save now',
            buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
            bgClass: 'bg-[#F5F7F8] dark:bg-slate-900',
            textClass: 'text-slate-900 dark:text-white',
            descClass: 'text-slate-600 dark:text-slate-400',
            tagClass: 'text-blue-700',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
            gradientFrom: 'from-[#F5F7F8] dark:from-slate-900'
        },
        {
            id: 2,
            tag: 'Skillnora For Teams',
            title: 'Early-bird savings. Top team training.',
            description: 'Get 50% off team training you can start today. Begin now before prices go up.',
            buttonText: 'Save 50% on Teams',
            buttonClass: 'bg-white text-blue-900 hover:bg-slate-100',
            bgClass: 'bg-blue-900',
            textClass: 'text-white',
            descClass: 'text-blue-100',
            tagClass: 'text-blue-200',
            image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
            gradientFrom: 'from-blue-900'
        },
        {
            id: 3,
            tag: 'Skillnora AI',
            title: 'Learn AI skills from leading names',
            description: 'Practical knowledge from OpenAI, Anthropic, Google, and more is here for your career path.',
            buttonText: 'Join for Free',
            buttonClass: 'bg-white text-slate-900 hover:bg-slate-100',
            bgClass: 'bg-slate-900',
            textClass: 'text-white',
            descClass: 'text-slate-300',
            tagClass: 'text-slate-400',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
            gradientFrom: 'from-slate-900'
        },
        {
            id: 4,
            tag: 'Degrees',
            title: 'Take your career to the next level',
            description: 'Earn a degree from a top university online and transform your life without putting it on hold.',
            buttonText: 'Explore Degrees',
            buttonClass: 'bg-purple-600 text-white hover:bg-purple-700',
            bgClass: 'bg-purple-50 dark:bg-slate-900',
            textClass: 'text-slate-900 dark:text-white',
            descClass: 'text-slate-600 dark:text-slate-400',
            tagClass: 'text-purple-700',
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
            gradientFrom: 'from-purple-50 dark:from-slate-900'
        }
    ]

    return (
        <div className="relative group/carousel">
            <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className={`relative shrink-0 w-full lg:w-[calc(50%-12px)] snap-start rounded-lg overflow-hidden flex items-center ${banner.bgClass}`}>
                        <div className="p-6 md:p-8 z-10 w-full md:w-3/5">
                            <div className={`inline-block font-bold text-xs tracking-widest uppercase mb-2 ${banner.tagClass}`}>{banner.tag}</div>
                            <h1 className={`text-2xl md:text-3xl font-serif leading-tight mb-3 ${banner.textClass}`}>
                                {banner.title}
                            </h1>
                            <p className={`mb-6 text-sm md:text-base font-medium line-clamp-2 ${banner.descClass}`}>
                                {banner.description}
                            </p>
                            <button className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${banner.buttonClass}`}>
                                {banner.buttonText}
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 top-0 w-2/5 hidden md:block opacity-90">
                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradientFrom} to-transparent z-10`}></div>
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-700 z-20"
                aria-label="Scroll left"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-700 z-20"
                aria-label="Scroll right"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
