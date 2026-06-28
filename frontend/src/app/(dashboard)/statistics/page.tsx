"use client"
import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function StatisticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        apiClient.get('/api/statistics').then(r => {
            if (active) {
                setStats(r.data.stats);
                setLoading(false);
            }
        }).catch(err => {
            console.error('Failed to load stats', err);
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    if (loading) return <Loader type="dashboard" />

    // Heatmap data processing
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityMap = new Map<string, number>();

    const formatDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (stats?.activityData) {
        Object.values(stats.activityData).flat().forEach((dateStr: any) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            d.setHours(0, 0, 0, 0);
            const key = formatDateKey(d);
            activityMap.set(key, (activityMap.get(key) || 0) + 1);
        });
    }

    const dayOfWeek = today.getDay();
    const totalDays = 51 * 7 + (dayOfWeek + 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const allDays = Array.from({ length: totalDays }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate Active Streak
    let streak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
        const d = allDays[i];
        const key = formatDateKey(d);
        if (activityMap.get(key) && activityMap.get(key)! > 0) {
            streak++;
        } else {
            // Ignore today if we haven't done anything yet, but break on any past day with 0
            if (i !== allDays.length - 1) break;
        }
    }

    // Calculate Monthly Engagement
    const monthlyEngagement = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        return { name: monthNames[d.getMonth()], count: 0, monthKey };
    });

    if (stats?.activityData) {
        Object.values(stats.activityData).flat().forEach((dateStr: any) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
            const monthData = monthlyEngagement.find(m => m.monthKey === monthKey);
            if (monthData) monthData.count++;
        });
    }

    // Calculate Activity Breakdown percentages
    const totalActivity = (stats?.totalEnrolled || 0) + (stats?.completedCourses || 0) + (stats?.totalWishlisted || 0) + (stats?.totalNotes || 0);
    const getPercent = (val: number) => totalActivity > 0 ? Math.round((val / totalActivity) * 100) : 0;

    const breakdown = [
        { title: 'Enrolled', val: stats?.totalEnrolled || 0, percent: getPercent(stats?.totalEnrolled || 0), color: '#3b82f6', bg: 'bg-blue-600' },
        { title: 'Completed', val: stats?.completedCourses || 0, percent: getPercent(stats?.completedCourses || 0), color: '#10b981', bg: 'bg-emerald-600' },
        { title: 'Wishlist', val: stats?.totalWishlisted || 0, percent: getPercent(stats?.totalWishlisted || 0), color: '#f59e0b', bg: 'bg-amber-600' },
        { title: 'Notes', val: stats?.totalNotes || 0, percent: getPercent(stats?.totalNotes || 0), color: '#8b5cf6', bg: 'bg-purple-600' },
    ];

    let currentPercent = 0;
    const gradientStops = breakdown.map(item => {
        const start = currentPercent;
        currentPercent += item.percent;
        return `${item.color} ${start}% ${currentPercent}%`;
    });
    const pieBackground = totalActivity > 0 ? `conic-gradient(${gradientStops.join(', ')})` : 'conic-gradient(#e2e8f0 0% 100%)';

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen">
            <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-2">My Profile Statistics</h1>
            <p className="text-slate-500 mb-10">A deep dive into your learning journey and progress.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats?.totalEnrolled || 0}</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Enrolled</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats?.completedCourses || 0}</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Completed</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats?.totalWishlisted || 0}</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Wishlisted</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{streak}</div>
                    <div className="text-sm font-semibold text-slate-500">Day Active Streak</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats?.totalNotes || 0}</div>
                    <div className="text-sm font-semibold text-slate-500">Notes Taken</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats?.createdCourses || 0}</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Published</div>
                </div>
                {/* Quiz Overview Cards */}
                {stats?.quizScores && stats.quizScores.length > 0 && (() => {
                    const totalScore = stats.quizScores.reduce((acc: number, curr: any) => acc + curr.score, 0);
                    const avgScore = Math.round(totalScore / stats.quizScores.length);
                    const passedModules = stats.quizScores.filter((s: any) => s.score >= 75).length;
                    
                    return (
                        <>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{avgScore}%</div>
                                <div className="text-sm font-semibold text-slate-500">Average Quiz Score</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{passedModules} / {stats.quizScores.length}</div>
                                <div className="text-sm font-semibold text-slate-500">Modules Mastered (≥ 75%)</div>
                            </div>
                        </>
                    )
                })()}
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Activity Breakdown Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Activity Breakdown</h3>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-48 h-48 rounded-full border-4 border-white dark:border-slate-800 shadow-md flex-shrink-0"
                                style={{ background: pieBackground }}>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                {breakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${item.bg}`}></div><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.title}</span></div>
                                        <span className="font-bold text-slate-900 dark:text-white">{item.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Engagement Line Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Monthly Learning Actions</h3>
                        <div className="h-64 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <AreaChart data={monthlyEngagement} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Activity Heatmap (Last 12 Months)</h3>

                    <div className="flex w-full min-w-max items-start">
                        <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-400 mr-2 shrink-0">
                            <div className="h-5 mb-1"></div>
                            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                                <span key={i} className="flex items-center h-[13px] sm:h-[14px] md:h-[15px]">{day}</span>
                            ))}
                        </div>

                        <div className="flex gap-1 md:gap-1.5">
                            {Array.from({ length: 52 }).map((_, colIndex) => {
                                const colDays = Array.from({ length: 7 }).map((_, i) => {
                                    const dayIndex = colIndex * 7 + i;
                                    return dayIndex < allDays.length ? allDays[dayIndex] : null;
                                });
                                
                                // Only process columns that have at least one day
                                if (!colDays[0]) return null;

                                const firstDay = colDays[0];
                                const prevColFirstDay = colIndex > 0 && allDays[(colIndex - 1) * 7] ? allDays[(colIndex - 1) * 7] : null;
                                const isNewMonth = prevColFirstDay ? firstDay.getMonth() !== prevColFirstDay.getMonth() : true;

                                return (
                                    <div key={colIndex} className={`flex flex-col ${isNewMonth && colIndex > 0 ? 'ml-2 md:ml-3' : ''}`}>
                                        {/* Month Label Header */}
                                        <div className="h-5 mb-1 relative">
                                            {isNewMonth && (
                                                <span className="absolute left-0 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                                                    {monthNames[firstDay.getMonth()]}
                                                </span>
                                            )}
                                        </div>

                                        {/* 7 Days Column */}
                                        <div className="flex flex-col gap-1">
                                            {colDays.map((d, i) => {
                                                if (!d) return <div key={i} className="w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] md:w-[15px] md:h-[15px] shrink-0 bg-transparent"></div>;
                                                
                                                const key = formatDateKey(d);
                                                const count = activityMap.get(key) || 0;
                                                let intensity = 0;
                                                if (count === 1) intensity = 20;
                                                else if (count === 2) intensity = 50;
                                                else if (count >= 3) intensity = 100;

                                                return (
                                                    <div
                                                        key={i}
                                                        title={`${d.toLocaleDateString()}: ${count} actions`}
                                                        className="w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] md:w-[15px] md:h-[15px] shrink-0 rounded-[3px] bg-emerald-500 cursor-pointer transition-opacity hover:opacity-100"
                                                        style={{ opacity: intensity === 0 ? 0.05 : intensity / 100 }}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500 ml-10">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-5"></div>
                            <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-20"></div>
                            <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-50"></div>
                            <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-100"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>

                {/* Quiz Performance Section */}
                {stats?.quizScores && stats.quizScores.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Module Quiz Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                                        <th className="py-3 px-4 font-semibold">Course</th>
                                        <th className="py-3 px-4 font-semibold">Module</th>
                                        <th className="py-3 px-4 font-semibold">Score</th>
                                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.quizScores.map((scoreObj: any, index: number) => {
                                        const needsRetake = scoreObj.score < 75;
                                        return (
                                            <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white">{scoreObj.course_title}</td>
                                                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{scoreObj.lecture_title}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${needsRetake ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                        {scoreObj.score}%
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <a 
                                                        href={`/courses/${scoreObj.course_slug}/lecture/${scoreObj.lecture_id}`}
                                                        title="View Module"
                                                        className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
