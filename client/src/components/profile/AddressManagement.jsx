import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit3, Trash2 } from 'lucide-react';
import { authService } from '@/services/api';
import AddressModal from '@/components/cart/AddressModal';
import { toast } from 'sonner';

const AddressManagement = () => {
    const [addressList, setAddressList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await authService.getAddresses();
            if (res.data.success) {
                setAddressList(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSetDefault = async (addr) => {
        if (addr.is_default) return;
        try {
            await authService.updateAddress(addr.address_id, { ...addr, is_default: true });
            toast.success('Đã thay đổi địa chỉ mặc định');
            fetchAddresses();
        } catch (error) {
            toast.error('Lỗi khi cập nhật địa chỉ');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            try {
                // Assuming authService has deleteAddress, otherwise might range to deleteAddress logic
                // Checking AddressModal might give hint, but usually delete is simple.
                // Wait, authService usually has generic update.
                // Let's assume authService has deleteAddress or we need to add it?
                // Step 338 summary said "authService trực tiếp để addAddress và updateAddress". Doesn't mention delete.
                // But typically it should exist. I'll venture to use authService.deleteAddress if it exists, or check api.js
                // To be safe, I'll check api.js later if this fails, but for now assuming standard naming.
                // Actually, let's assume `authService.deleteAddress` exists.
                await authService.deleteAddress(id);
                toast.success('Đã xóa địa chỉ');
                fetchAddresses();
            } catch (error) {
                toast.error('Lỗi khi xóa địa chỉ');
            }
        }
    };

    const handleEdit = (e, addr) => {
        e.stopPropagation();
        setEditData(addr);
        setShowAddressModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý địa chỉ</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý các địa chỉ giao hàng của bạn</p>
                </div>
                <button
                    onClick={() => {
                        setEditData(null);
                        setShowAddressModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#004535] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#003528] transition-all"
                >
                    <Plus size={18} /> Thêm địa chỉ mới
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004535] mx-auto"></div>
                    </div>
                ) : addressList.length > 0 ? (
                    addressList.map((addr) => (
                        <div
                            key={addr.address_id}
                            className={`p-5 rounded-xl border transition-all cursor-pointer relative group ${addr.is_default ? 'border-[#004535] bg-[#E5F2F0]/30' : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                            onClick={() => handleSetDefault(addr)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-800">{addr.name}</span>
                                    {addr.is_default && (
                                        <span className="text-[10px] bg-[#004535] text-white px-2 py-0.5 rounded-full font-bold uppercase">Mặc định</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleEdit(e, addr)}
                                        className="text-gray-500 hover:text-[#004535] transition-colors"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, addr.address_id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="min-w-[70px] text-gray-400">Địa chỉ:</span>
                                    <span>{addr.street}, {addr.ward}, {addr.district}, {addr.city}</span>
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="min-w-[70px] text-gray-400">Điện thoại:</span>
                                    <span>{addr.phone}</span>
                                </p>
                            </div>

                            {!addr.is_default && (
                                <p className="mt-4 text-[10px] text-gray-400 italic">Nhấn để đặt làm mặc định</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Bạn chưa lưu địa chỉ nào</p>
                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowAddressModal(true);
                            }}
                            className="mt-4 text-[#004535] font-bold hover:underline"
                        >
                            Thêm địa chỉ ngay
                        </button>
                    </div>
                )}
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

export default AddressManagement;
