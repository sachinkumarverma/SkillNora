import React from 'react';

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
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

    return (
        <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]">
            {loaderContent}
        </div>
    );
}
