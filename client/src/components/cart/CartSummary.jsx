import React, { useState, useEffect } from 'react';
import { Ticket, SquarePen, ShieldCheck, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/currency';
import { fetchAddresses, updateAddressThunk } from '@/redux/addressSlice';
import AddressModal from './AddressModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createOrderThunk } from '@/redux/orderSlice';
import { useCart } from '@/context/CartContext';

const CartSummary = ({ subtotal, total }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { list: addressList, loading: addressLoading } = useSelector((state) => state.address);
  const { loading: orderLoading } = useSelector((state) => state.order);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addressList.length > 0 && !selectedAddress) {
      const defaultAddr = addressList.find(addr => addr.is_default) || addressList[0];
      setSelectedAddress(defaultAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressList]);

  const handleSetDefault = async (addr) => {
    try {
      await dispatch(updateAddressThunk({
        id: addr.address_id,
        data: { ...addr, is_default: true }
      })).unwrap();
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      toast.error('Không thể đặt bộ mặc định: ' + error);
    }
  };

  const handleEdit = (addr) => {
    setEditData(addr);
    setShowAddressModal(true);
  };

  const handleOpenAddModal = () => {
    setEditData(null);
    setShowAddressModal(true);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          variant_id: item.id,
          quantity: item.quantity
        })),
        address_id: selectedAddress.address_id,
        paymentMethod: 'Bank Transfer',
        phone_number: selectedAddress.phone,
        name: selectedAddress.name
      };

      const resultAction = await dispatch(createOrderThunk(orderData)).unwrap();
      toast.success('Tạo đơn hàng thành công');

      // Clear cart
      await clearCart();

      // Navigate to success page
      navigate(`/checkout/success/${resultAction.order_id}`);
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

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

        {/* Địa chỉ thanh toán */}
        <div className="mb-6 border-b border-gray-100 pb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Địa chỉ giao hàng</p>
            {selectedAddress && !isManaging && (
              <button
                onClick={() => setIsManaging(true)}
                className="text-xs text-[#004535] font-bold hover:underline"
              >
                Thay đổi
              </button>
            )}
          </div>

          {addressLoading ? (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#004535] mx-auto"></div>
            </div>
          ) : !isManaging && selectedAddress ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-800">{selectedAddress.name}</span>
                  {selectedAddress.is_default && (
                    <span className="text-[10px] bg-[#004535]/10 text-[#004535] px-1.5 py-0.5 rounded font-medium">Mặc định</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pr-8">
                  {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
                </p>
                <p className="text-xs text-gray-500 mt-1">{selectedAddress.phone}</p>

                <button
                  onClick={() => handleEdit(selectedAddress)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <SquarePen size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {addressList.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {addressList.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`p-3 rounded-lg border transition-all ${selectedAddress?.address_id === addr.address_id
                        ? 'border-[#004535] bg-[#004535]/5'
                        : 'border-gray-100 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div>
                          <span className="font-bold text-xs text-gray-800">{addr.name}</span>
                          {addr.is_default && (
                            <span className="ml-2 text-[8px] bg-[#004535]/10 text-[#004535] px-1 py-0.5 rounded font-bold uppercase">Mặc định</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(addr)} className="text-gray-400 hover:text-gray-600 transition-colors"><SquarePen size={14} /></button>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-50">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr)}
                            className="text-[10px] text-gray-400 hover:text-gray-600 font-medium transition-colors"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAddress(addr);
                            setIsManaging(false);
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${selectedAddress?.address_id === addr.address_id
                            ? 'bg-[#004535] text-white cursor-default'
                            : 'text-[#004535] border border-[#004535] hover:bg-[#004535] hover:text-white'
                            }`}
                        >
                          {selectedAddress?.address_id === addr.address_id ? 'Đang chọn' : 'Chọn'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Chưa có địa chỉ nào</p>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 text-[#004535] text-sm font-semibold hover:underline transition-colors"
                >
                  <Plus size={16} /> Thêm địa chỉ mới
                </button>
                {isManaging && addressList.length > 0 && (
                  <button
                    onClick={() => setIsManaging(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          )}
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
          onClick={handleCheckout}
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

      {showAddressModal && (
        <AddressModal
          setShowAddressModal={setShowAddressModal}
          editData={editData}
        />
      )}
    </div>
  );
};

export default CartSummary;