"use client"
import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const monthlyData = [
  { name: 'Jan', hours: 45 },
  { name: 'Feb', hours: 52 },
  { name: 'Mar', hours: 38 },
  { name: 'Apr', hours: 65 },
  { name: 'May', hours: 48 },
  { name: 'Jun', hours: 70 },
];

const weeklyData = [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 1.2 },
    { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 0.5 },
    { day: 'Sun', hours: 3 },
];

export default function StatisticsPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-2">My Profile Statistics</h1>
            <p className="text-slate-500 mb-10">A deep dive into your learning journey and progress.</p>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">24.5h</div>
                    <div className="text-sm font-semibold text-slate-500">Total Learning Time</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">100%</div>
                    <div className="text-sm font-semibold text-slate-500">Average Quiz Score</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">3</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Completed</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">12</div>
                    <div className="text-sm font-semibold text-slate-500">Day Active Streak</div>
                </div>
                
                {/* 6 New Cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">15</div>
                    <div className="text-sm font-semibold text-slate-500">Courses Wishlisted</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">142</div>
                    <div className="text-sm font-semibold text-slate-500">Lectures Watched</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">87</div>
                    <div className="text-sm font-semibold text-slate-500">Discussions Joined</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">Top 5%</div>
                    <div className="text-sm font-semibold text-slate-500">Global Ranking</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">1.2K</div>
                    <div className="text-sm font-semibold text-slate-500">Lines of Code Written</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">4</div>
                    <div className="text-sm font-semibold text-slate-500">Skills Mastered</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Learning Distribution Pie Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Learning Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Pure CSS Pie Chart */}
                        <div className="w-48 h-48 rounded-full border-4 border-white dark:border-slate-800 shadow-md flex-shrink-0" 
                            style={{ 
                                background: 'conic-gradient(#2563eb 0% 45%, #7c3aed 45% 75%, #059669 75% 90%, #d97706 90% 100%)' 
                            }}>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Software Engineering</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">45%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Science</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">30%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Web Development</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">15%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Design</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">10%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hours Spent per Day Bar Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Study Hours (Last 7 Days)</h3>
                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Proficiency Horizontal Bars */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Skill Proficiency</h3>
                    <div className="space-y-6">
                        {[
                            { skill: 'React.js', val: 90, color: 'bg-cyan-500' },
                            { skill: 'Node.js', val: 75, color: 'bg-green-500' },
                            { skill: 'Python', val: 60, color: 'bg-blue-500' },
                            { skill: 'UI/UX Design', val: 40, color: 'bg-purple-500' },
                            { skill: 'SQL Databases', val: 85, color: 'bg-amber-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-slate-700 dark:text-slate-300">{item.skill}</span>
                                    <span className="text-slate-900 dark:text-white">{item.val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Progress Rings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Active Course Progress</h3>
                    <div className="flex flex-wrap justify-around gap-4 pt-4">
                        {[
                            { title: 'AI Engineering', val: 75, color: '#3b82f6' },
                            { title: 'Advanced React', val: 45, color: '#10b981' },
                            { title: 'System Design', val: 15, color: '#f59e0b' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <div className="relative w-24 h-24 flex items-center justify-center rounded-full" style={{ background: `conic-gradient(${item.color} ${item.val}%, transparent ${item.val}%)` }}>
                                    <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{item.val}%</span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center w-24">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Engagement Line Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Monthly Learning Engagement (Hours)</h3>
                    <div className="h-72 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm col-span-1 lg:col-span-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Activity Heatmap (Last 12 Months)</h3>
                    <div className="flex flex-col items-start gap-2 min-w-max">
                        <div className="flex w-full ml-[42px] mb-1">
                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                                <span key={i} className="text-[11px] font-semibold text-slate-400 w-[86px]">{m}</span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col justify-between text-[11px] font-semibold text-slate-400 py-1 mr-2 h-[140px]">
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                            </div>
                            <div className="grid grid-rows-7 grid-flow-col gap-1 h-[140px]">
                                {Array.from({ length: 364 }).map((_, i) => {
                                    const intensity = [0, 0, 0, 10, 20, 40, 60, 80, 100][Math.floor(Math.random() * 9)];
                                    return (
                                        <div key={i} className="w-4 h-4 rounded-[3px] bg-emerald-500 cursor-pointer transition-opacity hover:opacity-100" style={{ opacity: intensity === 0 ? 0.05 : intensity / 100 }}></div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500 ml-12">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-5"></div>
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-20"></div>
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-40"></div>
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-60"></div>
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-80"></div>
                                <div className="w-4 h-4 rounded-[3px] bg-emerald-500 opacity-100"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
