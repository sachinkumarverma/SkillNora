"use client"
import React, { useEffect, useState } from 'react'
import VideoPlayer from '@/components/VideoPlayer'

import useUser from '@/lib/useUser'
import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })
import { coursesService } from '@/services/coursesService'
import { commentsService } from '@/services/commentsService'
import Link from 'next/link'
import apiClient from '@/lib/apiClient'

export default function LecturePage({ params }: { params: Promise<{ slug: string, id: string }> }) {
    const { slug, id } = React.use(params)
    const { user } = useUser()
    const [lecture, setLecture] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [certUnlocked, setCertUnlocked] = useState(false)
    const [timeElapsed, setTimeElapsed] = useState(false)
    const [videoCompleted, setVideoCompleted] = useState(false)
    const [courseInfo, setCourseInfo] = useState<{ id: string, title: string, slug: string, totalLectures: number } | null>(null)
    const [noteText, setNoteText] = useState("")
    const [noteSaved, setNoteSaved] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [attachments, setAttachments] = useState<{ title: string, url: string }[]>([])
    const [showQuiz, setShowQuiz] = useState(false)
    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({})
    const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean } | null>(null)

    // Comments State
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [loadingComments, setLoadingComments] = useState(true)
    const [isPostingComment, setIsPostingComment] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [replyingTo, setReplyingTo] = useState<any | null>(null)

    useEffect(() => {
        if (!slug || !id) return
        const fetchComments = async () => {
            try {
                const data = await commentsService.getComments(slug as string, id as string)
                if (data && Array.isArray(data.comments)) {
                    setComments(data.comments)
                } else if (Array.isArray(data)) {
                    setComments(data)
                }
            } catch (err) {
                console.error("Failed to fetch comments", err)
            } finally {
                setLoadingComments(false)
            }
        }
        fetchComments()
    }, [slug, id])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    const handlePostComment = async () => {
        if ((!newComment.trim() && !imageFile) || !user) return
        setIsPostingComment(true)
        try {
            let uploadedImageUrl = null;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `comments/${user.id}-${Math.random()}.${fileExt}`
                const { data } = await apiClient.post('/api/upload/url', {
                    bucket: 'course-thumbnails',
                    filePath: fileName
                })
                if (data.uploadUrl) {
                    await fetch(data.uploadUrl, { method: 'PUT', body: imageFile, headers: { 'Content-Type': imageFile.type } })
                    uploadedImageUrl = data.publicUrl
                }
            }

            const added = await commentsService.addComment({
                course_slug: slug,
                lecture_id: id,
                text: newComment,
                image_url: uploadedImageUrl,
                parent_id: replyingTo?.id || null,
                user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                role: user?.user_metadata?.role || 'student'
            })
            if (added && added.comment) {
                setComments([...comments, added.comment])
            } else if (added) {
                setComments([...comments, added])
            }
            setNewComment("")
            setImageFile(null)
            setReplyingTo(null)
        } catch (err) {
            console.error("Failed to post comment", err)
            alert("Failed to post comment. Please try again.")
        } finally {
            setIsPostingComment(false)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return
        try {
            await commentsService.deleteComment(commentId)
            setComments(comments.filter(c => c.id !== commentId))
        } catch (err) {
            console.error("Failed to delete comment", err)
            alert("Failed to delete comment.")
        }
    }



    useEffect(() => {
        if (!id || !slug) return
        let mounted = true
        const fetchLecture = async () => {
            const res = await coursesService.getOne(slug as string)
            const course = res?.course || res
            if (mounted) {
                if (course) {
                    setCourseInfo({ id: course.id, title: course.title, slug: course.slug, totalLectures: course.lectures?.length || 1 })
                    const lec = course.lectures?.find((l: any) => String(l.id) === String(id))
                    if (lec) setLecture(lec)
                    
                    if (course.isEnrolled) {
                        setIsEnrolled(true)
                        if (course.progress && course.progress[course.slug]?.includes(String(id))) {
                            setVideoCompleted(true)
                            setTimeElapsed(true)
                        }
                    }
                } else {
                    setLecture(null)
                }
                setLoading(false)
            }
        }
        fetchLecture()
        return () => { mounted = false }
    }, [slug, id])

    useEffect(() => {
        if (!slug || !id) return
        const notes = JSON.parse(localStorage.getItem('skillnora_notes') || '[]')
        const existingNote = notes.find((n: any) => n.courseSlug === slug && String(n.lectureId) === String(id))
        if (existingNote) {
            setNoteText(existingNote.text)
        }
    }, [slug, id])

    const saveNote = () => {
        if (!courseInfo || !lecture) return
        const notes = JSON.parse(localStorage.getItem('skillnora_notes') || '[]')
        const noteIndex = notes.findIndex((n: any) => n.courseSlug === slug && String(n.lectureId) === String(id))

        const noteData = {
            id: crypto.randomUUID(),
            courseSlug: slug,
            lectureId: id,
            courseTitle: courseInfo.title,
            lectureTitle: lecture.title,
            text: noteText,
            updatedAt: new Date().toISOString()
        }

        if (noteIndex >= 0) {
            notes[noteIndex] = noteData
        } else {
            notes.push(noteData)
        }

        localStorage.setItem('skillnora_notes', JSON.stringify(notes))
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 3000)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeElapsed(true)
        }, 120000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!courseInfo || !lecture) return

        // Check if already certified
        const certs = JSON.parse(localStorage.getItem('skillnora_certificates') || '[]')
        if (certs.find((c: any) => c.courseSlug === courseInfo.slug)) {
            setCertUnlocked(true)
            return
        }

        // Handle lecture completion using DB
        if (timeElapsed && videoCompleted) {
            coursesService.completeLecture({
                courseId: courseInfo.id,
                slug: courseInfo.slug,
                lectureId: lecture.id,
                totalLectures: courseInfo.totalLectures
            }).then((res: any) => {
                if (res?.certificateUnlocked) {
                    setCertUnlocked(true);
                }
            }).catch(console.error);
        }
    }, [courseInfo, lecture, timeElapsed, videoCompleted])

    const handleVideoEnd = () => {
        if (lecture?.mcqs && lecture.mcqs.length > 0) {
            setShowQuiz(true)
        } else {
            setVideoCompleted(true)
            setTimeElapsed(true)
        }
    }

    if (loading) return (
        <div className="flex h-[60vh] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
    )

    if (!lecture) return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Lecture Not Found</h1>
            <p className="text-slate-500">The lecture you are looking for does not exist or has been removed.</p>
            <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
    )

    const isYoutube = lecture.videoUrl?.includes('youtube.com') || lecture.video_url?.includes('youtube.com')

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <main className='lg:col-span-2'>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-blue-600">Lecture {id}</span>
                                <span>•</span>
                                <span>Video Lecture</span>
                            </div>
                            {certUnlocked && (
                                <a href="/certificates" className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold animate-pulse hover:bg-green-200 transition">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Certificate Unlocked!
                                </a>
                            )}
                        </div>
                        <h1 className='text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6'>{lecture.title}</h1>

                        <div className='overflow-hidden rounded-xl bg-slate-900 aspect-video relative shadow-lg group'>
                            {!isEnrolled ? (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Unlock to Watch</h2>
                                    <p className="text-slate-300 text-sm mb-6 max-w-md text-center">You need to be enrolled in this course to access the video lectures and resources.</p>
                                    <Link href={`/courses/${slug}/checkout`} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-transform transform active:scale-95 shadow-lg">
                                        Enroll Now
                                    </Link>
                                </div>
                            ) : null}
                            {isEnrolled && (
                                <>
                                    {(lecture.videoUrl?.includes('youtube') || lecture.video_url?.includes('youtube')) ? (
                                        <iframe
                                            src={lecture.videoUrl || lecture.video_url}
                                            width="100%"
                                            height="100%"
                                            style={{ position: 'absolute', top: 0, left: 0 }}
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : (
                                        <ReactPlayer
                                            url={lecture.videoUrl || lecture.video_url}
                                            width="100%"
                                            height="100%"
                                            controls
                                            playing={!showQuiz}
                                            onEnded={handleVideoEnd}
                                            config={{ file: { attributes: { poster: lecture.poster_url } } }}
                                            style={{ position: 'absolute', top: 0, left: 0 }}
                                        />
                                    )}
                                    {showQuiz && !videoCompleted && (
                                        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar">
                                            {quizResult ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                                                    {quizResult.passed ? (
                                                        <>
                                                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            </div>
                                                            <h2 className="text-3xl font-bold text-white mb-3">Great Job!</h2>
                                                            <p className="text-slate-300 mb-4 sm:mb-8 text-sm sm:text-base">You scored {quizResult.score}% and passed the module quiz.</p>
                                                            <button onClick={() => { setShowQuiz(false); setVideoCompleted(true); setTimeElapsed(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Continue Course</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </div>
                                                            <h2 className="text-3xl font-bold text-white mb-3">Needs Review</h2>
                                                            <p className="text-slate-300 mb-4 sm:mb-8 text-sm sm:text-base">You scored {quizResult.score}%. We recommend reviewing the video to strengthen your understanding.</p>
                                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                                                                <button onClick={() => { setShowQuiz(false); setQuizAnswers({}); setQuizResult(null); }} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 sm:py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Watch Again</button>
                                                                <button onClick={() => { setQuizAnswers({}); setQuizResult(null); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 sm:py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Retake Quiz</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="max-w-2xl w-full mx-auto pb-8">
                                                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Knowledge Check</h2>
                                                    <div className="space-y-6">
                                                        {lecture.mcqs.map((mcq: any, qIdx: number) => (
                                                            <div key={qIdx} className="bg-slate-800 rounded-xl p-6">
                                                                <p className="text-lg font-medium text-white mb-4">{qIdx + 1}. {mcq.question}</p>
                                                                <div className="space-y-3">
                                                                    {mcq.options.map((opt: string, optIdx: number) => (
                                                                        <button
                                                                            key={optIdx}
                                                                            onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                                                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${quizAnswers[qIdx] === optIdx ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-8 flex justify-end">
                                                        <button
                                                            disabled={Object.keys(quizAnswers).length !== lecture.mcqs.length}
                                                            onClick={() => {
                                                                let correct = 0;
                                                                lecture.mcqs.forEach((m: any, i: number) => {
                                                                    if (quizAnswers[i] === m.correctIndex) correct++;
                                                                });
                                                                const score = Math.round((correct / lecture.mcqs.length) * 100);
                                                                setQuizResult({ score, passed: score >= 70 });
                                                            }}
                                                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-transform transform active:scale-95 shadow-lg"
                                                        >
                                                            Submit Answers
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {isEnrolled && !videoCompleted && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleVideoEnd}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                                >
                                    Mark as Complete
                                </button>
                            </div>
                        )}
                    </div>



                    {/* Notes Section */}
                    <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                My Notes
                            </h2>
                            {noteSaved && <span className="text-xs font-bold text-green-600 dark:text-green-400 animate-pulse">✓ Saved successfully</span>}
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Type your notes for this lecture here. They will be saved automatically..."
                            className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors custom-scrollbar resize-y text-slate-700 dark:text-slate-300"
                        ></textarea>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={saveNote}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                Save Notes
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.76 1.48 5.21 3.76 6.8-.29 1.48-1.12 3.06-1.17 3.16-.13.25-.09.56.09.77.19.22.48.31.76.24 3.16-.76 5.51-2.12 6.55-2.76.66.07 1.33.11 2.01.11 5.52 0 10-3.92 10-8.75S17.52 2 12 2zm0 15.5c-.75 0-1.5-.06-2.22-.17-.23-.03-.46.02-.66.13-1.07.62-3.19 1.76-5.84 2.29.53-1.28 1.13-2.92 1.34-4.2.06-.33-.04-.66-.27-.89C2.48 13.3 1.5 11.23 1.5 9.25 1.5 5.25 6.2 2 12 2s10.5 3.25 10.5 7.25S17.8 17.5 12 17.5z"/></svg>
                            Q&A Discussions
                        </h2>
                        
                        {(!replyingTo || !replyingTo.id) && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl mb-8 overflow-hidden bg-white dark:bg-slate-900">
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Ask a question or share a thought..."
                                    className="w-full p-4 bg-transparent text-sm outline-none resize-y min-h-[100px] text-slate-800 dark:text-slate-200 placeholder-slate-400"
                                ></textarea>
                                {imageFile && (
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 relative">
                                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-w-[200px] max-h-[200px] rounded-lg object-contain border border-slate-200 dark:border-slate-700" />
                                        <button onClick={() => setImageFile(null)} className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md text-sm font-bold z-10 transition-colors">×</button>
                                    </div>
                                )}
                                <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                    <label className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium px-2 py-1 rounded cursor-pointer transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Add Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    </label>
                                    <button 
                                        onClick={handlePostComment}
                                        disabled={(!newComment.trim() && !imageFile) || isPostingComment}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm shadow-sm"
                                    >
                                        {isPostingComment ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {loadingComments ? (
                                <div className="text-center text-slate-500 py-4">Loading comments...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-slate-500 py-4 italic">No comments yet. Be the first to start the discussion!</div>
                            ) : (() => {
                                const myRootIds = new Set(comments.filter(c => c.user_id === user?.id && !c.parent_id).map(c => c.id));
                                const visibleComments = comments.filter(c => {
                                    if (user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'instructor') return true;
                                    if (c.user_id === user?.id) return true;
                                    if (myRootIds.has(c.parent_id)) return true;
                                    if (c.parent_id && comments.find(p => p.id === c.parent_id)?.user_id === user?.id) return true;
                                    return false;
                                });
                                const rootComments = visibleComments.filter(c => !c.parent_id);
                                const getReplies = (parentId: string) => visibleComments.filter(c => c.parent_id === parentId);

                                return rootComments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                                            {comment.user_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 w-full min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1 w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white">{user?.id === comment.user_id ? 'You' : comment.user_name}</span>
                                                    {comment.role === 'instructor' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Instructor</span>}
                                                    <span className="text-xs text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                {user?.id === comment.user_id && (
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete Comment">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.text}</p>
                                            {comment.image_url && (
                                                <div className="mt-3 max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={comment.image_url} alt="Attachment" className="w-full h-auto" />
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => setReplyingTo(comment)} className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>

                                            {replyingTo?.id === comment.id && (
                                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl mt-4 mb-4 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 text-xs">
                                                        <span className="text-slate-600 dark:text-slate-300 font-medium ml-2">Replying to <span className="font-bold">{replyingTo.user_name}</span></span>
                                                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-red-500 p-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                    <textarea 
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="w-full p-3 bg-transparent text-sm outline-none resize-y min-h-[80px] text-slate-800 dark:text-slate-200 placeholder-slate-400"
                                                    ></textarea>
                                                    {imageFile && (
                                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 relative">
                                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-w-[150px] max-h-[150px] rounded-lg object-contain border border-slate-200 dark:border-slate-700" />
                                                            <button onClick={() => setImageFile(null)} className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md text-xs font-bold z-10 transition-colors">×</button>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-slate-100 dark:border-slate-800 p-2 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                                        <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium px-2 py-1 rounded cursor-pointer transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            Add Image
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                                        </label>
                                                        <button 
                                                            onClick={handlePostComment}
                                                            disabled={(!newComment.trim() && !imageFile) || isPostingComment}
                                                            className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs shadow-sm"
                                                        >
                                                            {isPostingComment ? 'Posting...' : 'Reply'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Replies */}
                                            {getReplies(comment.id).length > 0 && (
                                                <div className="mt-4 space-y-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                                                    {getReplies(comment.id).map(reply => (
                                                        <div key={reply.id} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs uppercase">
                                                                {reply.user_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2 mb-1 w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{user?.id === reply.user_id ? 'You' : reply.user_name}</span>
                                                                        {reply.role === 'instructor' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Instructor</span>}
                                                                        <span className="text-xs text-slate-400 font-medium">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                    </div>
                                                                    {user?.id === reply.user_id && (
                                                                        <button onClick={() => handleDeleteComment(reply.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete Reply">
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.text}</p>
                                                                {reply.image_url && (
                                                                    <div className="mt-3 max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                                        <img src={reply.image_url} alt="Attachment" className="w-full h-auto" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </main>
                <aside>
                    <div className='p-6 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'>
                        <h3 className='font-bold text-lg text-slate-900 dark:text-white mb-4'>Resources</h3>
                        <ul className='space-y-3 text-sm'>
                            {attachments.length > 0 ? (
                                attachments.map((att, i) => (
                                    <li key={i}>
                                        <a href={att.url} target="_blank" rel="noreferrer" className='flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </div>
                                            <span className="font-bold">{att.title}</span>
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-500 italic p-2">No additional resources available.</li>
                            )}
                        </ul>
                    </div>

                    <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <div className="flex flex-col mb-4 gap-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About this lecture</h2>
                            {!certUnlocked && (
                                <div className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors w-full text-center flex items-center justify-center gap-2 ${videoCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                    {videoCompleted ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            In Progress (Watch to complete)
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                            {lecture.description || 'Watch this comprehensive lecture to master the concepts presented. Follow along with the code and practice to solidify your understanding.'}
                        </div>
                        {!certUnlocked && videoCompleted && !timeElapsed && (
                            <div className="mt-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Note: You must watch the video for at least 2 minutes to unlock the certificate.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}
