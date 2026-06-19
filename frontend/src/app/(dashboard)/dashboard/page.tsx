"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import useUser from '@/lib/useUser'


import CourseCarousel from '@/components/CourseCarousel'
import HeroCarousel from '@/components/HeroCarousel'

export default function DashboardPage() {
    const router = useRouter()
    const { user } = useUser()
    const [courses, setCourses] = useState<any[]>([])
    const [loadingCourses, setLoadingCourses] = useState(true)

    useEffect(() => {
        let active = true
        api.api('/api/courses').then((data) => {
            if (!active) return
            setCourses(Array.isArray(data) ? data : data.data ?? [])
        }).catch(() => {
            if (active) setCourses([])
        }).finally(() => {
            if (active) setLoadingCourses(false)
        })
        return () => { active = false }
    }, [])

    const displayCourses = courses.length > 0 ? courses : trendingCourses

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-16">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 space-y-16 pt-8">

                {/* Coursera-style Hero Banners Carousel */}
                <HeroCarousel />

                {/* University Logos */}
                <section className="py-6 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Learn from 350+ leading universities and companies</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="text-xl font-black font-sans flex items-center gap-2">
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                            Google
                        </div>
                        <div className="text-xl font-black font-serif flex items-center gap-2 text-blue-700">IBM</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2"><div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-red-500"></div><div className="bg-green-500"></div><div className="bg-blue-500"></div><div className="bg-yellow-500"></div></div>Microsoft</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2 text-indigo-900 dark:text-indigo-400">Stanford University</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2">DeepLearning.AI</div>
                    </div>
                </section>

                {/* Logged-in User Specific Sections */}
                {user && (
                    <div className="space-y-12 mb-12">
                        {/* Statistics Section */}
                        <section>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">Your Learning Statistics</h2>
                                <a href="/statistics" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                    See full statistics <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </a>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">24.5</div>
                                    <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Hours Learned</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">3</div>
                                    <div className="text-sm font-semibold text-purple-800 dark:text-purple-300">Courses in Progress</div>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">2</div>
                                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Certificates Earned</div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                    <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">12</div>
                                    <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">Day Streak!</div>
                                </div>
                            </div>
                        </section>

                        {/* Continue Watching */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Continue Watching</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {displayCourses.slice(0, 3).map((course, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/courses/${course.slug}`)}>
                                        <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                                            <img src={course.image_url || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} alt={course.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 text-sm">{course.title}</h3>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(idx + 1) * 25}%` }}></div>
                                            </div>
                                            <div className="text-xs text-slate-500 font-semibold">{((idx + 1) * 25)}% complete</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* Carousels Section */}
                <div className="space-y-4">
                    <CourseCarousel
                        title="New and popular"
                        courses={displayCourses.slice(0, 8)}
                    />

                    <CourseCarousel
                        title="Trending AI Courses"
                        courses={displayCourses.filter(c => c.category === 'Data Science' || c.category === 'Software Engineering')}
                    />

                    <CourseCarousel
                        title="Top rated in Web Development"
                        courses={displayCourses.filter(c => c.category === 'Web Development' || c.category === 'Python')}
                    />
                </div>

                {/* Features Links */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Launch a new career</span>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Try Skillnora for Business</span>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Earn a degree</span>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg></div>
                    </div>
                </section>

                {/* Testimonials */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-serif">Why people choose Skillnora</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Sarah W.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', quote: '"Skillnora\'s reputation for high-quality content, paired with its flexible structure, made it possible for me to dive into data analytics while managing family, health, and everyday life."' },
                            { name: 'Noeris B.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', quote: '"Skillnora rebuilt my confidence and showed me I could dream bigger. It wasn\'t just about gaining knowledge—it was about believing in my potential again."' },
                            { name: 'Abdullahi M.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', quote: '"I now feel more prepared to take on leadership roles and have already started mentoring some of my colleagues."' }
                        ].map((t, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover" />
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t.name}</h4>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {t.quote}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-serif">Frequently asked questions</h2>
                    <div className="space-y-4 max-w-4xl">
                        {[
                            { q: 'Is Skillnora accredited, and are Skillnora certificates recognized by employers?', a: 'Yes, Skillnora partners with top-tier industry professionals and tech leaders. Our certificates provide verifiable proof of your technical proficiency and are highly regarded by hiring managers globally.' },
                            { q: 'Is a Skillnora certificate worth it?', a: 'Absolutely. Earning a certificate demonstrates your commitment to continuous learning and gives you a tangible credential to showcase on your resume, LinkedIn profile, and portfolio.' },
                            { q: 'What is Skillnora Plus, and is it worth it?', a: 'Skillnora Plus gives you unlimited access to our entire library of premium courses, guided projects, and certificate programs for a single annual fee, making it the most cost-effective way to rapidly upgrade your skills.' },
                            { q: 'Does Skillnora offer free online courses?', a: 'Yes! Skillnora offers a selection of introductory and foundational courses entirely for free. While official certificates may require a fee, the knowledge is accessible to everyone.' },
                            { q: 'What are the most popular courses on Skillnora?', a: 'Our most popular tracks currently include AI Engineering, Full-Stack Web Development, Data Science with Python, and Mobile Development with Flutter.' },
                            { q: 'How can Skillnora help me get a job or advance my career?', a: 'By providing industry-relevant curriculum, hands-on projects, and expert instruction, Skillnora equips you with the exact, practical skills that tech companies are actively hiring for right now.' },
                            { q: 'What is Skillnora for Business, and how much does it cost?', a: 'Skillnora for Business is our enterprise solution designed specifically to upskill development teams. Pricing scales based on the size of your team, offering significant discounts for group training.' }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {faq.q}
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="p-6 text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-200 dark:border-slate-800">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    )
}
