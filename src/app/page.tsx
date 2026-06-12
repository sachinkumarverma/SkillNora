import React from 'react'
import Hero from '../components/Hero'
import CourseCard from '../components/CourseCard'

export default function HomePage() {
    return (
        <section>
            <Hero />

            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Trending courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CourseCard title="AI for Beginners" author="Jane Doe" />
                    <CourseCard title="Fullstack Next.js" author="John Smith" />
                    <CourseCard title="Product Design" author="Alex Lee" />
                </div>
            </section>
        </section>
    )
}
