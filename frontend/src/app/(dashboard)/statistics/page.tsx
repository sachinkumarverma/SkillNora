"use client"
import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
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

    const last364Days = Array.from({ length: 364 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (363 - i));
        return d;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const heatmapMonths = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - (11 - i));
        return monthNames[d.getMonth()];
    });

    // Calculate Active Streak
    let streak = 0;
    for (let i = 363; i >= 0; i--) {
        const d = last364Days[i];
        const key = formatDateKey(d);
        if (activityMap.get(key) && activityMap.get(key)! > 0) {
            streak++;
        } else {
            // Ignore today if we haven't done anything yet, but break on any past day with 0
            if (i !== 363) break;
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

                    <div className="flex gap-2 w-full min-w-max items-end">
                        <div className="flex flex-col justify-between text-[11px] font-semibold text-slate-400 py-1 mr-2 h-[145px] shrink-0">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        <div className="flex flex-1 justify-between w-full">
                            {Array.from({ length: 52 }).map((_, colIndex) => {
                                const colDays = last364Days.slice(colIndex * 7, colIndex * 7 + 7);
                                if (colDays.length === 0) return null;
                                
                                const firstDay = colDays[0];
                                const prevColFirstDay = colIndex > 0 ? last364Days[(colIndex - 1) * 7] : null;
                                const isNewMonth = prevColFirstDay ? firstDay.getMonth() !== prevColFirstDay.getMonth() : true;
                                
                                return (
                                    <div key={colIndex} className={`flex flex-col ${isNewMonth && colIndex > 0 ? 'ml-2 md:ml-2' : ''}`}>
                                        {/* Month Label Header */}
                                        <div className="h-5 mb-1 relative">
                                            {isNewMonth && (
                                                <span className="absolute left-0 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                                                    {monthNames[firstDay.getMonth()]}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* 7 Days Column */}
                                        <div className="flex flex-col justify-between h-[145px]">
                                            {colDays.map((d, i) => {
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
                                                        className="w-[15px] h-[15px] sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] shrink-0 rounded-[3px] bg-emerald-500 cursor-pointer transition-opacity hover:opacity-100" 
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
            </div>
        </div>
    )
}
