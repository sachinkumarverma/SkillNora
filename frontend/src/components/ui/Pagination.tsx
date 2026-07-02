"use client"
import React, { useState, useRef, useEffect } from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export default function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [5, 10, 20, 50];

    return (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-2">
                <span>Showing {totalItems === 0 ? 0 : startItem} to {endItem} of {totalItems} entries</span>
                <div className="relative inline-block ml-2" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 pl-3 pr-2 text-sm font-semibold outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-w-[4rem]"
                    >
                        <span>{itemsPerPage}</span>
                        <svg className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isOpen && (
                        <div className="absolute bottom-full left-0 mb-1 min-w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden z-50">
                            {options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        onItemsPerPageChange(opt);
                                        onPageChange(1);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${itemsPerPage === opt ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm">
                    {currentPage}
                </span>
                <button 
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentPage < totalPages 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
