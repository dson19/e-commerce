import React from 'react';
import { Users, UserPlus, Search, ShieldAlert } from 'lucide-react';

const UserAnalytics = () => {
  // Demo dữ liệu (Nếu muốn gọi API thật thì dùng axios.create ở đây giống mấy file kia)
  const stats = {
    total: 1250,
    newToday: 15,
    active: 890,
    blocked: 5,
    recent: [
      { id: 1, name: 'Trần Văn X', email: 'x@gmail.com', time: '5 phút trước' },
      { id: 2, name: 'Lê Thị Y', email: 'y@gmail.com', time: '30 phút trước' },
      { id: 3, name: 'Nguyễn Z', email: 'z@gmail.com', time: '1 giờ trước' },
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Phân tích người dùng</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs font-bold uppercase">Tổng User</p><h3 className="text-2xl font-bold mt-1">{stats.total}</h3></div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs font-bold uppercase">Mới hôm nay</p><h3 className="text-2xl font-bold mt-1">+{stats.newToday}</h3></div>
          <div className="bg-green-100 p-3 rounded-full text-green-600"><UserPlus size={24}/></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs font-bold uppercase">Hoạt động</p><h3 className="text-2xl font-bold mt-1">{stats.active}</h3></div>
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Search size={24}/></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs font-bold uppercase">Bị khóa</p><h3 className="text-2xl font-bold mt-1">{stats.blocked}</h3></div>
          <div className="bg-red-100 p-3 rounded-full text-red-600"><ShieldAlert size={24}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
           <h3 className="font-bold text-gray-800 mb-6">Tăng trưởng người dùng (7 ngày)</h3>
           <div className="h-48 flex items-end justify-between px-2 gap-4">
              {[30, 45, 35, 60, 50, 75, 65].map((h, i) => (
                <div key={i} className="w-full bg-[#004535] rounded-t-lg hover:opacity-80 transition-opacity relative group" style={{height: `${h}%`}}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-3 text-xs text-gray-400 font-medium">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4">Mới tham gia</h3>
           <div className="space-y-4">
              {stats.recent.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{u.time}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;