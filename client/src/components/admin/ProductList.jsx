import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProductList = ({ setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cấu hình API
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.products || res.data);
      } catch (error) {
        toast.error("Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#004535]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h2>
        <button onClick={() => setActiveTab('add-product')} className="bg-[#004535] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#003528] flex items-center gap-2 shadow-md">
          <PlusCircle size={18} /> Thêm mới
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-100">
            <tr>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Kho</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg p-1 flex items-center justify-center overflow-hidden border border-gray-200">
                     <img src={product.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                </td>
                <td className="p-4 font-bold text-[#004535]">{product.price?.toLocaleString()}₫</td>
                <td className="p-4">{product.countInStock}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteProduct(product._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;