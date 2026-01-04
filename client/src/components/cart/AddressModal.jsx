import React, { useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { addAddress, updateAddress } from "@/redux/addressSlice"

const AddressModal = ({ setShowAddressModal, setSelectedAddress, editData = null }) => {
    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        phone: ''
    })

    useEffect(() => {
        if (editData && editData.address) {
            setAddress(editData.address)
        }
    }, [editData])

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        await new Promise(resolve => setTimeout(resolve, 800))

        try {
            if (editData && editData.index !== undefined) {
                dispatch(updateAddress({ index: editData.index, address }))
                if (setSelectedAddress) setSelectedAddress(address)
            } else {
                dispatch(addAddress(address))
                if (setSelectedAddress) setSelectedAddress(address)
            }
            setShowAddressModal(false)
        } catch (error) {
            console.error("Lỗi lưu địa chỉ:", error)
            throw new Error("Không thể lưu địa chỉ")
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm h-screen flex items-center justify-center p-4">
            <form
                onSubmit={e => toast.promise(handleSubmit(e), {
                    loading: 'Đang lưu địa chỉ...',
                    success: editData ? 'Cập nhật thành công!' : 'Thêm địa chỉ thành công!',
                    error: 'Có lỗi xảy ra!'
                })}
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

                    <input name="address" onChange={handleAddressChange} value={address.address} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Địa chỉ (Số nhà, tên đường...)" required />

                    <div className="grid grid-cols-2 gap-4">
                        <input name="city" onChange={handleAddressChange} value={address.city} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Thành phố" required />
                        <input name="district" onChange={handleAddressChange} value={address.district} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Quận/Huyện" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input name="ward" onChange={handleAddressChange} value={address.ward} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="text" placeholder="Phường/Xã" required />
                        <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2.5 px-4 outline-none border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition-all text-sm" type="tel" placeholder="Số điện thoại" required />
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-2 bg-slate-800 text-white text-sm font-bold py-4 rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-lg shadow-slate-200 uppercase tracking-wider"
                >
                    {editData ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                </button>
            </form>
        </div>
    )
}

export default AddressModal