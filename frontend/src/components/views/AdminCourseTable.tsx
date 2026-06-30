import React from 'react'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'

interface AdminCourseTableProps {
    loading: boolean;
    filteredCourses: any[];
    selectedCourses: string[];
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    handleArchiveCourse: (id: string) => void;
    handlePublishCourse: (id: string) => void;
    setCourseToDelete: (id: string) => void;
    getStatusBadge: (status: string) => React.ReactNode;
    editBasePath?: string;
}

export default function AdminCourseTable({
    loading,
    filteredCourses,
    selectedCourses,
    toggleSelect,
    toggleSelectAll,
    handleArchiveCourse,
    handlePublishCourse,
    setCourseToDelete,
    getStatusBadge,
    editBasePath = "/admin/courses/new"
}: AdminCourseTableProps) {
    return (
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th className="px-6 py-4 w-12">
                            <input 
                                type="checkbox" 
                                checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Course Info</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Metrics</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="p-0">
                                <div className="flex flex-col w-full min-h-[200px]">
                                    <Loader type="table-row" />
                                </div>
                            </td>
                        </tr>
                    ) : filteredCourses.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No courses found matching your criteria.</td>
                        </tr>
                    ) : (
                        filteredCourses.map((course) => (
                            <tr key={course.id} className={`transition-colors ${selectedCourses.includes(course.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCourses.includes(course.id)}
                                        onChange={() => toggleSelect(course.id)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                                            <svg className="w-full h-full text-slate-300 dark:text-slate-600 p-2 absolute inset-0" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                            {course.thumbnail_url && (
                                                <img src={course.thumbnail_url} className="w-full h-full object-cover absolute inset-0 z-10" alt="thumbnail" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                            )}
                                        </div>
                                        <div className="max-w-[250px] lg:max-w-[350px]">
                                            <div className="font-bold text-slate-900 dark:text-white truncate" title={course.title}>{course.title}</div>
                                            <div className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-2">
                                                <span>{course.instructor}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span className="text-blue-600 dark:text-blue-400">{course.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(course.status)}
                                </td>
                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                                    {course.price}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                                        <div className="flex items-center gap-1"><svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> {course.enrollments.toLocaleString()} students</div>
                                        <div className="flex items-center gap-1"><svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> {course.rating > 0 ? course.rating : 'N/A'} rating</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`${editBasePath}?course_id=${course.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </Link>
                                        <Link href={`/courses/${course.slug}/${course.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Preview">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </Link>
                                        {course.status === 'Archived' ? (
                                            <button onClick={() => handlePublishCourse(course.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Publish Course">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </button>
                                        ) : (
                                            <button onClick={() => handleArchiveCourse(course.id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Archive (Unpublish)">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                            </button>
                                        )}
                                        <button onClick={() => setCourseToDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Course">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
