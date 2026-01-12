import React, { useState, useEffect } from 'react';
import { promotionService } from '@/services/api';
import { TicketPercent, Copy, CheckCircle2, Clock } from 'lucide-react';
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
        <p className="text-gray-500 text-lg">Hiện tại không có voucher khả dụng</p>
        <p className="text-gray-400 text-sm mt-2">Voucher mới sẽ được cập nhật sớm nhất</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TicketPercent className="h-6 w-6 text-[#004535]" />
        <h2 className="text-xl font-bold text-gray-800">Kho Voucher</h2>
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
          {vouchers.length} đang có hiệu lực
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map((voucher) => (
          <div
            key={voucher.promotion_id}
            className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
          >
            {/* Banner màu bên trái */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#004535]"></div>

            <div className="pl-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#004535]">{voucher.code}</h3>
                  <p className="text-gray-600 text-sm line-clamp-1">{voucher.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(voucher.code)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  title="Sao chép mã"
                >
                  {copiedCode === voucher.code ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-800">
                  {getDiscountText(voucher)}
                </span>
                {voucher.discount_type === 'percentage' && voucher.max_discount_amount && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Tối đa {formatCurrency(voucher.max_discount_amount)}đ
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Đơn tối thiểu:</span>
                  <span className="font-medium text-gray-700">{formatCurrency(voucher.min_order_amount || voucher.min_order_value)}đ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Hạn sử dụng:
                  </span>
                  <span className="font-medium text-red-500">{formatDate(voucher.end_date)}</span>
                </div>
              </div>
            </div>
            
            {/* Vòng tròn trang trí */}
            <div className="absolute -right-6 -bottom-6 w-12 h-12 bg-green-50 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherList;