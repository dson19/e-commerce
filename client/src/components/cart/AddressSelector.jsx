import React, { useState, useEffect, useCallback } from 'react';
import { SquarePen, Plus } from 'lucide-react';
import { authService } from '@/services/api';
import AddressModal from './AddressModal';
import { toast } from 'sonner';

const AddressSelector = ({ selectedAddress, setSelectedAddress }) => {
    const [addressList, setAddressList] = useState([]);
    const [addressLoading, setAddressLoading] = useState(true);

    const [isManaging, setIsManaging] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchAddresses = useCallback(async () => {
        setAddressLoading(true);
        try {
            const res = await authService.getAddresses();
            setAddressList(res.data.data);
        } catch (error) {
            console.error("Lỗi tải danh sách địa chỉ:", error);
            // toast.error("Không thể tải danh sách địa chỉ");
        } finally {
            setAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    useEffect(() => {
        if (addressList.length > 0 && !selectedAddress) {
            const defaultAddr = addressList.find(addr => addr.is_default) || addressList[addressList.length - 1];
            setSelectedAddress(defaultAddr);
        } else if (addressList.length > 0 && selectedAddress) {
            // Check if selected address still exists, if not reset
            const exists = addressList.find(addr => addr.address_id === selectedAddress.address_id);
            if (!exists) {
                const defaultAddr = addressList.find(addr => addr.is_default) || addressList[addressList.length - 1];
                setSelectedAddress(defaultAddr);
            } else {
                // Update details in case they changed
                setSelectedAddress(exists);
            }
        }
    }, [addressList, selectedAddress, setSelectedAddress]);

    const handleSetDefault = async (addr) => {
        try {
            await authService.updateAddress(addr.address_id, { ...addr, is_default: true });
            toast.success('Đã đặt làm địa chỉ mặc định');
            fetchAddresses(); // Refresh list
        } catch (error) {
            toast.error('Không thể đặt địa chỉ mặc định: ' + (error.response?.data?.message || error.message));
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

    return (
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

            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    editData={editData}
                    onSuccess={fetchAddresses}
                />
            )}
        </div>
    );
};

export default AddressSelector;
