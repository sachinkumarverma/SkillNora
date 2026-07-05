"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import CourseCard from '@/components/CourseCard'
import api from '@/lib/api'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import ConfirmDeleteModal from '@/components/views/ConfirmDeleteModal'
import toast from 'react-hot-toast'

export default function EnrolledPage() {
    const router = useRouter()

    const [courses, setCourses] = React.useState<any[]>([])
    const [enrolledIds, setEnrolledIds] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(true)
    const [confirmModal, setConfirmModal] = React.useState<{ isOpen: boolean; courseId: string }>({ isOpen: false, courseId: '' })

    React.useEffect(() => {
        let active = true
        Promise.all([
            apiClient.get('/api/courses').then(r => r.data).catch(e => { console.error(e); return { courses: [] }; }),
            apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] }))
        ]).then(([coursesData, enrollData]) => {
            if (!active) return
            const allCourses = Array.isArray(coursesData) ? coursesData : coursesData.courses || coursesData.data || []
            setCourses(allCourses)
            setEnrolledIds(enrollData?.enrolledIds || [])
            setLoading(false)
        }).catch(console.error)
        return () => { active = false }
    }, [])

    const handleCancel = async (courseId: string) => {
        try {
            setLoading(true);
            const res = await apiClient.post('/api/enrollments/cancel', { course_id: courseId });
            toast.success(`Enrollment cancelled successfully.\nRefund amount: ₹${res.data.refundAmount?.toFixed(2)}\nA receipt has been sent to your email.`, { duration: 5000 });
            setEnrolledIds(enrolledIds.filter(id => id !== courseId));
        } catch (err: any) {
            console.error(err);
            toast.error(`Failed to cancel: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
            setConfirmModal({ isOpen: false, courseId: '' });
        }
    };

    const triggerCancel = (courseId: string) => {
        setConfirmModal({ isOpen: true, courseId });
    }

    if (loading) return <Loader type="courses" />

    const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id))

    return (
        <div className="w-full mx-auto p-6 md:p-8">
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Enrolled Courses</h1>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-sm">
                        {enrolledCourses.length} active
                    </span>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">You aren't enrolled in any courses</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md text-center">Save courses you want to learn later by clicking the heart icon on any course card.</p>
                        <button
                            onClick={() => router.push('/courses')}
                            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Explore Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {enrolledCourses.map((course) => (
                            <CourseCard 
                                key={course.id}
                                course={course}
                                isEnrolled={true}
                                variant="enrolled"
                                onCancel={(e) => { e.stopPropagation(); triggerCancel(course.id); }}
                            />
                        ))}
                    </div>
                )}
            </section>
            <ConfirmDeleteModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, courseId: '' })}
                onConfirm={() => handleCancel(confirmModal.courseId)}
                title="Cancel Enrollment?"
                message="Are you sure you want to cancel your enrollment? You will only get a partial refund (calculated dynamically) if it is within 30 days."
            />
        </div>
    )
}
