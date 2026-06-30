export default function Loader({ fullScreen = false, type = 'default' }: { fullScreen?: boolean, type?: 'default' | 'dashboard' | 'instructor-dashboard' | 'courses' | 'table' | 'table-row' | 'course-detail' | 'lecture' | 'management-table' | 'course-builder' | 'draft-courses' | 'certificate' | 'course-preview' | 'receipt' | 'settings' | 'admin-profile' | 'notifications' }) {
    
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
            <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20 animate-pulse">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3">
                        <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                        <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden h-[120px] flex flex-col justify-between shadow-sm">
                            <Shimmer />
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm relative">
                        <Shimmer />
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                        <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                        <th className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                        <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                        <th className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                                            <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

    if (type === 'receipt') {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm max-w-2xl mx-auto overflow-hidden">
                    <Shimmer />
                    <div className="relative z-10 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="w-48 h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>

                    <div className="relative z-10 bg-slate-100 dark:bg-slate-800 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>

                    <div className="relative z-10 border-b-2 border-dotted border-slate-300 dark:border-slate-700 mb-6"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                        <div>
                            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mb-8">
                        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="w-full h-12 bg-slate-100 dark:bg-slate-800"></div>
                            <div className="w-full h-14 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-end mb-10">
                        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"></div>
                            <div className="w-full h-14 bg-slate-200 dark:bg-slate-700"></div>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                        <div>
                            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-end text-center mb-8">
                        <div className="w-32 h-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>

                    <div className="relative z-10 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between h-14">
                        <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded mt-1"></div>
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded mt-1"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'certificate') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 relative overflow-hidden animate-pulse">
                <div className="max-w-5xl mx-auto flex items-center justify-end mb-8">
                    <div className="flex gap-3">
                        <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden"><Shimmer /></div>
                        <div className="w-36 h-10 bg-blue-200 dark:bg-blue-900/50 rounded-xl relative overflow-hidden"><Shimmer /></div>
                    </div>
                </div>
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-[1000px] h-[707px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                        <Shimmer />
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'settings') {
        return (
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto animate-pulse">
                <div className="mb-8 space-y-3">
                    <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    <div className="w-96 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation Skeleton */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="flex flex-col space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    <Shimmer />
                                    <div className="w-5 h-5 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                                    <div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area Skeleton */}
                    <div className="flex-1 relative">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
                            <Shimmer />
                            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                <div className="space-y-3">
                                    <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                                    <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                </div>
                                <div className="w-32 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'admin-profile') {
        return (
            <div className="w-full p-6 lg:p-8 space-y-8 pb-20">
                {/* Header / Actions Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                </div>
                
                {/* Profile Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
                    <Shimmer />
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 w-full">
                            <div className="relative">
                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full border-4 border-slate-50 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                            </div>
                            <div className="text-center md:text-left space-y-4 pt-2 flex-1 w-full">
                                <div>
                                    <div className="w-64 h-9 bg-slate-200 dark:bg-slate-800 rounded mb-2 mx-auto md:mx-0"></div>
                                    <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded mx-auto md:mx-0"></div>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-28 h-[60px]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Platform logo graphic Skeleton */}
                        <div className="hidden lg:block w-48 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 shrink-0"></div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="mt-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                        <Shimmer />
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                                        <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                                        <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {[1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                            <div className="w-48 h-[42px] bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                    </div>
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
                        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[300px] border border-slate-800 shadow-2xl">
                            <Shimmer />
                            <div className="w-32 h-6 bg-slate-800/80 rounded-full mb-6"></div>
                            <div className="w-3/4 h-10 md:h-12 bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="w-full h-20 bg-slate-800/80 rounded-xl mb-8"></div>
                            <div className="flex gap-4">
                                <div className="w-32 h-11 bg-slate-800/80 rounded-xl"></div>
                            </div>
                        </div>
                        {/* Course Content Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <Shimmer />
                            <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="w-full h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>)}
                            </div>
                        </div>
                        {/* Reviews Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mt-8">
                            <Shimmer />
                            <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800/80 shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800/80 rounded-lg"></div>
                                    <div className="w-24 h-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg mb-2"></div>
                                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
                                    <div className="w-3/4 h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <Shimmer />
                            <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800/80 rounded-2xl mb-6"></div>
                            <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl mb-6"></div>
                            <div className="w-full h-12 bg-blue-100 dark:bg-blue-600/50 rounded-xl mb-4"></div>
                            <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 border border-slate-200 dark:border-slate-700"></div>
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex justify-between">
                                        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg"></div>
                                        <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'lecture') {
        return (
            <div className="w-full mx-auto px-4 md:px-8 lg:px-12 py-8 relative animate-pulse">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <main className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 relative overflow-hidden">
                            <Shimmer />
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    </main>
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden h-[150px]">
                            <Shimmer />
                            <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[250px]">
                            <Shimmer />
                            <div className="w-40 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    if (type === 'course-preview') {
        return (
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 md:py-12 animate-pulse">
                
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8 relative">
                    <Shimmer />
                    <div className="w-full min-h-[400px] md:min-h-[500px] bg-slate-200 dark:bg-slate-800 flex flex-col justify-end p-8 md:p-12">
                        <div className="w-32 h-6 bg-slate-300 dark:bg-slate-700 rounded-full mb-4"></div>
                        <div className="w-3/4 h-10 md:h-12 bg-slate-300 dark:bg-slate-700 rounded mb-4"></div>
                        <div className="w-full h-6 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="w-5/6 h-6 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[300px]">
                            <Shimmer />
                            <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="space-y-4">
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[200px]">
                            <Shimmer />
                            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded shrink-0"></div>
                                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[250px]">
                            <Shimmer />
                            <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded shrink-0"></div>
                                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'management-table') {
        return (
            <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20 animate-pulse">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3">
                        <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                        <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                </header>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                        <div className="w-full max-w-md h-10 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden"><Shimmer /></div>
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                    </div>

                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    <th className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    <th className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden"><Shimmer /></div></th>
                                    <th className="px-6 py-4 text-right"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded ml-auto relative overflow-hidden"><Shimmer /></div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden"><Shimmer /></div>
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                                                    <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden"><Shimmer /></div></td>
                                        <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div></td>
                                        <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div></td>
                                        <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div></td>
                                        <td className="px-6 py-4 text-right"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto relative overflow-hidden"><Shimmer /></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
                        <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                        <div className="flex gap-2">
                            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                            <div className="w-10 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'course-builder') {
        return (
            <div className="w-full mx-auto p-6 lg:p-8 pb-32 animate-pulse">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                    <div className="flex gap-3 items-center">
                        <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-md relative overflow-hidden"><Shimmer /></div>
                        <div className="w-36 h-10 bg-slate-200 dark:bg-slate-800 rounded-md relative overflow-hidden"><Shimmer /></div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                            <Shimmer />
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="w-36 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-full h-12 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-full h-24 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-full h-32 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                                    <div className="w-56 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="space-y-2">
                                                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                <div className="w-full h-12 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                <Shimmer />
                                <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                                <div className="space-y-4">
                                    <div className="w-full h-12 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                    <div className="w-full h-12 bg-slate-200 dark:bg-slate-800/50 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'draft-courses') {
        return (
            <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20 animate-pulse">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3">
                        <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                        <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                    <div className="w-36 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden h-[180px]">
                            <Shimmer />
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                            <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded mt-auto pt-4 border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'notifications') {
        return (
            <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20 animate-pulse">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3">
                        <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden"><Shimmer /></div>
                        <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden"><Shimmer /></div>
                    </div>
                    <div className="w-full md:w-96 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl relative overflow-hidden"><Shimmer /></div>
                </header>

                <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-xl p-6 lg:p-8 shadow-sm">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm relative overflow-hidden">
                                <Shimmer />
                                <div className="flex items-start gap-4 w-full">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 border-2 border-slate-100 dark:border-slate-600"></div>
                                    <div className="flex-1 space-y-3 pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                        </div>
                                        <div className="w-full max-w-xl h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                            <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                            </div>
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
