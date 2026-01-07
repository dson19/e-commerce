import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import VoucherInput from './VoucherInput';
import AddressSelector from './AddressSelector';
import { useCheckout } from '@/hooks/useCheckout';

const CartSummary = ({ subtotal, total }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const { handleCheckout, orderLoading } = useCheckout();

  return (
    <div className="w-full lg:w-[360px] shrink-0">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cộng giỏ hàng</h3>

        <AddressSelector
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        {/* Phương thức thanh toán */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</h4>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#004535] bg-[#E5F2F0]/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="payment"
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <span className="text-sm font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</span>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'VIETQR' ? 'border-[#004535] bg-[#E5F2F0]/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="payment"
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
                checked={paymentMethod === 'VIETQR'}
                onChange={() => setPaymentMethod('VIETQR')}
              />
              <span className="text-sm font-medium text-gray-700">Chuyển khoản Ngân hàng (VietQR)</span>
            </label>
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Tạm tính</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Phí vận chuyển</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-100">
            <span>Tổng tiền</span>
            <span className="text-[#004535] text-xl">{formatCurrency(total)}</span>
          </div>
          <p className="text-[10px] text-gray-400 text-right uppercase tracking-wider">(Đã bao gồm VAT)</p>
        </div>

        <button
          onClick={() => handleCheckout(selectedAddress, paymentMethod)}
          disabled={orderLoading}
          className={`w-full py-4 bg-[#004535] text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#004535]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${orderLoading ? 'opacity-70 cursor-wait' : 'hover:bg-[#003528]'}`}
        >
          {orderLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang xử lý...
            </>
          ) : (
            'Tiến hành thanh toán'
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-medium uppercase tracking-tight">Bảo mật thanh toán tuyệt đối</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;