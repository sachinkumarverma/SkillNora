import React from 'react';

export default function Loader({ fullScreen = false, type = 'default' }: { fullScreen?: boolean, type?: 'default' | 'dashboard' | 'instructor-dashboard' | 'courses' | 'table' | 'table-row' | 'course-detail' | 'lecture' }) {
    
    const Shimmer = () => (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    );

    if (type === 'table-row') {
        return (
            <div className="w-full flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-full h-16 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center px-4 gap-4 relative overflow-hidden">
                        <Shimmer />
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block"></div>
                        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden md:block"></div>
                        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'courses') {
        return (
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 relative overflow-hidden">
                    <Shimmer />
                    <div className="w-full max-w-xl space-y-3">
                        <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="w-full md:w-72 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden relative">
                        <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden"><Shimmer /></div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            </div>
                            <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            <div className="pt-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden"><Shimmer /></div>
                                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                                </div>
                                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        );
    }

    if (type === 'dashboard') {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 relative overflow-hidden"><Shimmer /></div>
                            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2 relative overflow-hidden"><Shimmer /></div>
                            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-96 relative overflow-hidden">
                        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8 relative overflow-hidden"><Shimmer /></div>
                        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-96 relative overflow-hidden">
                        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8 relative overflow-hidden"><Shimmer /></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'instructor-dashboard') {
        return (
            <div className="p-6 md:p-8 space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                    <Shimmer />
                    <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="w-3/4 max-w-xl h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="w-full max-w-2xl h-10 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950 relative overflow-hidden">
                                <Shimmer />
                                <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
                                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <section key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                            <Shimmer />
                            <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="h-[350px] w-full bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                        </section>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 relative">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                </div>
                <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 rounded-t-lg mb-2 relative overflow-hidden"><Shimmer /></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-full h-16 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center px-4 gap-4 relative overflow-hidden">
                        <Shimmer />
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block"></div>
                        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden md:block"></div>
                        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'course-detail') {
        return (
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card Skeleton */}
                        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[300px] border border-slate-800">
                            <Shimmer />
                            <div className="w-32 h-6 bg-slate-800/80 rounded-full mb-6"></div>
                            <div className="w-3/4 h-10 md:h-12 bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="w-full h-20 bg-slate-800/80 rounded-xl mb-8"></div>
                            <div className="flex gap-4">
                                <div className="w-32 h-11 bg-blue-600/50 rounded-xl"></div>
                                <div className="w-32 h-11 bg-slate-800/80 rounded-xl"></div>
                            </div>
                        </div>
                        {/* Course Content Skeleton */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                            <Shimmer />
                            <div className="w-48 h-8 bg-slate-800/80 rounded-xl mb-8"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="w-full h-20 bg-slate-800/50 rounded-2xl"></div>)}
                            </div>
                        </div>
                    </div>
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                            <Shimmer />
                            <div className="w-full h-48 bg-slate-800/80 rounded-2xl mb-6"></div>
                            <div className="w-32 h-8 bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="w-full h-12 bg-blue-600/50 rounded-xl mb-6"></div>
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                {[1, 2, 3].map(i => <div key={i} className="w-full h-5 bg-slate-800/80 rounded-lg"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'lecture') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-73px)]">
                <div className="lg:col-span-3 bg-black flex items-center justify-center relative overflow-hidden">
                    <Shimmer />
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-slate-600 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 space-y-6 relative overflow-hidden">
                    <Shimmer />
                    <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const loaderContent = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <span className="text-xl font-bold text-blue-600 font-serif">S</span>
            </div>
            <div className="text-sm font-bold text-slate-500 tracking-widest uppercase animate-pulse">Loading...</div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
                {loaderContent}
            </div>
        );
    }

    // Default fallback skeleton (generic content block)
    return (
        <div className="w-full h-full p-6 space-y-4 min-h-[200px] relative overflow-hidden">
            <Shimmer />
            <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
    );
}
