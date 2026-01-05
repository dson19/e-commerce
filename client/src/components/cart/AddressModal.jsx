import React, { useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/services/api"

const AddressModal = ({ setShowAddressModal, editData = null, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        name: '',
        street: '',
        city: '',
        district: '',
        ward: '',
        phone: '',
        is_default: false
    })

    useEffect(() => {
        if (editData) {
            setAddress({
                ...editData,
                is_default: editData.is_default || false
            })
        }
    }, [editData])

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddress({
            ...address,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editData && editData.address_id) {
                await authService.updateAddress(editData.address_id, address)
                toast.success('Cập nhật địa chỉ thành công!')
            } else {
                await authService.addAddress(address)
                toast.success('Thêm địa chỉ thành công!')
            }
            if (onSuccess) onSuccess();
            setShowAddressModal(false)
        } catch (error) {
            console.error("Lỗi lưu địa chỉ:", error)
            toast.error(error.response?.data?.message || "Không thể lưu địa chỉ")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm h-screen flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white relative flex flex-col gap-5 text-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
            >
                <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <XIcon size={24} className="text-slate-400 hover:text-slate-600" />
                </button>

                <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{editData ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
                    <p className="text-sm text-slate-500">Vui lòng điền thông tin giao hàng chi tiết</p>
                </div>

                <div className="space-y-4">
                    <input name="name" onChange={handleAddressChange} value={address.name} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Họ và tên" required />

                    <input name="street" onChange={handleAddressChange} value={address.street} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Địa chỉ (Số nhà, tên đường...)" required />

                    <div className="grid grid-cols-2 gap-4">
                        <input name="city" onChange={handleAddressChange} value={address.city} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Thành phố" required />
                        <input name="district" onChange={handleAddressChange} value={address.district} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Quận/Huyện" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input name="ward" onChange={handleAddressChange} value={address.ward} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Phường/Xã" required />
                        <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="tel" placeholder="Số điện thoại" required />
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <input
                            id="is_default"
                            name="is_default"
                            type="checkbox"
                            onChange={handleAddressChange}
                            checked={address.is_default}
                            disabled={editData?.is_default}
                            className={`w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-800 ${editData?.is_default ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <label htmlFor="is_default" className={`text-sm text-slate-600 ${editData?.is_default ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            {editData?.is_default ? 'Đây là địa chỉ mặc định' : 'Đặt làm địa chỉ mặc định'}
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 bg-slate-800 text-white text-sm font-bold py-4 rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-lg shadow-slate-200 uppercase tracking-wider ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {loading ? 'Đang lưu...' : (editData ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ')}
                </button>
            </form>
        </div>
    )
}

export default AddressModal;