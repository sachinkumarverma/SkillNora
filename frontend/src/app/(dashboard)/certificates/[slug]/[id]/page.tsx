"use client"
import React, { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'
import { certificatesService } from '@/services/certificatesService'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

export default function CertificateViewPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
    const { slug, id } = use(params)
    const { user, loading: userLoading } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [cert, setCert] = useState<any | null>(null)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const certRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        const encodedData = searchParams.get('data')
        if (encodedData) {
            try {
                const decoded = JSON.parse(atob(encodedData))
                setCert(decoded)
                setLoading(false)
                return
            } catch (e) { }
        }

        if (userLoading) return;

        const fetchCert = async () => {
            try {
                let found = null;
                
                if (user) {
                    const response = await certificatesService.getMyCertificates()
                    const certs = Array.isArray(response) ? response : response.certificates || []
                    found = certs.find((c: any) => c.id === id || c.dbId === id || c.courseSlug === id)
                }
                
                if (!found) {
                    const publicRes = await certificatesService.getCertificate(id)
                    found = publicRes.certificate || publicRes;
                }
                
                if (found) {
                    setCert(found)
                }
            } catch (e) {
                console.error('Failed to fetch certificate', e)
            } finally {
                setLoading(false)
            }
        }
        fetchCert()
    }, [id, searchParams, user, userLoading])

    const handlePrint = async () => {
        if (!certRef.current) return
        
        setIsDownloading(true)
        const toastId = toast.loading('Generating PDF...')
        
        try {
            const dataUrl = await toPng(certRef.current, { 
                cacheBust: true,
                width: 1000,
                height: 707,
                style: { transform: 'none' },
                pixelRatio: 3
            })
            
            // Certificate dimensions: 1000x707
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1000, 707]
            })
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, 1000, 707)
            pdf.save(`${cert?.courseTitle || 'Certificate'}.pdf`)
            toast.success('Certificate downloaded successfully!', { id: toastId })
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF.', { id: toastId })
        } finally {
            setIsDownloading(false)
        }
    }

    const handleShare = () => {
        if (!cert) return
        const url = `${window.location.origin}/certificates/${slug || cert.courseSlug || 'cert'}/${cert.id}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return <Loader type="certificate" />
    }

    if (!cert) {
        return (
            <div className="flex flex-col h-[60vh] w-full items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Certificate Not Found</h1>
                <p className="text-slate-500 mb-6">We couldn't find the certificate you're looking for.</p>
                <button onClick={() => router.push('/dashboard')} className="btn btn-primary px-6 py-2">Go to Dashboard</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 print:p-0 print:bg-white relative">
            {/* Background design for print */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body, html { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    
                    /* Hide unnecessary UI elements */
                    .print-hide { display: none !important; }
                    header, aside, nav { display: none !important; }
                    
                    /* Override sidebar padding on main content */
                    main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    
                    /* Restore certificate to document flow so Chrome can "Fit to Page" */
                    .cert-container { 
                        position: relative !important; 
                        width: 1060px !important; 
                        height: 750px !important; 
                        margin: 0 auto !important; 
                        box-shadow: none !important; 
                        border: none !important; 
                        transform: none !important; 
                    }
                }
            `}} />

            <div className="max-w-5xl mx-auto print-hide flex items-center justify-end mb-8">
                <div className="flex gap-3">
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        {copied ? 'Link Copied!' : 'Share Link'}
                    </button>
                    <button onClick={handlePrint} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                        {isDownloading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        )}
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-8 flex justify-center print:overflow-visible print:block print:pb-0 print:m-0">
                <div className="shadow-2xl flex-shrink-0">
                    <div ref={certRef} className="cert-container bg-white p-6 md:p-12 overflow-hidden relative" style={{ width: '1000px', height: '707px' }}>
                        {/* Modern Certificate Inner Border - Gold and Navy */}
                        <div className="cert-inner border-[3px] border-[#c5a059] relative w-full h-full text-center flex flex-col justify-between p-6 md:p-10 bg-white z-10">

                        {/* Corner accents (Navy and Gold) */}
                        <div className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-l-[8px] md:border-t-[12px] md:border-l-[12px] border-[#1a2b4c] -translate-x-[3px] -translate-y-[3px]"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 md:w-20 md:h-20 border-t-[6px] border-l-[6px] md:border-t-[8px] md:border-l-[8px] border-[#c5a059] m-2"></div>

                        <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-r-[8px] md:border-t-[12px] md:border-r-[12px] border-[#1a2b4c] translate-x-[3px] -translate-y-[3px]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 border-t-[6px] border-r-[6px] md:border-t-[8px] md:border-r-[8px] border-[#c5a059] m-2"></div>

                        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-l-[8px] md:border-b-[12px] md:border-l-[12px] border-[#1a2b4c] -translate-x-[3px] translate-y-[3px]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-20 md:h-20 border-b-[6px] border-l-[6px] md:border-b-[8px] md:border-l-[8px] border-[#c5a059] m-2"></div>

                        <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-r-[8px] md:border-b-[12px] md:border-r-[12px] border-[#1a2b4c] translate-x-[3px] translate-y-[3px]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-20 md:h-20 border-b-[6px] border-r-[6px] md:border-b-[8px] md:border-r-[8px] border-[#c5a059] m-2"></div>

                        {/* Top Logo / Univ Name */}
                        <div className="flex flex-col items-center mt-2">
                            <img src="/logo.png" alt="Skillnora" className="h-10 object-contain mb-1 opacity-90 grayscale contrast-125" style={{ filter: 'sepia(1) hue-rotate(10deg) saturate(2)' }} />
                            <div className="text-[#1a2b4c] font-serif uppercase text-[10px] tracking-[0.2em] mb-4">Skillnora University</div>

                            <h1 className="text-2xl md:text-5xl lg:text-5xl font-serif text-[#1a2b4c] mb-1 uppercase tracking-wide leading-tight whitespace-nowrap">Certificate of Achievement</h1>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center">
                            <p className="text-xs md:text-sm text-slate-500 uppercase tracking-[0.2em] mb-4 md:mb-6 font-medium">This certificate is proudly presented to</p>

                            {/* Name in cursive */}
                            <div className="inline-block px-12 mb-4 md:mb-6">
                                <h2 className="text-4xl md:text-5xl lg:text-5xl font-['Dancing_Script',cursive] text-[#1a2b4c] capitalize pb-2 border-b border-dashed border-slate-400">
                                    {cert.studentName || user?.user_metadata?.full_name || user?.name || user?.full_name || (user?.email ? user.email.split('@')[0] : 'Skillnora Student')}
                                </h2>
                            </div>

                            <p className="text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
                                For successfully completing the course of <span className="font-serif italic font-bold">"{cert.courseTitle}"</span>.<br />
                                In this professional development program, the recipient has demonstrated proficiency in the curriculum and acquired the necessary skills for practical application.
                            </p>
                        </div>

                        {/* Bottom Section */}
                        <div className="mt-4 flex justify-between items-end px-2 md:px-8 w-full relative z-20 pb-2">
                            {/* Signature Left */}
                            <div className="text-center w-36 md:w-48 mb-2 flex flex-col items-center">
                                <div className="h-12 flex items-end justify-center mb-1">
                                    <img src="/custom_signature.png" className="h-16 md:h-20 object-contain -mb-2 mix-blend-multiply opacity-80" alt="Signature" />
                                </div>
                                <div className="border-t border-dashed border-slate-400 w-full pt-1.5 text-[9px] md:text-xs font-bold text-[#1a2b4c] uppercase tracking-wider block">Andrew Schulz</div>
                                <div className="text-[9px] md:text-[10px] text-slate-500 block w-full">Course Director</div>
                            </div>

                            {/* Center section with Date and Badge */}
                            <div className="flex flex-col items-center relative translate-y-2">
                                <div className="text-center mb-2">
                                    <div className="font-bold text-[#1a2b4c] text-[10px] md:text-sm mb-0.5">{new Date(cert.date).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                    <div className="w-16 md:w-20 mx-auto border-b border-dashed border-slate-400 mb-0.5"></div>
                                    <div className="text-[7px] md:text-[10px] text-slate-500 uppercase tracking-widest">Issuing date</div>
                                </div>
                                <div className="relative flex flex-col items-center z-30">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-[#c5a059] flex items-center justify-center relative bg-white shadow-sm">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed border-[#c5a059] flex items-center justify-center bg-[#fdfaf3]">
                                            <div className="text-center leading-none mt-0.5">
                                                <span className="block text-[5px] md:text-[6px] font-bold uppercase text-[#c5a059] tracking-widest">Verified</span>
                                                <span className="block text-[8px] md:text-[10px] font-black uppercase text-[#1a2b4c] my-0.5">Skillnora</span>
                                                <span className="block text-[5px] md:text-[6px] font-bold uppercase text-[#c5a059] tracking-widest">Seal</span>
                                            </div>
                                        </div>
                                        <svg className="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 w-5 h-10 md:w-6 md:h-12 text-[#c5a059]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C12 22 2 16.5 2 9C2 5.5 5 2.5 8.5 2.5C10.5 2.5 12 4 12 4C12 4 13.5 2.5 15.5 2.5C19 2.5 22 5.5 22 9C22 16.5 12 22 12 22Z" transform="scale(0.5) translate(24, 0)" /></svg>
                                        <svg className="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 w-5 h-10 md:w-6 md:h-12 text-[#c5a059] scale-x-[-1]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C12 22 2 16.5 2 9C2 5.5 5 2.5 8.5 2.5C10.5 2.5 12 4 12 4C12 4 13.5 2.5 15.5 2.5C19 2.5 22 5.5 22 9C22 16.5 12 22 12 22Z" transform="scale(0.5) translate(24, 0)" /></svg>
                                    </div>
                                    <div className="absolute -bottom-2 bg-[#d4af37] text-slate-900 text-[7px] md:text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider whitespace-nowrap shadow-sm border border-[#c5a059]">
                                        ID: {cert.id?.split('-')[0].toUpperCase() || 'SN-10293'}
                                    </div>
                                </div>
                            </div>

                            {/* Signature Right */}
                            <div className="text-center w-36 md:w-48 mb-2 flex flex-col items-center">
                                <div className="h-12 flex items-end justify-center mb-1">
                                    <img src="/custom_signature.png" className="h-16 md:h-20 object-contain -mb-2 mix-blend-multiply opacity-80" alt="Signature" />
                                </div>
                                <div className="border-t border-dashed border-slate-400 w-full pt-1.5 text-[9px] md:text-xs font-bold text-[#1a2b4c] uppercase tracking-wider block">Brandi Love</div>
                                <div className="text-[9px] md:text-[10px] text-slate-500 block w-full">Chairman of the Board</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
