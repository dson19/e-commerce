import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Plus, TicketPercent, Calendar, Users, Tag, Trash2, Power, PowerOff } from 'lucide-react'; // [THÊM] Import Power icons
import AddPromotionForm from './AddPromotionForm';

const PromotionList = ({ setActiveTab }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!showAddForm) {
      fetchPromotions();
    }
  }, [showAddForm]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPromotions();
      setPromotions(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getDiscountText = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `Giảm ${promotion.discount_value}%`;
    } else {
      return `Giảm ${formatCurrency(promotion.discount_value)}đ`;
    }
  };

  const getStatusBadge = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    // Ưu tiên check trạng thái Active/Inactive trước
    if (!promotion.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Đã vô hiệu</span>;
    }
    if (startDate > now) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Sắp diễn ra</span>;
    }
    if (endDate < now) {
      return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Đã hết hạn</span>;
    }
    if (promotion.used_count >= promotion.usage_limit) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">Hết lượt</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Đang hoạt động</span>;
  };

  const renderScope = (promotion) => {
    const scopes = promotion.scopes || [];
    if (scopes.length === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
          Toàn bộ
        </span>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        {scopes.slice(0, 3).map((scope, index) => {
            let typeLabel = '';
            if (scope.target_type === 'category') typeLabel = 'Danh mục';
            else if (scope.target_type === 'brand') typeLabel = 'Thương hiệu';
            else if (scope.target_type === 'product') typeLabel = 'Sản phẩm';
            const displayText = scope.target_name || scope.target_id;
            return (
            <span key={index} className="text-xs text-gray-600 truncate max-w-[200px]" title={`${typeLabel}: ${displayText}`}>
              <span className="font-semibold">{typeLabel}:</span> {displayText}
            </span>
            );
        })}
        {scopes.length > 3 && (
            <span className="text-xs text-gray-400 italic">+{scopes.length - 3} khác...</span>
        )}
      </div>
    );
  };
  
  // [THÊM MỚI] Hàm xử lý Toggle Status
  const handleToggleStatus = async (promotion) => {
    const newStatus = !promotion.is_active;
    const actionName = newStatus ? 'kích hoạt' : 'vô hiệu hóa';

    try {
      // Gọi API
      await adminService.togglePromotionStatus(promotion.promotion_id, newStatus);
      
      toast.success(`Đã ${actionName} voucher thành công`);
      
      // Cập nhật state cục bộ để không cần load lại trang
      setPromotions(prev => prev.map(p => 
        p.promotion_id === promotion.promotion_id 
          ? { ...p, is_active: newStatus } 
          : p
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(`Lỗi khi ${actionName} voucher`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await adminService.deletePromotion(id);
      toast.success('Xóa voucher thành công');
      fetchPromotions(); 
    } catch (error) {
      console.error('Error deleting promotion:', error);
      const message = error.response?.data?.message || 'Lỗi khi xóa voucher';
      toast.error(message);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchPromotions();
  };

  if (showAddForm) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6 text-gray-500 text-sm">
          <button
            onClick={() => setShowAddForm(false)}
            className="hover:text-[#004535] transition-colors cursor-pointer"
          >
            Voucher
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Thêm mới</span>
        </div>
        <AddPromotionForm onSuccess={handleAddSuccess} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004535]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TicketPercent className="h-6 w-6 text-[#004535]" />
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004535] text-white rounded-lg hover:bg-[#003d2f] transition-colors"
        >
          <Plus size={20} />
          Thêm Voucher
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <TicketPercent className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Chưa có voucher nào</p>
          <p className="text-gray-400 text-sm mb-6">Tạo voucher mới để bắt đầu</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#004535] text-white rounded-lg hover:bg-[#003d2f] transition-colors"
          >
            <Plus size={20} />
            Thêm Voucher Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phạm vi áp dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn tối thiểu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion.promotion_id} className={`hover:bg-gray-50 ${!promotion.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className={`h-4 w-4 ${promotion.is_active ? 'text-[#004535]' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{promotion.code}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">{promotion.description}</p>
                    </td>
                    
                    <td className="px-6 py-4 align-top">
                      {renderScope(promotion)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${promotion.is_active ? 'text-[#004535]' : 'text-gray-600'}`}>
                        {getDiscountText(promotion)}
                      </span>
                      {promotion.discount_type === 'percentage' && promotion.max_discount_amount && (
                        <p className="text-xs text-gray-500">
                          Tối đa {formatCurrency(promotion.max_discount_amount)}đ
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(promotion.min_order_value)}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <div>
                          <p>{formatDate(promotion.start_date)}</p>
                          <p>→ {formatDate(promotion.end_date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{promotion.used_count} / {promotion.usage_limit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(promotion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* [THÊM MỚI] Nút Toggle Active */}
                        <button
                          onClick={() => handleToggleStatus(promotion)}
                          className={`p-2 rounded-full transition-colors ${
                            promotion.is_active 
                              ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50' 
                              : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={promotion.is_active ? "Vô hiệu hóa" : "Kích hoạt lại"}
                        >
                          {promotion.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                        </button>

                        <button
                          onClick={() => handleDelete(promotion.promotion_id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Xóa voucher"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionList;