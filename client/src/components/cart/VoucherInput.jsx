import React from 'react';
import { Ticket } from 'lucide-react';

const VoucherInput = () => {
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Nhập mã voucher"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004535] focus:ring-1 focus:ring-[#004535]"
                    />
                    <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Áp dụng
                </button>
            </div>
        </div>
    );
};

export default VoucherInput;
