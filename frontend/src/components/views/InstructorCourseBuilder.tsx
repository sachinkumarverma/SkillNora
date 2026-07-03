"use client"
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { coursesService } from '@/services/coursesService'
import apiClient from '@/lib/apiClient'
// keep for auth
import { useEffect } from 'react'
import Loader from '@/components/ui/Loader'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import toast from 'react-hot-toast'

import CustomDropdown from '@/components/ui/CustomDropdown'

export default function InstructorCourseBuilder() {
    const { width, height } = useWindowSize()
    const router = useRouter()
    const searchParams = useSearchParams()
    const editCourseId = searchParams?.get('course_id')

    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'unsplash'>('upload')
    const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false)
    const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null)
    const instructorDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (instructorDropdownRef.current && !instructorDropdownRef.current.contains(event.target as Node)) {
                setIsInstructorDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setMounted(true)
    }, [])

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
        is_free: false,
        is_published: false,
        is_archived: false
    })
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string>('instructor')
    const [instructors, setInstructors] = useState<any[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    // Modules
    const [modules, setModules] = useState<any[]>([
        { id: 1, title: 'Introduction to the Course', videoMode: 'upload', videoUrl: '', thumbnailMode: 'upload', thumbnailUrl: '', mcqs: [], attachments: [] }
    ])
    const [openModuleIds, setOpenModuleIds] = useState<Set<number>>(new Set())

    const [localDraftTime, setLocalDraftTime] = useState<string | null>(null)
    const [hasPendingDraft, setHasPendingDraft] = useState(false)

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
                        try {
                            const res = await apiClient.get('/api/users/instructors');
                            if (res.data.instructors) setInstructors(res.data.instructors);
                        } catch (e) {
                            console.error("Error fetching instructors", e);
                        }
                    }
                }

                // Handle Course
                if (editCourseId && courseRes) {
                    const c = courseRes.course || courseRes;
                    if (c) {
                        // Determine the correct instructor_id value for the dropdown
                        let resolvedInstructorId = c.instructor_id || 'myself';
                        if (user && c.instructor_id === user.id) {
                            resolvedInstructorId = 'myself';
                        } else if (!c.instructor_id) {
                            resolvedInstructorId = 'none';
                        }

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
                            instructor_id: resolvedInstructorId,
                            initial_instructor_name: c.instructor?.full_name || c.instructor?.email,
                            provide_certificate: c.provide_certificate !== undefined ? c.provide_certificate : !!c.certificate_type,
                            is_free: c.is_free || false,
                            is_published: c.is_published || false,
                            is_archived: c.is_archived || false
                        });
                        if (c.thumbnail_url) setThumbnailMode('unsplash');

                        if (c.lectures && c.lectures.length > 0) {
                            setModules(c.lectures.map((l: any, i: number) => {
                                const isYoutubeVideo = l.video_url?.includes('youtube') || l.video_url?.includes('youtu.be');
                                const isSupabaseThumbnail = l.thumbnail_url?.includes('supabase') || l.thumbnail_url?.includes('/storage/v1/');
                                return {
                                    id: l.id || Date.now() + i,
                                    title: l.title || '',
                                    videoMode: isYoutubeVideo ? 'link' : 'upload',
                                    videoUrl: l.video_url || '',
                                    thumbnailMode: (l.thumbnail_url && !isSupabaseThumbnail) ? 'unsplash' : 'upload',
                                    thumbnailUrl: l.thumbnail_url || '',
                                    mcqs: Array.isArray(l.mcqs) ? l.mcqs : (typeof l.mcqs === 'string' ? (function () { try { const p = JSON.parse(l.mcqs); return Array.isArray(p) ? p : [] } catch (e) { return [] } })() : []),
                                    attachments: Array.isArray(l.attachments) ? l.attachments : (typeof l.attachments === 'string' ? (function () { try { const p = JSON.parse(l.attachments); return Array.isArray(p) ? p : [] } catch (e) { return [] } })() : [])
                                };
                            }));
                            // All modules collapsed by default when editing existing course
                            setOpenModuleIds(new Set());
                        }
                    }
                }
            } catch (e) {
                console.error("Error fetching data", e);
            } finally {
                setIsLoadingData(false);
            }
        };
        const detectLocalDraft = (user: any) => {
            if (!editCourseId && user) {
                const savedDraftStr = localStorage.getItem('local_course_draft')
                if (savedDraftStr) {
                    try {
                        const parsed = JSON.parse(savedDraftStr)
                        if (parsed.userId === user.id && (parsed.courseData?.title || parsed.courseData?.description)) {
                            setLocalDraftTime(parsed.lastSaved || null)
                            setHasPendingDraft(true)
                        }
                    } catch (e) {
                        console.error("Failed to parse draft", e)
                    }
                }
            }
        }
        fetchAllData().then(() => {
            // Wait for user to load before checking for local draft
            apiClient.get('/api/users/me').then(res => {
                if (res.data?.user) detectLocalDraft(res.data.user)
            }).catch(() => { })
        })
    }, [editCourseId])

    // Auto-dismiss draft banner if user starts typing (implicit "Start Fresh")
    useEffect(() => {
        if (hasPendingDraft && !editCourseId && (courseData.title || courseData.description)) {
            localStorage.removeItem('local_course_draft')
            setHasPendingDraft(false)
            setLocalDraftTime(null)
        }
    }, [courseData.title, courseData.description])

    // Auto-save draft (only when banner is dismissed)
    useEffect(() => {
        if (!editCourseId && !hasPendingDraft && (courseData.title || courseData.description)) {
            const timer = setTimeout(() => {
                const draft = {
                    courseData,
                    modules,
                    lastSaved: new Date().toISOString(),
                    userId: currentUser?.id
                }
                if (currentUser?.id) {
                    localStorage.setItem('local_course_draft', JSON.stringify(draft))
                    setLocalDraftTime(draft.lastSaved)
                }
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [courseData, modules, editCourseId, hasPendingDraft])

    const handlePublish = async (e?: React.FormEvent, isPublished: boolean = true) => {
        if (e) e.preventDefault()

        if (isPublished) {
            if (!courseData.title || !courseData.description || (!courseData.is_free && !courseData.price) || !courseData.thumbnail_url) {
                toast.error(`Please fill in all required fields (Title, Description, ${courseData.is_free ? '' : 'Price, '}Thumbnail URL)`)
                return
            }
        } else {
            if (!courseData.title) {
                toast.error('Please provide at least a Course Title to save as a draft.')
                return
            }
        }

        if (courseData.title.length > 100) {
            toast.error('Course title must be 100 characters or less.')
            return
        }

        if (!courseData.is_free && courseData.discountPrice && Number(courseData.discountPrice) >= Number(courseData.price)) {
            toast.error('Discount price must be less than the regular price')
            return
        }

        if (isPublished) {
            setIsPublishing(true)
        } else {
            setIsSavingDraft(true)
        }
        try {
            const { data } = await apiClient.get('/api/users/me')
            const user = data.user
            if (!user) {
                toast.error('Please sign in to publish a course')
                return
            }

            const baseSlug = courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            const uniqueId = crypto.randomUUID().split('-')[0]
            let slug = `${baseSlug}-${uniqueId}`

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
                certificate_type: courseData.provide_certificate ? courseData.certificate_type : null,
                price: Number(courseData.price) || 0,
                discount_price: courseData.discountPrice ? Number(courseData.discountPrice) : null,
                provide_certificate: courseData.provide_certificate,
                is_free: courseData.is_free,
                is_published: isPublished
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
                    id: typeof mod.id === 'string' ? mod.id : undefined,
                    course_id: course.id,
                    title: mod.title,
                    video_url: mod.videoUrl,
                    thumbnail_url: mod.videoMode === 'link' ? '' : mod.thumbnailUrl,
                    position: index + 1,
                    mcqs: mod.mcqs || [],
                    attachments: mod.attachments || []
                }))

                if (lecturesToInsert.length > 0) {
                    await coursesService.updateLectures(course.id, lecturesToInsert);
                }
            }

            if (!editCourseId) {
                localStorage.removeItem('local_course_draft')
            }

            if (isPublished) {
                setShowSuccessModal(true)
                setTimeout(() => {
                    if (currentUserRole === 'admin') {
                        router.push('/admin/courses')
                    } else {
                        router.push('/instructor/courses')
                    }
                }, editCourseId ? 3000 : 6000)
            } else {
                toast.success('Draft saved successfully!')
                setTimeout(() => {
                    if (currentUserRole === 'admin') {
                        router.push('/admin/courses')
                    } else {
                        router.push('/instructor/courses')
                    }
                }, 1500)
            }
        } catch (error: any) {
            console.error('Error publishing course:', error)
            toast.error('Failed to save course: ' + error.message)
        } finally {
            setIsSavingDraft(false)
            setIsPublishing(false)
        }
    }

    const addModule = () => {
        const newId = Date.now();
        setModules([...modules, { id: newId, title: 'New Module', videoMode: 'upload', videoUrl: '', thumbnailMode: 'upload', thumbnailUrl: '', mcqs: [], attachments: [] }]);
        setOpenModuleIds(prev => {
            const next = new Set(prev);
            next.add(newId);
            return next;
        });
    }

    const removeModule = (id: number) => {
        setModules(modules.filter(m => m.id !== id))
    }

    const updateModule = (id: number, field: string, value: any) => {
        setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m))
    }

    const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
    const [generatingModuleMcqs, setGeneratingModuleMcqs] = useState<number | null>(null);

    const extractAndParseJSON = (text: string, isArray: boolean = false) => {
        let jsonText = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
        } else {
            const startChar = isArray ? '[' : '{';
            const endChar = isArray ? ']' : '}';
            const firstIdx = text.indexOf(startChar);
            const lastIdx = text.lastIndexOf(endChar);
            if (firstIdx !== -1 && lastIdx !== -1 && lastIdx > firstIdx) {
                jsonText = text.substring(firstIdx, lastIdx + 1);
            }
        }
        
        // Sanitize control characters that break JSON.parse if they are inside strings
        jsonText = jsonText.replace(/[\n\r\t]+/g, ' ');
        return JSON.parse(jsonText);
    };

    const generateCourseDetails = async () => {
        if (!courseData.title) {
            toast.error('Please enter a Course Title first to generate details.');
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
            
            try {
                const json = extractAndParseJSON(reply, false);
                if (json && json.description && json.detailed_overview) {
                    setCourseData({ ...courseData, description: json.description, detailed_overview: json.detailed_overview });
                } else {
                    throw new Error("Missing required fields in JSON");
                }
            } catch (err) {
                console.error("AI returned invalid format. Raw reply:", reply);
                throw new Error("No JSON object found in response");
            }
        } catch (e) {
            console.error('Error generating details', e);
            toast.error('Failed to generate details. Please try again. Ensure Groq API is reachable.');
        } finally {
            setIsGeneratingDetails(false);
        }
    }

    const generateMCQs = async (modId: number, modTitle: string) => {
        if (!modTitle || modTitle === 'New Module') {
            toast.error('Please enter a specific Module Title to generate relevant questions.');
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
            
            let questions = null;
            try {
                // Try array first
                questions = extractAndParseJSON(reply, true);
            } catch (err1) {
                try {
                    // Try object fallback
                    const parsedObj = extractAndParseJSON(reply, false);
                    questions = parsedObj.questions || parsedObj.mcqs || parsedObj.data || null;
                } catch (err2) {
                    console.error("AI returned invalid format. Raw reply:", reply);
                    throw new Error("No JSON array found in response");
                }
            }

            if (Array.isArray(questions)) {
                updateModule(modId, 'mcqs', questions);
            } else {
                console.error("Parsed JSON does not contain an array:", questions);
                throw new Error("Parsed JSON does not contain an array");
            }
        } catch (e) {
            console.error('Error generating MCQs', e);
            toast.error('Failed to generate MCQs. Please try again.');
        } finally {
            setGeneratingModuleMcqs(null);
        }
    }

    const renderSelectedInstructor = () => {
        if (courseData.instructor_id === 'none') return <span>Unassigned (No Instructor)</span>
        if (courseData.instructor_id === 'myself') return <span>Assign to myself</span>

        const inst = instructors.find(i => i.id === courseData.instructor_id)

        if (inst) {
            const initials = (inst.full_name || inst.email || 'IN').substring(0, 2).toUpperCase()
            return (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center overflow-hidden shrink-0">
                        {inst.avatar_url ? <img src={inst.avatar_url} className="w-full h-full object-cover" alt="avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${initials}&background=random` }} /> : <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300">{initials}</span>}
                    </div>
                    <span>{inst.full_name || inst.email}</span>
                </div>
            )
        }

        if ((courseData as any).initial_instructor_name) {
            const name = (courseData as any).initial_instructor_name;
            const initials = name.substring(0, 2).toUpperCase()
            return (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300">{initials}</span>
                    </div>
                    <span>{name}</span>
                </div>
            )
        }

        return <span>Assign Instructor</span>
    }

    if (isLoadingData) {
        return <Loader type="course-builder" />
    }

    return (
        <form
            onSubmit={handlePublish}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }}
            className="w-full mx-auto p-6 lg:p-8 pb-32"
        >

            {mounted && typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showSuccessModal && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 pointer-events-auto">
                            {!editCourseId && <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />}
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
                                    {editCourseId ? "Course Updated!" : "Congratulations!"}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-500 dark:text-slate-400 font-medium mb-8"
                                >
                                    {editCourseId ? (
                                        <>Your course <strong className="text-slate-900 dark:text-white">"{courseData.title}"</strong> has been successfully updated.</>
                                    ) : (
                                        <>Your course <strong className="text-slate-900 dark:text-white">"{courseData.title}"</strong> has been successfully published to the platform! 🚀</>
                                    )}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <button type="button" onClick={() => router.push(currentUserRole === 'admin' ? '/admin/courses' : '/instructor/courses')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                                        Go to Course Management
                                    </button>
                                    <p className="text-xs text-slate-400 font-bold mt-4 animate-pulse">Redirecting automatically in a few seconds...</p>
                                </motion.div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.getElementById('modal-root') || document.body
            )}

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Course Builder
                    </motion.h1>
                </div>
                <div className="flex gap-3 items-center">
                    {localDraftTime && !editCourseId && !hasPendingDraft && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Draft: {new Date(localDraftTime).toLocaleTimeString()}</span>
                            <button type="button" onClick={() => { localStorage.removeItem('local_course_draft'); setLocalDraftTime(null); setCourseData({ title: '', description: '', detailed_overview: '', price: '', discountPrice: '', category: 'Artificial Intelligence', target_role: 'Machine Learning Engineer', primary_skill: 'Python', certificate_type: 'Professional Certificates', thumbnail_url: '', instructor_id: 'myself', provide_certificate: true, is_free: false, is_published: false, is_archived: false }); setModules([{ id: 1, title: 'Introduction to the Course', videoMode: 'upload', videoUrl: '', thumbnailMode: 'upload', thumbnailUrl: '', mcqs: [], attachments: [] }]); toast.success('Draft discarded') }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Discard</button>
                        </div>
                    )}
                    {!courseData.is_published && !courseData.is_archived && !isLoadingData && (
                        <button type="button" onClick={(e) => handlePublish(e, false)} disabled={isSavingDraft || isPublishing} className="px-5 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm">
                            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                        </button>
                    )}
                    <button type="submit" onClick={(e) => handlePublish(e, true)} disabled={isSavingDraft || isPublishing || isLoadingData} className={`px-5 py-2.5 rounded-md text-white font-bold transition-colors shadow-sm text-sm flex items-center gap-2 ${(isPublishing || isLoadingData) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isPublishing ? 'Submitting...' : 'Submit Course'}
                    </button>
                </div>
            </header>

            {/* Draft Recovery Banner */}
            {hasPendingDraft && !editCourseId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">You have an unsaved draft</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Last saved {localDraftTime ? new Date(localDraftTime).toLocaleString() : 'recently'}. Would you like to resume or start fresh?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                const savedDraftStr = localStorage.getItem('local_course_draft')
                                if (savedDraftStr) {
                                    try {
                                        const parsed = JSON.parse(savedDraftStr)
                                        if (parsed.courseData) setCourseData(parsed.courseData)
                                        if (parsed.modules) setModules(parsed.modules)
                                    } catch (e) { console.error(e) }
                                }
                                setHasPendingDraft(false)
                            }}
                            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                            Resume Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('local_course_draft')
                                setLocalDraftTime(null)
                                setHasPendingDraft(false)
                                toast.success('Draft discarded — starting fresh')
                            }}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            Start Fresh
                        </button>
                    </div>
                </motion.div>
            )}

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
                            <div
                                title={!courseData.title?.trim() ? "Enter a Course Title first to generate AI details" : ""}
                            >
                                <button
                                    type="button"
                                    onClick={generateCourseDetails}
                                    disabled={isGeneratingDetails || !courseData.title?.trim()}
                                    title={!courseData.title?.trim() ? "Enter a Course Title first to generate AI details" : ""}
                                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${(isGeneratingDetails || !courseData.title?.trim())
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
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
                        </div>
                        <div className="space-y-5">
                            {currentUserRole === 'admin' && (
                                <div className="relative" ref={instructorDropdownRef}>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assign Instructor (Admin Only)</label>

                                    {/* Custom Dropdown Button */}
                                    <div
                                        onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 text-sm font-semibold text-blue-900 dark:text-blue-300 cursor-pointer transition-colors"
                                    >
                                        {renderSelectedInstructor()}
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isInstructorDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {/* Custom Dropdown Menu */}
                                    {isInstructorDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                        >
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                                                <div
                                                    onClick={() => { setCourseData({ ...courseData, instructor_id: 'myself' }); setIsInstructorDropdownOpen(false) }}
                                                    className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${courseData.instructor_id === 'myself' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                >
                                                    Assign to myself
                                                </div>
                                                <div
                                                    onClick={() => { setCourseData({ ...courseData, instructor_id: 'none' }); setIsInstructorDropdownOpen(false) }}
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
                                                            onClick={() => { setCourseData({ ...courseData, instructor_id: inst.id }); setIsInstructorDropdownOpen(false) }}
                                                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center gap-3 ${courseData.instructor_id === inst.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                                {inst.avatar_url ? <img src={inst.avatar_url} className="w-full h-full object-cover" alt="avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${initials}&background=random` }} /> : <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">{initials}</span>}
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
                                <input required maxLength={100} type="text" value={courseData.title} onChange={(e) => setCourseData({ ...courseData, title: e.target.value })} placeholder="e.g. Advanced AI Agents Masterclass" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Short Description <span className="text-red-500">*</span></label>
                                <textarea required rows={3} value={courseData.description} onChange={(e) => setCourseData({ ...courseData, description: e.target.value })} placeholder="A short summary of what students will learn..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y custom-scrollbar" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Overview</label>
                                <textarea rows={6} value={courseData.detailed_overview} onChange={(e) => setCourseData({ ...courseData, detailed_overview: e.target.value })} placeholder="Provide a comprehensive course description for the student preview page..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y custom-scrollbar" />
                            </div>



                            {/* Metadata Tags for Explore Filtering */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Explore Tags (For Filtering)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <CustomDropdown
                                        label="Category"
                                        value={courseData.category}
                                        onChange={(val) => setCourseData({ ...courseData, category: val })}
                                        options={[
                                            { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                                            { value: 'Business', label: 'Business' },
                                            { value: 'Data Science', label: 'Data Science' },
                                            { value: 'Information Technology', label: 'Information Technology' },
                                            { value: 'Healthcare', label: 'Healthcare' },
                                            { value: 'Web Development', label: 'Web Development' },
                                            { value: 'Digital Marketing', label: 'Digital Marketing' },
                                            { value: 'Cloud Computing', label: 'Cloud Computing' },
                                            { value: 'Graphic Design', label: 'Graphic Design' },
                                            { value: 'Finance & Accounting', label: 'Finance & Accounting' }
                                        ]}
                                    />
                                    <CustomDropdown
                                        label="Target Role"
                                        value={courseData.target_role}
                                        onChange={(val) => setCourseData({ ...courseData, target_role: val })}
                                        options={[
                                            { value: 'Data Analyst', label: 'Data Analyst' },
                                            { value: 'Project Manager', label: 'Project Manager' },
                                            { value: 'Cyber Security Analyst', label: 'Cyber Security Analyst' },
                                            { value: 'UI / UX Designer', label: 'UI / UX Designer' },
                                            { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer' },
                                            { value: 'Software Engineer', label: 'Software Engineer' },
                                            { value: 'Frontend Developer', label: 'Frontend Developer' },
                                            { value: 'Backend Developer', label: 'Backend Developer' },
                                            { value: 'Marketing Manager', label: 'Marketing Manager' },
                                            { value: 'Financial Analyst', label: 'Financial Analyst' }
                                        ]}
                                    />
                                    <CustomDropdown
                                        label="Primary Skill"
                                        value={courseData.primary_skill}
                                        onChange={(val) => setCourseData({ ...courseData, primary_skill: val })}
                                        options={[
                                            { value: 'Python', label: 'Python' },
                                            { value: 'Machine Learning', label: 'Machine Learning' },
                                            { value: 'SQL', label: 'SQL' },
                                            { value: 'Excel', label: 'Excel' },
                                            { value: 'Power BI', label: 'Power BI' },
                                            { value: 'React', label: 'React' },
                                            { value: 'JavaScript', label: 'JavaScript' },
                                            { value: 'Node.js', label: 'Node.js' },
                                            { value: 'SEO', label: 'SEO' },
                                            { value: 'AWS', label: 'AWS' },
                                            { value: 'Java', label: 'Java' },
                                            { value: 'C++', label: 'C++' },
                                            { value: 'Go', label: 'Go' }
                                        ]}
                                    />
                                    {courseData.provide_certificate && (
                                        <CustomDropdown
                                            label="Certificate Type"
                                            value={courseData.certificate_type}
                                            onChange={(val) => setCourseData({ ...courseData, certificate_type: val })}
                                            options={[
                                                { value: 'Professional Certificates', label: 'Professional Certificates' },
                                                { value: 'Online Degrees', label: 'Online Degrees' },
                                                { value: 'Specializations', label: 'Specializations' },
                                                { value: 'Master\'s Degrees', label: 'Master\'s Degrees' }
                                            ]}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
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
                                <div
                                    key={mod.id}
                                    draggable
                                    onDragStart={(e) => {
                                        setDraggedModuleIndex(index);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = "move";
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedModuleIndex === null || draggedModuleIndex === index) {
                                            setDraggedModuleIndex(null);
                                            return;
                                        }
                                        const newModules = [...modules];
                                        const draggedItem = newModules[draggedModuleIndex];
                                        newModules.splice(draggedModuleIndex, 1);
                                        newModules.splice(index, 0, draggedItem);
                                        setModules(newModules);
                                        setDraggedModuleIndex(null);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedModuleIndex(null);
                                    }}
                                    className={`transition-all ${draggedModuleIndex === index ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    <div className="group border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-800/20 shadow-sm">
                                        <div
                                            className="flex items-center justify-between p-4 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 cursor-pointer select-none transition-colors"
                                            onClick={(e: any) => {
                                                if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                                                    return;
                                                }
                                                setOpenModuleIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(mod.id)) next.delete(mod.id); else next.add(mod.id);
                                                    return next;
                                                });
                                            }}
                                        >
                                            <div className="flex items-center gap-3 w-full pr-4">
                                                <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                                </div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">Module {index + 1}:</span>
                                                <input
                                                    type="text"
                                                    value={mod.title}
                                                    onChange={(e) => updateModule(mod.id, 'title', e.target.value)}
                                                    placeholder="Module Title"
                                                    title="Edit module title"
                                                    className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 text-sm flex-1 focus:ring-0 p-0"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <div className={`text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 transition-transform ${openModuleIds.has(mod.id) ? 'rotate-180' : ''}`}>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                                {modules.length > 1 && (
                                                    <button type="button" onClick={() => removeModule(mod.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <AnimatePresence initial={false}>
                                            {openModuleIds.has(mod.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
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
                                                                <div className="flex min-h-[100px] relative overflow-hidden cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 transition hover:border-blue-400 dark:hover:border-blue-500">
                                                                    <input
                                                                        key={`vid-file-${mod.id}`}
                                                                        type="file"
                                                                        accept="video/*"
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            let loadingToastId;
                                                                            try {
                                                                                loadingToastId = toast.loading('Uploading video...');
                                                                                const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                                                                                const { data } = await apiClient.post('/api/upload/url', {
                                                                                    bucket: 'course-materials',
                                                                                    filePath
                                                                                });

                                                                                if (!data.uploadUrl) throw new Error("Could not get upload url");

                                                                                const res = await fetch(data.uploadUrl, {
                                                                                    method: 'PUT',
                                                                                    headers: { 'Content-Type': file.type },
                                                                                    body: file
                                                                                });

                                                                                if (!res.ok) throw new Error("Failed to upload to storage");

                                                                                updateModule(mod.id, 'videoUrl', data.publicUrl);
                                                                                toast.success('Uploaded successfully!', { id: loadingToastId });
                                                                            } catch (err: any) {
                                                                                console.error(err);
                                                                                if (loadingToastId) {
                                                                                    toast.error('Failed to upload video', { id: loadingToastId });
                                                                                } else {
                                                                                    toast.error('Failed to upload video');
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {mod.videoUrl && !mod.videoUrl.includes('youtube.com') ? (
                                                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Video Uploaded</span>
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> Browse Video</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <input key={`vid-url-${mod.id}`} type="url" value={mod.videoUrl || ''} onChange={(e) => updateModule(mod.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all" />
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
                                                                    <div className="flex min-h-[100px] relative overflow-hidden cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 transition hover:border-purple-400 dark:hover:border-purple-500">
                                                                        <input
                                                                            key={`thumb-file-${mod.id}`}
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            onChange={async (e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (!file) return;
                                                                                let loadingToastId;
                                                                                try {
                                                                                    loadingToastId = toast.loading('Uploading thumbnail...');
                                                                                    const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                                                                                    const { data } = await apiClient.post('/api/upload/url', {
                                                                                        bucket: 'course-thumbnails',
                                                                                        filePath
                                                                                    });

                                                                                    if (!data.uploadUrl) throw new Error("Could not get upload url");

                                                                                    const res = await fetch(data.uploadUrl, {
                                                                                        method: 'PUT',
                                                                                        headers: { 'Content-Type': file.type },
                                                                                        body: file
                                                                                    });

                                                                                    if (!res.ok) throw new Error("Failed to upload to storage");

                                                                                    updateModule(mod.id, 'thumbnailUrl', data.publicUrl);
                                                                                    toast.success('Uploaded successfully!', { id: loadingToastId });
                                                                                } catch (err: any) {
                                                                                    console.error(err);
                                                                                    if (loadingToastId) {
                                                                                        toast.error('Failed to upload thumbnail', { id: loadingToastId });
                                                                                    } else {
                                                                                        toast.error('Failed to upload thumbnail');
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                        {mod.thumbnailUrl && !mod.thumbnailUrl.includes('images.unsplash.com') ? (
                                                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Thumbnail Uploaded</span>
                                                                        ) : (
                                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Browse Image</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3 mt-2">
                                                                        <input key={`thumb-url-${mod.id}`} type="url" value={mod.thumbnailUrl || ''} onChange={(e) => updateModule(mod.id, 'thumbnailUrl', e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 transition-all" />
                                                                        {mod.thumbnailUrl && (
                                                                            <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                                                                <img src={mod.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
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
                                                                    <div title={(!mod.title || mod.title === 'New Module') ? "Please provide a descriptive module title first" : "Generate MCQs using AI"}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => generateMCQs(mod.id, mod.title)}
                                                                            disabled={generatingModuleMcqs === mod.id || !mod.title || mod.title === 'New Module'}
                                                                            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${generatingModuleMcqs === mod.id || !mod.title || mod.title === 'New Module'
                                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                                                                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
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
                                                                    </div>
                                                                    <button type="button" onClick={() => {
                                                                        const newMcqs = [...(mod.mcqs || [])];
                                                                        newMcqs.push({ question: '', options: ['', '', '', ''], correctIndex: 0 });
                                                                        updateModule(mod.id, 'mcqs', newMcqs);
                                                                    }} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors">+ Add Question</button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {(mod.mcqs || []).map((mcq: any, qIdx: number) => (
                                                                    <div key={qIdx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                                                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer outline-none p-4 select-none">
                                                                            {mcq.question || `Question ${qIdx + 1}`}
                                                                        </div>
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
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Module Attachments */}
                                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Module Attachments</h3>
                                                                    <p className="text-xs text-slate-500 mt-1">Add PDFs, code zips, or other resources students can download.</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateModule(mod.id, 'attachments', [...(mod.attachments || []), { title: '', url: '', mode: 'upload' }])}
                                                                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                                >
                                                                    + Add Attachment
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {(mod.attachments || []).map((att: any, i: number) => (
                                                                    <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                                        <div className="flex-1 space-y-3">
                                                                            <input
                                                                                type="text"
                                                                                value={att.title}
                                                                                onChange={(e) => {
                                                                                    const newAtt = [...(mod.attachments || [])];
                                                                                    newAtt[i].title = e.target.value;
                                                                                    updateModule(mod.id, 'attachments', newAtt);
                                                                                }}
                                                                                placeholder="Attachment Title (e.g. Slide Deck PDF)"
                                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
                                                                            />
                                                                            <div className="flex items-center justify-between mt-2 mb-1">
                                                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">File Source</label>
                                                                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-md">
                                                                                    <button type="button" onClick={() => { const newAtt = [...(mod.attachments || [])]; newAtt[i].mode = 'upload'; updateModule(mod.id, 'attachments', newAtt); }} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${(att.mode || 'upload') === 'upload' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                                                                    <button type="button" onClick={() => { const newAtt = [...(mod.attachments || [])]; newAtt[i].mode = 'link'; updateModule(mod.id, 'attachments', newAtt); }} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${att.mode === 'link' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Link URL</button>
                                                                                </div>
                                                                            </div>
                                                                            {(att.mode || 'upload') === 'upload' ? (
                                                                                <div className="flex min-h-[80px] relative overflow-hidden cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 transition hover:border-blue-400 dark:hover:border-blue-500">
                                                                                    <input
                                                                                        type="file"
                                                                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                                        onChange={async (e) => {
                                                                                            const file = e.target.files?.[0];
                                                                                            if (!file) return;
                                                                                            let loadingToastId;
                                                                                            try {
                                                                                                loadingToastId = toast.loading('Uploading attachment...');
                                                                                                const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                                                                                                const { data } = await apiClient.post('/api/upload/url', {
                                                                                                    bucket: 'course-materials',
                                                                                                    filePath
                                                                                                });

                                                                                                if (!data.uploadUrl) throw new Error("Could not get upload url");

                                                                                                const res = await fetch(data.uploadUrl, {
                                                                                                    method: 'PUT',
                                                                                                    headers: { 'Content-Type': file.type },
                                                                                                    body: file
                                                                                                });

                                                                                                if (!res.ok) throw new Error("Failed to upload to storage");

                                                                                                const newAtt = [...(mod.attachments || [])];
                                                                                                newAtt[i].url = data.publicUrl;
                                                                                                if (!newAtt[i].title) newAtt[i].title = file.name;
                                                                                                updateModule(mod.id, 'attachments', newAtt);
                                                                                                toast.success('Uploaded successfully!', { id: loadingToastId });
                                                                                            } catch (err: any) {
                                                                                                console.error(err);
                                                                                                if (loadingToastId) {
                                                                                                    toast.error('Failed to upload file', { id: loadingToastId });
                                                                                                } else {
                                                                                                    toast.error('Failed to upload file');
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    {att.url ? (
                                                                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> File Uploaded</span>
                                                                                    ) : (
                                                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> Browse File (PDF, DOCX)</span>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <input
                                                                                    type="url"
                                                                                    value={att.url}
                                                                                    onChange={(e) => {
                                                                                        const newAtt = [...(mod.attachments || [])];
                                                                                        newAtt[i].url = e.target.value;
                                                                                        updateModule(mod.id, 'attachments', newAtt);
                                                                                    }}
                                                                                    placeholder="Attachment URL (https://...)"
                                                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newAtt = [...(mod.attachments || [])];
                                                                                newAtt.splice(i, 1);
                                                                                updateModule(mod.id, 'attachments', newAtt);
                                                                            }}
                                                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {!(mod.attachments?.length) && (
                                                                    <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                                                        No attachments added yet.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Pricing</h2>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setCourseData({ ...courseData, is_free: false })}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${!courseData.is_free ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Paid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCourseData({ ...courseData, is_free: true, price: '0', discountPrice: '' })}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${courseData.is_free ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Free
                                </button>
                            </div>
                        </div>

                        {!courseData.is_free ? (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input required type="number" min="0" value={courseData.price} onChange={(e) => setCourseData({ ...courseData, price: e.target.value })} placeholder="4999" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Discount Price (₹)</label>
                                    <div className="relative">
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${courseData.discountPrice && Number(courseData.discountPrice) >= Number(courseData.price) ? 'text-red-400' : 'text-slate-400'}`}>₹</span>
                                        <input type="number" min="0" value={courseData.discountPrice} onChange={(e) => setCourseData({ ...courseData, discountPrice: e.target.value })} placeholder="2999" className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none transition-all ${courseData.discountPrice && Number(courseData.discountPrice) >= Number(courseData.price) ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}`} />
                                    </div>
                                    {courseData.discountPrice && Number(courseData.discountPrice) >= Number(courseData.price) ? (
                                        <p className="text-xs font-bold text-red-500 mt-2">Discount price must be less than the regular price.</p>
                                    ) : (
                                        <p className="text-xs font-medium text-slate-500 mt-2">Leave blank if no discount is offered.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5 flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Free Course</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">This course will be available to all students for free. Enrollments will be automatically created when they start learning.</p>
                                </div>
                            </div>
                        )}

                        <hr className="my-6 border-slate-200 dark:border-slate-800" />

                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Settings</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setCourseData({ ...courseData, provide_certificate: !courseData.provide_certificate })}>
                                <div className={`relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${courseData.provide_certificate ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                                    {courseData.provide_certificate && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Provide Certificate on Completion</span>
                            </label>
                        </div>
                    </motion.div>

                    {/* Main Course Thumbnail */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
                    >
                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Course Thumbnail</h2>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button type="button" onClick={() => setThumbnailMode('upload')} className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'upload' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                <button type="button" onClick={() => setThumbnailMode('unsplash')} className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'unsplash' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Link</button>
                            </div>
                        </div>

                        {thumbnailMode === 'upload' ? (
                            <div className="flex min-h-[160px] relative overflow-hidden cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10">
                                <input
                                    key="course-thumb-file"
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        let loadingToastId;
                                        try {
                                            loadingToastId = toast.loading('Uploading thumbnail...');
                                            const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                                            const { data } = await apiClient.post('/api/upload/url', {
                                                bucket: 'course-thumbnails',
                                                filePath
                                            });

                                            if (!data.uploadUrl) throw new Error("Could not get upload url");

                                            const res = await fetch(data.uploadUrl, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': file.type },
                                                body: file
                                            });

                                            if (!res.ok) throw new Error("Failed to upload to storage");

                                            setCourseData({ ...courseData, thumbnail_url: data.publicUrl });
                                            toast.success('Uploaded successfully!', { id: loadingToastId });
                                        } catch (err: any) {
                                            console.error(err);
                                            if (loadingToastId) {
                                                toast.error('Failed to upload thumbnail', { id: loadingToastId });
                                            } else {
                                                toast.error('Failed to upload thumbnail');
                                            }
                                        }
                                    }}
                                />
                                {courseData.thumbnail_url && !courseData.thumbnail_url.includes('images.unsplash.com') ? (
                                    <div className="flex flex-col items-center">
                                        <svg className="mb-2 h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Thumbnail Uploaded</span>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mb-3 h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center px-4">Drag & drop image or click to browse</span>
                                        <span className="text-xs text-slate-400 mt-1">1920x1080 recommended</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input key="course-thumb-url" required type="url" value={courseData.thumbnail_url || ''} onChange={(e) => setCourseData({ ...courseData, thumbnail_url: e.target.value })} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                                {courseData.thumbnail_url && (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                                        <img src={courseData.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </form>
    )
}
