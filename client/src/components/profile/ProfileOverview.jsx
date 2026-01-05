import React from 'react';

const ProfileOverview = ({ user }) => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#004535] to-[#00654e] rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
                <div>
                    <p className="text-white/80 text-sm mb-1">Thành viên {user?.rank || 'Bạc'}</p>
                    <h2 className="text-2xl font-bold">Xin chào, {user?.fullname}</h2>
                    <p className="text-white/60 text-xs mt-2">Điểm tích lũy: {user?.points || 0} điểm</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <span className="text-2xl font-bold">{user?.fullname?.charAt(0).toUpperCase()}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border p-4 rounded-xl text-center">
                    <span className="block text-2xl font-bold">2</span>
                    <span className="text-xs text-gray-500">Đơn hàng</span>
                </div>
                <div className="bg-white border p-4 rounded-xl text-center">
                    <span className="block text-2xl font-bold text-green-600">0</span>
                    <span className="text-xs text-gray-500">Voucher</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;
