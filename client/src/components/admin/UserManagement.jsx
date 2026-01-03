import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  const fetchUsers = useCallback(async (page) => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page, limit });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleDeleteUser = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      // Chức năng xóa đang được cập nhật với API mới
      toast.info("Chức năng xóa đang được cập nhật với API mới");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  if (loading && users.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#004535]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <span className="text-sm text-gray-500">Tổng cộng: <strong>{totalItems}</strong> thành viên</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">Tên người dùng</th>
                <th className="p-4">Email</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? users.map(user => (
                <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#004535] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.fullname?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span>{user.fullname}</span>
                      <span className="text-[10px] text-gray-400">ID: {user.user_id}</span>
                    </div>
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone_number || '---'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role || 'User'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeleteUser(user.user_id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">Không có người dùng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Trang {currentPage} trên {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#004535] text-white shadow-md' : 'hover:bg-gray-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
