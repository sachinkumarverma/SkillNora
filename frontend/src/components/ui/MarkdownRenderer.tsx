"use client"
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
    if (!content) return null;

    return (
        <div className={`prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-slate-800 dark:text-slate-200">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-purple-500 pl-4 py-1 my-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-r text-slate-600 dark:text-slate-400 italic">
                            {children}
                        </blockquote>
                    ),
                    code: ({ inline, children, ...props }: any) => {
                        if (inline) {
                            return (
                                <code className="bg-slate-200/70 dark:bg-slate-800 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-300/50 dark:border-slate-700">
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-3 border border-slate-800 shadow-md">
                                <code>{children}</code>
                            </pre>
                        )
                    },
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => <th className="p-3 font-bold border-r last:border-r-0 border-slate-200 dark:border-slate-700">{children}</th>,
                    td: ({ children }) => <td className="p-3 border-t border-r last:border-r-0 border-slate-200 dark:border-slate-700">{children}</td>,
                    tr: ({ children }) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">{children}</tr>,
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 font-semibold">
                            {children}
                        </a>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
