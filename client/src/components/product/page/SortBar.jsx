import React from 'react';
import { Filter, ChevronDown, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';

const SortBar = ({ sortOption, setSortOption }) => {

    // Helper render class cho nút active
    const getBtnClass = (option) => {
        const base = "px-4 py-1.5 rounded text-xs font-medium transition-colors border cursor-pointer";
        if (sortOption === option) {
            return `${base} bg-[#004535] text-white border-[#004535] shadow-sm font-bold`;
        }
        return `${base} bg-[#F3F4F6] text-gray-700 border-transparent hover:bg-gray-200`;
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-500 mr-2">Sắp xếp theo:</span>

            <button onClick={() => setSortOption('default')} className={getBtnClass('default')}>
                <Filter size={12} className="inline mr-1" /> Nổi bật
            </button>
            {/* Sắp xếp giá */}
            <button onClick={() => setSortOption('price_asc')} className={getBtnClass('price_asc')}>
                Giá thấp - cao <ArrowUpAZ size={12} className="inline ml-1" />
            </button>

            <button onClick={() => setSortOption('price_desc')} className={getBtnClass('price_desc')}>
                Giá cao - thấp <ArrowDownAZ size={12} className="inline ml-1" />
            </button>
        </div>
    );
};

export default SortBar;