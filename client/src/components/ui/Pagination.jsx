import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    let range = [];
    let rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i < right)) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
            >
                &lt;
            </button>

            {rangeWithDots.map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`cursor-pointer w-8 h-8 flex items-center justify-center border rounded-md text-sm font-medium transition-colors ${page === currentPage
                            ? 'bg-[#00A76F] text-white border-[#00A76F]'
                            : page === '...'
                                ? 'border-transparent text-gray-500 cursor-default'
                                : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
            >
                &gt;
            </button>
        </div>
    );
};

export default Pagination;
