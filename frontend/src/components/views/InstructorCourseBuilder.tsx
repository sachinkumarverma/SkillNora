"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { coursesService } from '@/services/coursesService'
import apiClient from '@/lib/apiClient'
// keep for auth
import { useEffect } from 'react'
import Loader from '@/components/ui/Loader'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

const CustomDropdown = ({ label, value, options, onChange, required }: { label: string, value: string, options: {value: string, label: string}[], onChange: (val: string) => void, required?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...'
    return (
        <div className="relative">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer transition-colors"
            >
                <span>{selectedLabel}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full py-2">
                            {options.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false) }}
                                    className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

export default function InstructorCourseBuilder() {
    const { width, height } = useWindowSize()
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'unsplash'>('upload')
    const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false)
    
    // Course Metadata
    const [courseData, setCourseData] = useState<any>({
        title: '',
        description: '',
        detailed_overview: '',
        price: '',
        discountPrice: '',
        category: 'Artificial Intelligence',
        target_role: 'Machine Learning Engineer',
        primary_skill: 'Python',
        certificate_type: 'Professional Certificates',
        thumbnail_url: '',
        instructor_id: 'myself', // 'myself', 'none', or a specific uuid
        provide_certificate: true,
        attachments: [] as {title: string, url: string}[]
    })

    const [isSaving, setIsSaving] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string>('instructor')
    const [instructors, setInstructors] = useState<any[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)
    
    // Modules
    const [modules, setModules] = useState<any[]>([
        { id: 1, title: 'Introduction to the Course', videoMode: 'upload', videoUrl: '', thumbnailMode: 'upload', thumbnailUrl: '' }
    ])

    const router = useRouter()
    const searchParams = useSearchParams()
    const editCourseId = searchParams?.get('course_id')

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Prepare promises
                const userPromise = apiClient.get('/api/users/me').then(res => res.data.user).catch(() => null);
                const coursePromise = editCourseId ? coursesService.getOne(editCourseId as string).catch(() => null) : Promise.resolve(null);
                
                // Fetch user and course in parallel
                const [user, courseRes] = await Promise.all([userPromise, coursePromise]);
                
                // Handle User
                let role = 'instructor';
                if (user) {
                    setCurrentUser(user);
                    const isAdmin = user.email === 'sachinverma1489@gmail.com' || user.email === 'admin@skillnora.com';
                    role = isAdmin ? 'admin' : (user.role || 'instructor');
                    setCurrentUserRole(role);

                    if (role === 'admin') {
                        // Fetch instructors asynchronously (doesn't need to block rendering if course exists)
                        apiClient.get('/api/users/instructors')
                            .then(res => {
                                if (res.data.instructors) setInstructors(res.data.instructors);
                            })
                            .catch(e => console.error("Error fetching instructors", e));
                    }
                }

                // Handle Course
                if (editCourseId && courseRes) {
                    const c = courseRes.course || courseRes;
                    if (c) {
                        setCourseData({
                            title: c.title || '',
                            description: c.description || '',
                            detailed_overview: c.detailed_overview || '',
                            price: c.price ? String(c.price) : '',
                            discountPrice: c.discount_price ? String(c.discount_price) : '',
                            category: c.category || 'Artificial Intelligence',
                            target_role: c.target_role || 'Machine Learning Engineer',
                            primary_skill: c.primary_skill || 'Python',
                            certificate_type: c.certificate_type || 'Professional Certificates',
                            thumbnail_url: c.thumbnail_url || '',
                            instructor_id: c.instructor_id || 'myself',
                            initial_instructor_name: c.instructor?.full_name || c.instructor?.email,
                            provide_certificate: true,
                            attachments: Array.isArray(c.attachments) ? c.attachments : (typeof c.attachments === 'string' ? (function(){ try { const p = JSON.parse(c.attachments); return Array.isArray(p) ? p : [] } catch(e){ return [] }})() : [])
                        });
                        if (c.thumbnail_url) setThumbnailMode('unsplash');
                        
                        if (c.lectures && c.lectures.length > 0) {
                            setModules(c.lectures.map((l: any, i: number) => ({
                                id: l.id || Date.now() + i,
                                title: l.title || '',
                                videoMode: l.video_url?.includes('http') ? 'link' : 'upload',
                                videoUrl: l.video_url || '',
                                thumbnailMode: l.thumbnail_url ? 'unsplash' : 'upload',
                                thumbnailUrl: l.thumbnail_url || '',
                                mcqs: Array.isArray(l.mcqs) ? l.mcqs : (typeof l.mcqs === 'string' ? (function(){ try { const p = JSON.parse(l.mcqs); return Array.isArray(p) ? p : [] } catch(e){ return [] }})() : [])
                            })));
                        }
                    }
                }
            } catch (e) {
                console.error("Error fetching data", e);
            } finally {
                setIsLoadingData(false);
            }
        };
        if (editCourseId) {
            setIsLoadingData(true)
        }
        fetchAllData()
    }, [editCourseId])

    const handlePublish = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        
        if (!courseData.title || !courseData.description || !courseData.price || !courseData.thumbnail_url) {
            alert('Please fill in all required fields (Title, Description, Price, Thumbnail URL)')
            return
        }
        setIsSaving(true)
        try {
            const { data } = await apiClient.get('/api/users/me')
            const user = data.user
            if (!user) {
                alert('Please sign in to publish a course')
                return
            }

            const slug = courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

            let finalInstructorId: string | null = user.id
            if (currentUserRole === 'admin') {
                if (courseData.instructor_id === 'none') {
                    finalInstructorId = null
                } else if (courseData.instructor_id !== 'myself') {
                    finalInstructorId = courseData.instructor_id
                }
            }

            const coursePayload = {
                instructor_id: finalInstructorId,
                title: courseData.title,
                slug,
                description: courseData.description,
                detailed_overview: courseData.detailed_overview,
                thumbnail_url: courseData.thumbnail_url,
                category: courseData.category,
                target_role: courseData.target_role,
                primary_skill: courseData.primary_skill,
                certificate_type: courseData.certificate_type,
                price: Number(courseData.price) || 0,
                discount_price: courseData.discountPrice ? Number(courseData.discountPrice) : null,
                attachments: courseData.attachments,
                is_published: true
            }

            let apiResponse;
            if (editCourseId) {
                apiResponse = await coursesService.update(editCourseId as string, coursePayload);
            } else {
                apiResponse = await coursesService.create(coursePayload);
            }

            const course = apiResponse?.course || apiResponse;

            if (course && course.id) {
                const lecturesToInsert = modules.map((mod, index) => ({
                    course_id: course.id,
                    title: mod.title,
                    video_url: mod.videoUrl,
                    thumbnail_url: mod.videoMode === 'link' ? '' : mod.thumbnailUrl,
                    position: index + 1,
                    mcqs: mod.mcqs || []
                }))

                if (lecturesToInsert.length > 0) {
                    await coursesService.updateLectures(course.id, lecturesToInsert);
                }
            }

            setShowSuccessModal(true)
            setTimeout(() => {
                if (currentUserRole === 'admin') {
                    router.push('/admin/courses')
                } else {
                    router.push('/instructor')
                }
            }, 6000)
        } catch (error: any) {
            console.error('Error publishing course:', error)
            alert('Failed to publish course: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const addModule = () => {
        setModules([...modules, { id: Date.now(), title: 'New Module', videoMode: 'upload', videoUrl: '', thumbnailMode: 'upload', thumbnailUrl: '', mcqs: [] }])
    }

    const removeModule = (id: number) => {
        setModules(modules.filter(m => m.id !== id))
    }

    const updateModule = (id: number, field: string, value: any) => {
        setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m))
    }

    const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
    const [generatingModuleMcqs, setGeneratingModuleMcqs] = useState<number | null>(null);

    const generateCourseDetails = async () => {
        if (!courseData.title) {
            alert('Please enter a Course Title first to generate details.');
            return;
        }
        setIsGeneratingDetails(true);
        try {
            const res = await apiClient.post('/api/ai/chat', {
                messages: [
                    { role: 'system', content: 'You are an expert course creator. Return a JSON object with two fields: "description" (a catchy 2-sentence summary) and "detailed_overview" (a comprehensive 2-3 paragraph overview of what the student will learn). Return ONLY valid JSON without markdown wrapping.' },
                    { role: 'user', content: `Generate details for a course titled: "${courseData.title}"` }
                ]
            });
            let reply = res.data?.reply || '';
            reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(reply);
            if (json.description && json.detailed_overview) {
                setCourseData({ ...courseData, description: json.description, detailed_overview: json.detailed_overview });
            }
        } catch (e) {
            console.error('Error generating details', e);
            alert('Failed to generate details. Please try again. Ensure Groq API is reachable.');
        } finally {
            setIsGeneratingDetails(false);
        }
    }

    const generateMCQs = async (modId: number, modTitle: string) => {
        if (!modTitle || modTitle === 'New Module') {
            alert('Please enter a specific Module Title to generate relevant questions.');
            return;
        }
        setGeneratingModuleMcqs(modId);
        try {
            const res = await apiClient.post('/api/ai/chat', {
                messages: [
                    { role: 'system', content: 'You are an instructional designer. Return a JSON array of exactly 4 multiple-choice questions for the given module topic. Each object must have: "question" (string), "options" (an array of 4 string options), and "correctIndex" (integer 0-3 indicating the correct option). Return ONLY the JSON array without markdown.' },
                    { role: 'user', content: `Generate 4 MCQs for the module: "${modTitle}" in the course: "${courseData.title}"` }
                ]
            });
            let reply = res.data?.reply || '';
            reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const questions = JSON.parse(reply);
            if (Array.isArray(questions)) {
                updateModule(modId, 'mcqs', questions);
            }
        } catch (e) {
            console.error('Error generating MCQs', e);
            alert('Failed to generate MCQs. Please try again.');
        } finally {
            setGeneratingModuleMcqs(null);
        }
    }

    const getSelectedInstructorLabel = () => {
        if (courseData.instructor_id === 'none') return 'Unassigned (No Instructor)'
        if (courseData.instructor_id === 'myself') return 'Assign to myself'
        const inst = instructors.find(i => i.id === courseData.instructor_id)
        if (inst) return inst.full_name || inst.email
        if ((courseData as any).initial_instructor_name) return (courseData as any).initial_instructor_name
        return 'Assign Instructor'
    }

    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader />
            </div>
        )
    }

    return (
        <form onSubmit={handlePublish} className="max-w-5xl mx-auto p-6 lg:p-8 pb-32">
            
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                            >
                                <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                            
                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-slate-900 dark:text-white mb-2"
                            >
                                Congratulations!
                            </motion.h2>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-slate-500 dark:text-slate-400 font-medium mb-8"
                            >
                                Your course <strong className="text-slate-900 dark:text-white">"{courseData.title}"</strong> has been successfully published to the platform! 🚀
                            </motion.p>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <button type="button" onClick={() => router.push('/admin/courses')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                                    Go to Course Management
                                </button>
                                <p className="text-xs text-slate-400 font-bold mt-4 animate-pulse">Redirecting automatically in a few seconds...</p>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/courses" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">Courses</Link>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Edit Course</span>
                    </div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Course Builder
                    </motion.h1>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm">
                        Save as Draft
                    </button>
                    <button type="submit" disabled={isSaving} className={`px-5 py-2.5 rounded-md text-white font-bold transition-colors shadow-sm text-sm flex items-center gap-2 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isSaving ? 'Submitting...' : 'Submit Course'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Basic Information</h2>
                            <button 
                                type="button" 
                                onClick={generateCourseDetails}
                                disabled={isGeneratingDetails || !courseData.title}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                    isGeneratingDetails 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' 
                                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                                }`}
                            >
                                {isGeneratingDetails ? (
                                    <>
                                        <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        AI Generate Details
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="space-y-5">
                            {currentUserRole === 'admin' && (
                                <div className="relative">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assign Instructor (Admin Only)</label>
                                    
                                    {/* Custom Dropdown Button */}
                                    <div 
                                        onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 text-sm font-semibold text-blue-900 dark:text-blue-300 cursor-pointer transition-colors"
                                    >
                                        <span>{getSelectedInstructorLabel()}</span>
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isInstructorDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {/* Custom Dropdown Menu */}
                                    {isInstructorDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                        >
                                            <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full py-2">
                                                <div 
                                                    onClick={() => { setCourseData({...courseData, instructor_id: 'myself'}); setIsInstructorDropdownOpen(false) }}
                                                    className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${courseData.instructor_id === 'myself' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                >
                                                    Assign to myself
                                                </div>
                                                <div 
                                                    onClick={() => { setCourseData({...courseData, instructor_id: 'none'}); setIsInstructorDropdownOpen(false) }}
                                                    className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${courseData.instructor_id === 'none' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                >
                                                    Unassigned (No Instructor)
                                                </div>
                                                
                                                {instructors.length > 0 && <div className="px-4 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-2 border-t border-slate-100 dark:border-slate-700/50 pt-3">Other Instructors</div>}
                                                
                                                {instructors.map(inst => {
                                                    const initials = (inst.full_name || inst.email || 'IN').substring(0, 2).toUpperCase()
                                                    return (
                                                        <div 
                                                            key={inst.id}
                                                            onClick={() => { setCourseData({...courseData, instructor_id: inst.id}); setIsInstructorDropdownOpen(false) }}
                                                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center gap-3 ${courseData.instructor_id === inst.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                                {inst.avatar_url ? <img src={inst.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">{initials}</span>}
                                                            </div>
                                                            <span>{inst.full_name || inst.email}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                    <p className="text-xs font-medium text-slate-500 mt-2">Since you are an Admin, you can assign this course or leave it unassigned.</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Course Title <span className="text-red-500">*</span></label>
                                <input required type="text" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} placeholder="e.g. Advanced AI Agents Masterclass" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Short Description <span className="text-red-500">*</span></label>
                                <textarea required rows={3} value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} placeholder="A short summary of what students will learn..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Overview</label>
                                <textarea rows={6} value={courseData.detailed_overview} onChange={(e) => setCourseData({...courseData, detailed_overview: e.target.value})} placeholder="Provide a comprehensive course description for the student preview page..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full" />
                            </div>

                            {/* Course Attachments */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Course Attachments</h3>
                                        <p className="text-xs text-slate-500 mt-1">Add PDFs, code zips, or other resources students can download.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setCourseData({...courseData, attachments: [...courseData.attachments, {title: '', url: ''}]})}
                                        className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    >
                                        + Add Attachment
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {courseData.attachments.map((att, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex-1 space-y-3">
                                                <input 
                                                    type="text" 
                                                    value={att.title} 
                                                    onChange={(e) => {
                                                        const newAtt = [...courseData.attachments];
                                                        newAtt[i].title = e.target.value;
                                                        setCourseData({...courseData, attachments: newAtt});
                                                    }}
                                                    placeholder="Attachment Title (e.g. Slide Deck PDF)" 
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500" 
                                                />
                                                <input 
                                                    type="url" 
                                                    value={att.url} 
                                                    onChange={(e) => {
                                                        const newAtt = [...courseData.attachments];
                                                        newAtt[i].url = e.target.value;
                                                        setCourseData({...courseData, attachments: newAtt});
                                                    }}
                                                    placeholder="Attachment URL (https://...)" 
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500" 
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newAtt = [...courseData.attachments];
                                                    newAtt.splice(i, 1);
                                                    setCourseData({...courseData, attachments: newAtt});
                                                }}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {courseData.attachments.length === 0 && (
                                        <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                            No attachments added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Metadata Tags for Explore Filtering */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Explore Tags (For Filtering)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <CustomDropdown 
                                        label="Category" 
                                        value={courseData.category} 
                                        onChange={(val) => setCourseData({...courseData, category: val})}
                                        options={[
                                            {value: 'Artificial Intelligence', label: 'Artificial Intelligence'},
                                            {value: 'Business', label: 'Business'},
                                            {value: 'Data Science', label: 'Data Science'},
                                            {value: 'Information Technology', label: 'Information Technology'},
                                            {value: 'Healthcare', label: 'Healthcare'},
                                            {value: 'Web Development', label: 'Web Development'},
                                            {value: 'Digital Marketing', label: 'Digital Marketing'},
                                            {value: 'Cloud Computing', label: 'Cloud Computing'},
                                            {value: 'Graphic Design', label: 'Graphic Design'},
                                            {value: 'Finance & Accounting', label: 'Finance & Accounting'}
                                        ]} 
                                    />
                                    <CustomDropdown 
                                        label="Target Role" 
                                        value={courseData.target_role} 
                                        onChange={(val) => setCourseData({...courseData, target_role: val})}
                                        options={[
                                            {value: 'Data Analyst', label: 'Data Analyst'},
                                            {value: 'Project Manager', label: 'Project Manager'},
                                            {value: 'Cyber Security Analyst', label: 'Cyber Security Analyst'},
                                            {value: 'UI / UX Designer', label: 'UI / UX Designer'},
                                            {value: 'Machine Learning Engineer', label: 'Machine Learning Engineer'},
                                            {value: 'Software Engineer', label: 'Software Engineer'},
                                            {value: 'Frontend Developer', label: 'Frontend Developer'},
                                            {value: 'Backend Developer', label: 'Backend Developer'},
                                            {value: 'Marketing Manager', label: 'Marketing Manager'},
                                            {value: 'Financial Analyst', label: 'Financial Analyst'}
                                        ]} 
                                    />
                                    <CustomDropdown 
                                        label="Primary Skill" 
                                        value={courseData.primary_skill} 
                                        onChange={(val) => setCourseData({...courseData, primary_skill: val})}
                                        options={[
                                            {value: 'Python', label: 'Python'},
                                            {value: 'Machine Learning', label: 'Machine Learning'},
                                            {value: 'SQL', label: 'SQL'},
                                            {value: 'Excel', label: 'Excel'},
                                            {value: 'Power BI', label: 'Power BI'},
                                            {value: 'React', label: 'React'},
                                            {value: 'JavaScript', label: 'JavaScript'},
                                            {value: 'Node.js', label: 'Node.js'},
                                            {value: 'SEO', label: 'SEO'},
                                            {value: 'AWS', label: 'AWS'},
                                            {value: 'Java', label: 'Java'},
                                            {value: 'C++', label: 'C++'},
                                            {value: 'Go', label: 'Go'}
                                        ]} 
                                    />
                                    <CustomDropdown 
                                        label="Certificate Type" 
                                        value={courseData.certificate_type} 
                                        onChange={(val) => setCourseData({...courseData, certificate_type: val})}
                                        options={[
                                            {value: 'Professional Certificates', label: 'Professional Certificates'},
                                            {value: 'Online Degrees', label: 'Online Degrees'},
                                            {value: 'Specializations', label: 'Specializations'},
                                            {value: 'Master\'s Degrees', label: 'Master\'s Degrees'}
                                        ]} 
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Course Thumbnail */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Course Thumbnail</h2>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button type="button" onClick={() => setThumbnailMode('upload')} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'upload' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                <button type="button" onClick={() => setThumbnailMode('unsplash')} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'unsplash' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Unsplash URL</button>
                            </div>
                        </div>
                        
                        {thumbnailMode === 'upload' ? (
                            <div className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10">
                                <svg className="mb-3 h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Drag & drop image or click to browse</span>
                                <span className="text-xs text-slate-400 mt-1">1920x1080 recommended</span>
                            </div>
                        ) : (
                            <input required type="url" value={courseData.thumbnail_url} onChange={(e) => setCourseData({...courseData, thumbnail_url: e.target.value})} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                        )}
                    </motion.div>

                    {/* Modules (Video + Thumbnail) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Modules</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Add modules. Each module contains its own video and thumbnail.</p>
                            </div>
                            <button type="button" onClick={addModule} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2 shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Add Module
                            </button>
                        </div>

                        <div className="space-y-6">
                            {modules.map((mod, index) => (
                                <div key={mod.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-800/20 shadow-sm">
                                    <div className="flex items-center justify-between p-4 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 dark:text-white">Module {index + 1}:</span>
                                            <input type="text" value={mod.title} onChange={(e) => updateModule(mod.id, 'title', e.target.value)} placeholder="Module Title" className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 text-sm flex-1 focus:ring-0 p-0" />
                                        </div>
                                        {modules.length > 1 && (
                                            <button type="button" onClick={() => removeModule(mod.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-5 space-y-6">
                                        {/* Module Video */}
                                        <div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Module Video</label>
                                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-md">
                                                    <button type="button" onClick={() => updateModule(mod.id, 'videoMode', 'upload')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${mod.videoMode === 'upload' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                                    <button type="button" onClick={() => updateModule(mod.id, 'videoMode', 'link')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${mod.videoMode === 'link' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>YouTube Link</button>
                                                </div>
                                            </div>
                                            {mod.videoMode === 'upload' ? (
                                                <div className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 transition hover:border-blue-400 dark:hover:border-blue-500">
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> Browse Video</span>
                                                </div>
                                            ) : (
                                                <input type="url" value={mod.videoUrl} onChange={(e) => updateModule(mod.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all" />
                                            )}
                                        </div>

                                        {/* Module Thumbnail (Only show if not YouTube Link) */}
                                        {mod.videoMode === 'upload' ? (
                                            <div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Module Thumbnail</label>
                                                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-md">
                                                        <button type="button" onClick={() => updateModule(mod.id, 'thumbnailMode', 'upload')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${mod.thumbnailMode === 'upload' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                                        <button type="button" onClick={() => updateModule(mod.id, 'thumbnailMode', 'unsplash')} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${mod.thumbnailMode === 'unsplash' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Unsplash Link</button>
                                                    </div>
                                                </div>
                                                {mod.thumbnailMode === 'upload' ? (
                                                    <div className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 transition hover:border-purple-400 dark:hover:border-purple-500">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Browse Image</span>
                                                    </div>
                                                ) : (
                                                    <input type="url" value={mod.thumbnailUrl} onChange={(e) => updateModule(mod.id, 'thumbnailUrl', e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 transition-all" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-generating Thumbnail</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">The preview thumbnail will be automatically fetched from YouTube.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* MCQ Quiz Builder */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Module Quiz (MCQs)</label>
                                                    <p className="text-xs text-slate-500">Add questions to test student knowledge after this module.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => generateMCQs(mod.id, mod.title)}
                                                        disabled={generatingModuleMcqs === mod.id || !mod.title || mod.title === 'New Module'}
                                                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                                                            generatingModuleMcqs === mod.id 
                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' 
                                                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                                                        }`}
                                                    >
                                                        {generatingModuleMcqs === mod.id ? (
                                                            <>
                                                                <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                                AI Generate Quiz
                                                            </>
                                                        )}
                                                    </button>
                                                    <button type="button" onClick={() => {
                                                        const newMcqs = [...(mod.mcqs || [])];
                                                        newMcqs.push({ question: '', options: ['', '', '', ''], correctIndex: 0 });
                                                        updateModule(mod.id, 'mcqs', newMcqs);
                                                    }} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors">+ Add Question</button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {(mod.mcqs || []).map((mcq: any, qIdx: number) => (
                                                    <details key={qIdx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl relative group" open>
                                                        <summary className="font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer outline-none marker:text-blue-500 p-4 select-none">
                                                            {mcq.question || `Question ${qIdx + 1}`}
                                                        </summary>
                                                        <button type="button" onClick={() => {
                                                            const newMcqs = [...mod.mcqs];
                                                            newMcqs.splice(qIdx, 1);
                                                            updateModule(mod.id, 'mcqs', newMcqs);
                                                        }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                        
                                                        <div className="px-4 pb-4">
                                                            <input type="text" value={mcq.question} onChange={e => {
                                                                const newMcqs = [...mod.mcqs];
                                                                newMcqs[qIdx].question = e.target.value;
                                                                updateModule(mod.id, 'mcqs', newMcqs);
                                                            }} placeholder="Question text..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm mb-3 focus:border-blue-500 outline-none" />
                                                            
                                                            <div className="space-y-2 pl-2">
                                                                <p className="text-xs font-bold text-slate-500 mb-2">Select the correct answer below:</p>
                                                                {mcq.options.map((opt: string, optIdx: number) => (
                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                        <input type="radio" name={`correct-${mod.id}-${qIdx}`} checked={mcq.correctIndex === optIdx} onChange={() => {
                                                                            const newMcqs = [...mod.mcqs];
                                                                            newMcqs[qIdx].correctIndex = optIdx;
                                                                            updateModule(mod.id, 'mcqs', newMcqs);
                                                                        }} className="w-4 h-4 text-emerald-500 cursor-pointer" title="Set as correct answer" />
                                                                        <input type="text" value={opt} onChange={e => {
                                                                            const newMcqs = [...mod.mcqs];
                                                                            newMcqs[qIdx].options[optIdx] = e.target.value;
                                                                            updateModule(mod.id, 'mcqs', newMcqs);
                                                                        }} placeholder={`Option ${optIdx + 1}`} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none" />
                                                                        {mcq.correctIndex === optIdx && <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Correct</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Pricing & Settings */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Pricing</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input required type="number" min="0" value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} placeholder="4999" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Discount Price (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input type="number" min="0" value={courseData.discountPrice} onChange={(e) => setCourseData({...courseData, discountPrice: e.target.value})} placeholder="2999" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                                </div>
                                <p className="text-xs font-medium text-slate-500 mt-2">Leave blank if no discount is offered.</p>
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200 dark:border-slate-800" />

                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Settings</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setCourseData({...courseData, provide_certificate: !courseData.provide_certificate})}>
                                <div className={`relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${courseData.provide_certificate ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                                    {courseData.provide_certificate && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Provide Certificate on Completion</span>
                            </label>
                        </div>
                    </motion.div>
                </div>
            </div>
        </form>
    )
}
