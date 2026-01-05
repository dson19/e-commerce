import React from 'react';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileSidebar = ({ user, activeTab, menuItems }) => {
    return (
        <aside className="w-full md:w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#004535] flex items-center justify-center text-white font-bold text-lg">
                    {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">Xin chào,</p>
                    <h3 className="font-bold text-gray-800 truncate max-w-[150px]">{user?.fullname}</h3>
                </div>
            </div>
            <ul className="p-3 space-y-1">
                {menuItems.map((item) => (
                    <li key={item.id}>
                        <Link
                            to={item.id === 'profile' ? '/profile' : `/profile/${item.id}`}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#E5F2F0] text-[#004535]' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={activeTab === item.id ? 'text-[#004535]' : 'text-gray-400'}>{item.icon}</span>
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default ProfileSidebar;
