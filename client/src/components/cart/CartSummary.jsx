import React from 'react';
import { Ticket } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const CartSummary = ({ subtotal, total }) => {
  return (
    <div className="w-full lg:w-[360px] shrink-0">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cộng giỏ hàng</h3>

        {/* Voucher Input */}
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

        {/* Thông tin thanh toán */}
        <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-100">
            <span>Tổng tiền</span>
            <span className="text-[#004535] text-xl">{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-gray-400 text-right">(Đã bao gồm VAT)</p>
        </div>

        <button className="w-full py-3.5 bg-[#004535] text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-[#003528] shadow-lg shadow-[#004535]/20 transition-all transform active:scale-[0.98]">
          Tiến hành thanh toán
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
          <ShieldIcon />
          <span className="text-xs">Bảo mật thanh toán tuyệt đối</span>
        </div>
      </div>
    </div>
  );
};

// Icon nhỏ
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

export default CartSummary;