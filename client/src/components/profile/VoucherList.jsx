import React, { useState, useEffect } from 'react';
import { promotionService } from '@/services/api';
import { TicketPercent, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getPromotions();
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Đã sao chép mã voucher!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getDiscountText = (voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `Giảm ${voucher.discount_value}%`;
    } else {
      return `Giảm ${formatCurrency(voucher.discount_value)}đ`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004535]"></div>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-20">
        <TicketPercent className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Hiện tại không có voucher nào</p>
        <p className="text-gray-400 text-sm mt-2">Voucher mới sẽ được cập nhật sớm nhất</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TicketPercent className="h-6 w-6 text-[#004535]" />
        <h2 className="text-xl font-bold text-gray-800">Voucher của tôi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map((voucher) => (
          <div
            key={voucher.promotion_id}
            className="bg-gradient-to-br from-[#004535] to-[#006b5a] rounded-xl p-5 text-white shadow-lg relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{voucher.code}</h3>
                  <p className="text-white/80 text-sm">{voucher.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(voucher.code)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Sao chép mã"
                >
                  {copiedCode === voucher.code ? (
                    <CheckCircle2 className="h-5 w-5 text-green-300" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold mb-1">
                  {getDiscountText(voucher)}
                </div>
                {voucher.discount_type === 'percentage' && voucher.max_discount_amount && (
                  <div className="text-sm text-white/80">
                    Tối đa {formatCurrency(voucher.max_discount_amount)}đ
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Đơn tối thiểu:</span>
                  <span className="font-semibold">{formatCurrency(voucher.min_order_amount)}đ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Hạn sử dụng:</span>
                  <span className="font-semibold">{formatDate(voucher.end_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Còn lại:</span>
                  <span className="font-semibold">
                    {voucher.usage_limit - voucher.used_count} lượt
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherList;
