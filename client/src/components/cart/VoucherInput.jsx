import React, { useState } from 'react';
import { Ticket, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { promotionService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const VoucherInput = ({ onApply, cartTotal, cartItems, disabled }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleApply = async () => {
        if (!code.trim()) return;
        
        // Nếu user chưa đăng nhập, backend có thể trả về lỗi hoặc validate cơ bản
        if (!user) {
             toast.error("Vui lòng đăng nhập để sử dụng voucher");
             return;
        }

        setLoading(true);
        try {
            const res = await promotionService.validatePromotion({
                code: code.trim(),
                cartTotal: cartTotal,
                cartItems: cartItems, // Cần gửi items để check scope (sản phẩm/ngành hàng cụ thể)
                userId: user.user_id
            });

            if (res.data.success) {
                toast.success("Áp dụng mã giảm giá thành công!");
                onApply(res.data.voucher); // Trả về thông tin voucher cho CartSummary
                setCode(""); // Clear input sau khi add thành công
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Mã giảm giá không hợp lệ";
            toast.error(msg);
            onApply(null); // Reset nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã voucher"
                        disabled={loading || disabled}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004535] focus:ring-1 focus:ring-[#004535] disabled:opacity-60"
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                    <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button 
                    onClick={handleApply}
                    disabled={loading || !code || disabled}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-60 min-w-[80px] flex items-center justify-center"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Áp dụng'}
                </button>
            </div>
        </div>
    );
};

export default VoucherInput;