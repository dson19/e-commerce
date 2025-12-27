import React, { useState } from 'react';
import axios from 'axios';
import { ChevronRight, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AddProductForm = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Điện thoại', countInStock: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Cấu hình API
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      await api.post('/products', data);
      toast.success("Thêm sản phẩm thành công!");
      setActiveTab('products');
    } catch (error) {
      toast.error("Thêm sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-gray-500 text-sm">
        <span className="cursor-pointer hover:text-[#004535]" onClick={() => setActiveTab('products')}>Sản phẩm</span>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Thêm mới</span>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin sản phẩm</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
              <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#004535] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán</label>
              <input required type="number" onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#004535] outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#004535] outline-none bg-white">
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                <input required type="number" onChange={e => setFormData({...formData, countInStock: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#004535] outline-none" />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative h-40">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full object-contain" /> : <UploadCloud size={32} className="text-gray-400 mb-2" />}
            </div>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
             <textarea rows="4" onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-[#004535] outline-none"></textarea>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setActiveTab('products')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[#004535] text-white rounded-lg font-bold hover:bg-[#003528] disabled:opacity-70 flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Lưu sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProductForm;