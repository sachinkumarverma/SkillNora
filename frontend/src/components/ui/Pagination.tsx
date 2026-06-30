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

    return (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-2">
                <span>Showing {totalItems === 0 ? 0 : startItem} to {endItem} of {totalItems} entries</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                        onItemsPerPageChange(Number(e.target.value));
                        onPageChange(1);
                    }}
                    className="ml-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 text-sm font-semibold outline-none"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
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
