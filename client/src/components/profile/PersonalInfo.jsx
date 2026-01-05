import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const PersonalInfo = ({ user, updateUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone_number: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                fullname: formData.fullname
            };
            const res = await authService.updateProfile(payload);
            updateUser(res.data.data || { ...user, ...payload });
            toast.success("Cập nhật hồ sơ thành công!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6 border-b border-gray-100 pb-4">
                <h1 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h1>
                <p className="text-gray-500 text-sm mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-10">
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                        <input
                            type="text" name="fullname"
                            value={formData.fullname} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#004535] focus:ring-1 focus:ring-[#004535] outline-none"
                            placeholder="Nhập họ tên"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1">*Email không thể thay đổi</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="text" name="phone_number"
                                value={formData.phone_number}
                                disabled
                                placeholder="Nhập số điện thoại"
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">*Số điện thoại không thể thay đổi</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading} className={`bg-[#004535] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#004535]/30 flex items-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-[#003528]'}`}>
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>

                <div className="w-full md:w-[240px] flex flex-col items-center border-l border-gray-100 pl-0 md:pl-10">
                    <div className="relative group cursor-pointer mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#004535] flex items-center justify-center text-white text-4xl font-bold">
                            {user?.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#004535]">
                            <Camera size={18} />
                        </div>
                    </div>
                    <button type="button" className="text-sm font-medium text-[#004535] hover:underline">Chọn ảnh</button>
                </div>
            </div>
        </form>
    );
};

export default PersonalInfo;
