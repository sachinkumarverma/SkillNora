"use client"
import React, { useEffect, useState } from 'react'
import useUser from '@/lib/useUser'
import dynamic from 'next/dynamic'

const ReactPlayer: any = dynamic(() => import('react-player'), { ssr: false })
import { coursesService } from '@/services/coursesService'
import Loader from '@/components/ui/Loader'
import { commentsService } from '@/services/commentsService'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
const Confetti = dynamic(() => import('react-confetti'), { ssr: false })
import Link from 'next/link'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

const formatNoteContent = (html: string) => {
    if (!html) return '';
    return html.replace(/<a\b([^>]*)href=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, url, after) => {
        let finalUrl = url;
        if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('mailto:')) {
            finalUrl = 'http://' + finalUrl;
        }
        const cleanBefore = before.replace(/target=(["']).*?\1/gi, '').replace(/rel=(["']).*?\1/gi, '');
        const cleanAfter = after.replace(/target=(["']).*?\1/gi, '').replace(/rel=(["']).*?\1/gi, '');
        return `<a${cleanBefore}href="${finalUrl}" target="_blank" rel="noopener noreferrer"${cleanAfter}>`;
    });
};

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
    const [isSavingNote, setIsSavingNote] = useState(false)
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [attachments, setAttachments] = useState<{ title: string, url: string }[]>([])
    const [showQuiz, setShowQuiz] = useState(false)
    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({})
    const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean } | null>(null)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [savedNotes, setSavedNotes] = useState<any[]>([])
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Comments State
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [replyText, setReplyText] = useState("")
    const [loadingComments, setLoadingComments] = useState(true)
    const [isPostingComment, setIsPostingComment] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [replyImageFile, setReplyImageFile] = useState<File | null>(null)
    const [replyingTo, setReplyingTo] = useState<any | null>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)

    const COMMON_EMOJIS = ['😀','😂','🥰','😎','🤔','🙌','👍','❤️','🔥','🎉','😢','👏'];

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

    const handlePostComment = async (isReply: boolean = false) => {
        const textToPost = isReply ? replyText : newComment;
        const fileToPost = isReply ? replyImageFile : imageFile;
        const parentId = isReply ? replyingTo?.id : null;

        if ((!textToPost.trim() && !fileToPost) || !user) return
        if (isReply && !parentId) return;

        setIsPostingComment(true)
        try {
            let uploadedImageUrl = null;
            if (fileToPost) {
                const fileExt = fileToPost.name.split('.').pop()
                const fileName = `comments/${user.id}-${Math.random()}.${fileExt}`
                const { data } = await apiClient.post('/api/upload/url', {
                    bucket: 'course-thumbnails',
                    filePath: fileName
                })
                if (data.uploadUrl && data.token) {
                    const supabaseModule = await import('@/lib/supabaseClient')
                    const supabase = supabaseModule.default
                    
                    const { error: uploadError } = await supabase.storage
                        .from('course-thumbnails')
                        .uploadToSignedUrl(fileName, data.token, fileToPost)
                        
                    if (uploadError) {
                        alert('Upload failed: ' + uploadError.message)
                        throw new Error('Failed to upload image: ' + uploadError.message)
                    }
                    uploadedImageUrl = data.publicUrl
                } else if (data.uploadUrl) {
                    // Fallback for direct upload URL if token isn't provided (e.g. S3 presigned URL)
                    const res = await fetch(data.uploadUrl, { 
                        method: 'PUT', 
                        body: fileToPost, 
                        headers: { 'Content-Type': fileToPost.type } 
                    })
                    if (!res.ok) throw new Error('Failed to upload image')
                    uploadedImageUrl = data.publicUrl
                }
            }

            const added = await commentsService.addComment({
                course_slug: slug,
                lecture_id: id,
                text: textToPost,
                image_url: uploadedImageUrl,
                parent_id: parentId,
                user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                role: user?.user_metadata?.role || 'student'
            })
            if (added && added.comment) {
                setComments([...comments, added.comment])
            } else if (added) {
                setComments([...comments, added])
            }
            if (isReply) {
                setReplyText("")
                setReplyImageFile(null)
                setReplyingTo(null)
            } else {
                setNewComment("")
                setImageFile(null)
            }
            setShowEmojiPicker(null)
        } catch (err: any) {
            console.error("Failed to post comment", err)
            const backendError = err.response?.data?.error || err.response?.data?.message
            alert("Failed to post comment. " + (backendError || err.message || 'Please try again.'))
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

    const handleReact = async (commentId: string, emoji: string) => {
        try {
            // Optimistic update
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    const reactions = typeof c.reactions === 'string' ? JSON.parse(c.reactions) : (c.reactions || {});
                    const newReactions = { ...reactions };
                    const userId = user?.id;
                    if (userId) {
                        for (const [existingEmoji, usersArray] of Object.entries(newReactions)) {
                            const users = usersArray as string[];
                            if (existingEmoji !== emoji) {
                                const idx = users.indexOf(userId);
                                if (idx > -1) {
                                    newReactions[existingEmoji] = [...users];
                                    (newReactions[existingEmoji] as string[]).splice(idx, 1);
                                    if ((newReactions[existingEmoji] as string[]).length === 0) delete newReactions[existingEmoji];
                                }
                            }
                        }
                        if (!newReactions[emoji]) {
                            newReactions[emoji] = [userId];
                        } else {
                            newReactions[emoji] = [...newReactions[emoji]];
                            const idx = newReactions[emoji].indexOf(userId);
                            if (idx > -1) {
                                newReactions[emoji].splice(idx, 1);
                                if (newReactions[emoji].length === 0) delete newReactions[emoji];
                            } else {
                                newReactions[emoji].push(userId);
                            }
                        }
                    }
                    return { ...c, reactions: newReactions };
                }
                return c;
            }));

            // Send request to backend
            const res = await commentsService.reactToComment(commentId, emoji);
            const updatedComment = res?.comment || res;
            
            // Sync state with backend response to ensure accuracy
            if (updatedComment) {
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, reactions: updatedComment.reactions } : c));
            }
        } catch (err) {
            console.error("Failed to react", err);
        }
    }

    const renderReactionsInline = (comment: any) => {
        const reactions = typeof comment.reactions === 'string' ? JSON.parse(comment.reactions) : (comment.reactions || {});
        const entries = Object.entries(reactions) as [string, string[]][];
        if (entries.length === 0) return null;
        
        return entries.map(([emoji, users]) => {
            if (users.length === 0) return null;
            const hasReacted = user && users.includes(user.id);
            return (
                <button 
                    key={emoji} 
                    onClick={() => handleReact(comment.id, emoji)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-bold transition-colors ${hasReacted ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <span>{emoji}</span>
                    <span>{users.length}</span>
                </button>
            )
        })
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
                    const lecIndex = course.lectures?.findIndex((l: any) => String(l.id) === String(id))
                    const lec = course.lectures?.[lecIndex]
                    if (lec) {
                        const parsedMcqs = Array.isArray(lec.mcqs) ? lec.mcqs : (typeof lec.mcqs === 'string' ? (function(){ try { const p = JSON.parse(lec.mcqs); return Array.isArray(p) ? p : [] } catch(e){ return [] }})() : []);
                        setLecture({ ...lec, mcqs: parsedMcqs, index: lecIndex !== -1 ? lecIndex + 1 : 1 })
                    }
                    
                    if (course.isEnrolled) {
                        setIsEnrolled(true)
                        if (course.progress && course.progress[course.slug]?.includes(String(id))) {
                            setVideoCompleted(true)
                            setTimeElapsed(true)
                        }
                        if (course.progress && course.progress.quizScores && course.progress.quizScores[id] !== undefined) {
                            setQuizCompleted(true)
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
        const loadNotes = async () => {
            if (user) {
                const notesModule = await import('@/services/notesService')
                const notes = await notesModule.notesService.getNotes()
                const existingNotes = notes.filter((n: any) => String(n.course_id) === String(courseInfo?.id) && String(n.lecture_id) === String(id))
                setSavedNotes(existingNotes)
            } else {
                setSavedNotes([])
            }
        }
        loadNotes()
        
        const savedResult = localStorage.getItem(`quiz_result_${courseInfo?.id}_${id}`);
        if (savedResult) {
            try {
                const parsed = JSON.parse(savedResult);
                setQuizResult(parsed.result);
                setQuizAnswers(parsed.answers);
            } catch (e) {}
        }
    }, [slug, id, user, courseInfo])

    const saveNote = async () => {
        if (!courseInfo || !lecture) return
        if (user) {
            setIsSavingNote(true)
            const notesModule = await import('@/services/notesService')
            const newNote = await notesModule.notesService.saveNote(courseInfo.id, lecture.id, noteText)
            setSavedNotes(prev => [newNote, ...prev])
            setNoteText('')
            setNoteSaved(true)
            toast.success('Note saved successfully!')
            setTimeout(() => setNoteSaved(false), 3000)
            setTimeout(() => setIsSavingNote(false), 200)
        } else {
            alert('Please sign in to save notes')
        }
    }
    
    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).tagName === 'IMG') {
            setSelectedImage((e.target as HTMLImageElement).src);
        }
    };

    useEffect(() => {
        // Recent courses logic should be fetched from DB enrollments via last_accessed_at
    }, [courseInfo])

    useEffect(() => {
        if (!courseInfo || !lecture) return

        // Certificates logic should be fetched from DB 
        const loadCert = async () => {
            if (user) {
                const certModule = await import('@/services/certificatesService')
                const certs = await certModule.certificatesService.getMyCertificates()
                const certList = Array.isArray(certs) ? certs : (certs.certificates || [])
                if (certList.find((c: any) => c.course_id === courseInfo.id)) {
                    setCertUnlocked(true)
                }
            }
        }
        loadCert()

        // Handle lecture completion using DB
        if (videoCompleted) {
            coursesService.completeLecture({
                courseId: courseInfo.id,
                slug: courseInfo.slug,
                lectureId: lecture.id,
                totalLectures: courseInfo.totalLectures,
                quizScore: quizResult ? quizResult.score : null
            }).then((res: any) => {
                if (res?.certificateUnlocked) {
                    setCertUnlocked(true);
                }
            }).catch(console.error);
        }
    }, [courseInfo, lecture, videoCompleted, quizResult])

    const handleVideoEnd = () => {
        if (lecture?.mcqs && lecture.mcqs.length > 0) {
            setShowQuiz(true)
        } else {
            setVideoCompleted(true)
        }
    }

    if (loading) return <Loader type="lecture" />

    if (!lecture) return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Lecture Not Found</h1>
            <p className="text-slate-500">The lecture you are looking for does not exist or has been removed.</p>
            <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
    )

    return (
        <div className="w-full mx-auto px-4 md:px-8 lg:px-12 py-8 relative">
            {selectedImage && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="sticky top-0 left-0 w-full h-[calc(100vh-64px)] flex items-center justify-center p-4">
                    <img src={selectedImage} className="max-w-full max-h-full rounded-xl object-contain shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()} />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <main className='lg:col-span-2'>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-blue-600">Lecture {lecture.index || 1}</span>
                                <span>•</span>
                                <span>Video Lecture</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const displayedScore = quizResult?.score ?? courseInfo?.progress?.quizScores?.[id];
                                    if (displayedScore !== undefined && displayedScore !== null) {
                                        return (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Score: {displayedScore}%
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                {certUnlocked && (
                                    <a href="/certificates" className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold animate-pulse hover:bg-green-200 transition">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Certificate Unlocked!
                                    </a>
                                )}
                            </div>
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
                                    {(() => {
                                        const url = lecture.videoUrl || lecture.video_url || '';
                                        const isYoutube = url.includes('youtube') || url.includes('youtu.be');
                                        
                                        if (isYoutube) {
                                            let embedUrl = url;
                                            if (!url.includes('/embed/')) {
                                                let videoId = '';
                                                if (url.includes('youtu.be/')) {
                                                    videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                                } else if (url.includes('watch?v=')) {
                                                    videoId = url.split('watch?v=')[1]?.split('&')[0];
                                                }
                                                if (videoId) {
                                                    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
                                                }
                                            }
                                            return (
                                                <iframe
                                                    src={embedUrl}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            );
                                        }

                                        const playerConfig: any = { file: { attributes: { poster: lecture.poster_url } } };
                                        return (
                                            <ReactPlayer
                                                url={url}
                                                width="100%"
                                                height="100%"
                                                controls
                                                playing={!showQuiz}
                                                onEnded={handleVideoEnd}
                                                config={playerConfig}
                                                style={{ position: 'absolute', top: 0, left: 0 }}
                                            />
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                        
                        {isEnrolled && !showQuiz && (
                            <div className="mt-4 flex justify-end gap-3">
                                {!videoCompleted && (
                                    <button
                                        onClick={() => setVideoCompleted(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                                    >
                                        Mark as Complete
                                    </button>
                                )}
                                {lecture?.mcqs && lecture.mcqs.length > 0 && (
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                                    >
                                        {quizCompleted ? "Retake Quiz" : "Take Quiz"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quiz Section */}
                    {isEnrolled && showQuiz && (
                        <div className="mt-6 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col p-6 sm:p-10 relative">
                            {quizResult ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in py-8">
                                    {quizResult.score >= 75 && <Confetti recycle={false} numberOfPieces={500} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }} />}
                                    {quizResult.passed ? (
                                        <>
                                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-3">Great Job!</h2>
                                            <p className="text-slate-300 mb-8 text-sm sm:text-base">You scored {quizResult.score}% and passed the module quiz.</p>
                                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                                <button onClick={() => { setQuizAnswers({}); setQuizResult(null); localStorage.removeItem(`quiz_result_${courseInfo?.id}_${id}`); }} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Retake Quiz</button>
                                                <button onClick={() => { setShowQuiz(false); setVideoCompleted(true); setQuizCompleted(true); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Continue Course</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-3">Needs Review</h2>
                                            <p className="text-slate-300 mb-8 text-sm sm:text-base">You scored {quizResult.score}%. We recommend reviewing the video to strengthen your understanding.</p>
                                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                                <button onClick={() => { setShowQuiz(false); }} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Watch Again</button>
                                                <button onClick={() => { setQuizAnswers({}); setQuizResult(null); localStorage.removeItem(`quiz_result_${courseInfo?.id}_${id}`); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-transform transform active:scale-95 text-sm sm:text-base">Retake Quiz</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="max-w-3xl w-full mx-auto">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            Knowledge Check
                                            {Object.keys(quizAnswers).length > 0 && (
                                                <span className="ml-4 text-sm font-normal text-slate-300">
                                                    Score: {
                                                        Object.keys(quizAnswers).reduce((acc, qIdxStr) => {
                                                            const qIdx = parseInt(qIdxStr);
                                                            const mcqList = Array.isArray(lecture.mcqs) ? lecture.mcqs : JSON.parse(lecture.mcqs || '[]');
                                                            const mcq = mcqList[qIdx];
                                                            if (mcq && mcq.correctIndex === quizAnswers[qIdx]) return acc + 1;
                                                            return acc;
                                                        }, 0)
                                                    } / {(Array.isArray(lecture.mcqs) ? lecture.mcqs : JSON.parse(lecture.mcqs || '[]')).length}
                                                </span>
                                            )}
                                        </h2>
                                        <button onClick={() => setShowQuiz(false)} className="text-slate-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {(Array.isArray(lecture.mcqs) ? lecture.mcqs : (typeof lecture.mcqs === 'string' ? JSON.parse(lecture.mcqs) : [])).map((mcq: any, qIdx: number) => (
                                            <div key={qIdx} className="bg-slate-800 rounded-xl p-6">
                                                <p className="text-lg font-medium text-white mb-4">{qIdx + 1}. {mcq.question}</p>
                                                <div className="space-y-3">
                                                    {mcq.options.map((opt: string, optIdx: number) => {
                                                        const isAnswered = quizAnswers[qIdx] !== undefined;
                                                        const isSelected = quizAnswers[qIdx] === optIdx;
                                                        const isCorrectOption = mcq.correctIndex === optIdx;
                                                        let btnClass = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500';
                                                        if (isAnswered) {
                                                            if (isSelected) {
                                                                if (isCorrectOption) btnClass = 'bg-green-600/20 border-green-500 text-green-400';
                                                                else btnClass = 'bg-red-600/20 border-red-500 text-red-400';
                                                            } else if (isCorrectOption) {
                                                                btnClass = 'bg-slate-900 border-green-500/50 text-green-400/50';
                                                            } else {
                                                                btnClass = 'bg-slate-900 border-slate-800 text-slate-500 opacity-50';
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={optIdx}
                                                                disabled={isAnswered}
                                                                onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                                                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${btnClass} disabled:cursor-not-allowed`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
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
                                                const result = { score, passed: score >= 70 };
                                                setQuizResult(result);
                                                setQuizCompleted(true);
                                                localStorage.setItem(`quiz_result_${courseInfo?.id}_${id}`, JSON.stringify({ result, answers: quizAnswers }));
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

                    {/* Notes Section */}
                    <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                My Notes
                            </h2>
                            {noteSaved && <span className="text-xs font-bold text-green-600 dark:text-green-400 animate-pulse">✓ Saved successfully</span>}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white quill-editor-bounds">
                            <ReactQuill 
                                bounds=".quill-editor-bounds"
                                theme="snow"
                                value={noteText}
                                onChange={setNoteText}
                                placeholder="Type your notes for this lecture here. They will be saved automatically..."
                                className="w-full"
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'strike', 'underline', 'code-block', 'blockquote'],
                                        [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
                                        [{ 'list': 'bullet' }, { 'list': 'ordered' }],
                                        [{ 'align': [] }],
                                        ['link', 'image']
                                    ]
                                }}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={saveNote}
                                disabled={isSavingNote}
                                className={`text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 transform active:scale-95 ${isSavingNote ? 'bg-amber-600 opacity-70 cursor-wait' : 'bg-amber-500 hover:bg-amber-600'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                Save Notes
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            Q&A Discussions
                        </h2>
                        
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl mb-8 overflow-hidden bg-white dark:bg-slate-900">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ask a question or share a thought..."
                                className="w-full p-4 bg-transparent text-sm outline-none resize-y min-h-[100px] text-slate-800 dark:text-slate-200 placeholder-slate-400"
                            ></textarea>
                            {imageFile && (
                                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 relative inline-block">
                                    <div className="relative inline-block cursor-pointer group" onClick={() => setPreviewImageUrl(URL.createObjectURL(imageFile))}>
                                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-w-[200px] max-h-[200px] rounded-lg object-contain border border-slate-200 dark:border-slate-700 group-hover:opacity-90 transition-opacity" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setImageFile(null) }} className="absolute top-1 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md text-sm font-bold z-10 transition-colors">×</button>
                                </div>
                            )}
                            <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium px-2 py-1 rounded cursor-pointer transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Add Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    </label>
                                </div>
                                <button 
                                    onClick={() => handlePostComment(false)}
                                    disabled={(!newComment.trim() && !imageFile) || isPostingComment}
                                    className="px-6 py-1.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm shadow-sm"
                                >
                                    {isPostingComment ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>

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
                                                <div className="mt-3 max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group relative" onClick={() => setPreviewImageUrl(comment.image_url)}>
                                                    <img src={comment.image_url} alt="Attachment" className="w-full h-auto group-hover:opacity-90 transition-opacity" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-2 group/react-bar">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setReplyingTo(comment)} className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                        Reply
                                                    </button>
                                                    
                                                    {renderReactionsInline(comment)}

                                                    <div className="relative group/react-btn">
                                                        <button className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5v4m-2-2h4" />
                                                            </svg>
                                                        </button>
                                                        <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover/react-btn:opacity-100 group-hover/react-btn:visible transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1 flex gap-1 z-20">
                                                            {COMMON_EMOJIS.slice(0, 6).map(emoji => (
                                                                <button key={emoji} onClick={() => handleReact(comment.id, emoji)} className="hover:scale-125 rounded-full w-8 h-8 flex items-center justify-center transition-transform text-lg">
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
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
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="w-full p-3 bg-transparent text-sm outline-none resize-y min-h-[80px] text-slate-800 dark:text-slate-200 placeholder-slate-400"
                                                    ></textarea>
                                                    {replyImageFile && (
                                                        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 relative inline-block">
                                                            <div className="relative inline-block cursor-pointer group" onClick={() => setPreviewImageUrl(URL.createObjectURL(replyImageFile))}>
                                                                <img src={URL.createObjectURL(replyImageFile)} alt="Preview" className="max-w-[150px] max-h-[150px] rounded-lg object-contain border border-slate-200 dark:border-slate-700 group-hover:opacity-90 transition-opacity" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                                                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                                </div>
                                                            </div>
                                                            <button onClick={(e) => { e.stopPropagation(); setReplyImageFile(null) }} className="absolute top-0 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md text-xs font-bold z-10 transition-colors">×</button>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-slate-100 dark:border-slate-800 p-2 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                                        <div className="flex items-center gap-1.5">
                                                            <label className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium px-2 py-1 rounded cursor-pointer transition-colors">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                Add Image
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                                    const f = e.target.files?.[0];
                                                                    if(f) setReplyImageFile(f);
                                                                }} />
                                                            </label>
                                                        </div>
                                                        <button 
                                                            onClick={() => handlePostComment(true)}
                                                            disabled={(!replyText.trim() && !replyImageFile) || isPostingComment}
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
                                                                        <span className="text-xs text-slate-400 font-medium">{new Date(reply.created_at).toLocaleDateString()} {new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                                    </div>
                                                                    {user?.id === reply.user_id && (
                                                                        <button onClick={() => handleDeleteComment(reply.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete Reply">
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.text}</p>
                                                                {reply.image_url && (
                                                                    <div className="mt-3 max-w-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group relative" onClick={() => setPreviewImageUrl(reply.image_url)}>
                                                                        <img src={reply.image_url} alt="Attachment" className="w-full h-auto group-hover:opacity-90 transition-opacity" />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between mt-2 group/react-bar-reply">
                                                                    <div className="flex items-center gap-1">
                                                                        {renderReactionsInline(reply)}

                                                                        <div className="relative group/react-btn-reply">
                                                                            <button className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5v4m-2-2h4" />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover/react-btn-reply:opacity-100 group-hover/react-btn-reply:visible transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1 flex gap-1 z-20">
                                                                                {COMMON_EMOJIS.slice(0, 6).map(emoji => (
                                                                                    <button key={emoji} onClick={() => handleReact(reply.id, emoji)} className="hover:scale-125 rounded-full w-8 h-8 flex items-center justify-center transition-transform text-lg">
                                                                                        {emoji}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                            {lecture.description || 'Watch this comprehensive lecture to master the concepts presented. Follow along with the code and practice to solidify your understanding.'}
                        </div>
                    </div>
                    
                    {savedNotes.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mt-6 p-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Saved Notes</h3>
                            <div className="space-y-3">
                                {savedNotes.map((note, idx) => (
                                    <details key={note.id || idx} className="group bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 [&_summary::-webkit-details-marker]:hidden">
                                        <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-slate-900 dark:text-white">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                                                Note {savedNotes.length - idx} <span className="text-xs font-normal text-slate-400 ml-2">{new Date(note.created_at || note.updated_at).toLocaleString()}</span>
                                            </span>
                                            <span className="transition group-open:rotate-180">
                                                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                            </span>
                                        </summary>
                                        <div onClick={handleImageClick} className="text-slate-600 dark:text-slate-300 mt-2 px-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-4 custom-html-content" dangerouslySetInnerHTML={{ __html: formatNoteContent(note.text) }} />
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
            
            {previewImageUrl && (
                <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-sm animate-in fade-in cursor-pointer" onClick={() => setPreviewImageUrl(null)}>
                    <div className="sticky top-0 left-0 w-full h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-8">
                    <button className="absolute top-6 right-6 text-white hover:text-red-500 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-all" onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(null); }}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img src={previewImageUrl} alt="Full Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg cursor-default" onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </div>
    )
}
