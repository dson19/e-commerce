import React, { useState, useEffect, useCallback } from 'react';
import { productService, adminService } from '../../services/api';
import { PlusCircle, Trash2, Loader2, ChevronLeft, ChevronRight, PackageSearch, ChevronDown, Boxes, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/currency';

const InventoryModal = ({ product, onClose, onUpdateSuccess }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(product.id);
      if (res.data.success) {
        setVariants(res.data.data.variants || []);
      }
    } catch {
      toast.error("Lỗi tải thông tin phiên bản");
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleUpdateStock = async (variantId, newStock) => {
    try {
      setUpdatingId(variantId);
      await adminService.updateInventory(variantId, { stock: parseInt(newStock) });
      toast.success("Cập nhật thành công");
      onUpdateSuccess();
      // Update local state to reflect change immediately
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock: parseInt(newStock) } : v));
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#004535]/10 text-[#004535] rounded-xl flex items-center justify-center">
              <Boxes size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Quản lý kho hàng</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#004535]" size={32} />
              <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu phiên bản...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.length > 0 ? variants.map((variant) => (
                <div key={variant.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{variant.color}</span>
                      {variant.size && <span className="text-xs px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">{variant.size}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500">Đang đặt: <strong className="text-orange-600">{variant.reservedStock || 0}</strong></span>
                      <span className="text-gray-500">Khả dụng: <strong className="text-[#004535]">{(variant.stock || 0) - (variant.reservedStock || 0)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <input
                        type="number"
                        defaultValue={variant.stock}
                        className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004535]/20 focus:border-[#004535] transition-all"
                        onBlur={(e) => {
                          if (e.target.value !== variant.stock.toString()) {
                            handleUpdateStock(variant.id, e.target.value);
                          }
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        Tổng kho
                      </div>
                    </div>
                    {updatingId === variant.id ? (
                      <div className="p-2"><Loader2 className="animate-spin text-[#004535]" size={16} /></div>
                    ) : (
                      <div className="p-2 text-[#004535] opacity-50"><Save size={16} /></div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">Không có phiên bản nào cho sản phẩm này</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#004535] text-white rounded-lg font-bold hover:bg-[#003528] transition-all active:scale-[0.98] shadow-lg shadow-[#004535]/10"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryProduct, setInventoryProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProducts = useCallback(async (page, size) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ page: page + 1, limit: size });
      if (res.data.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalElements(res.data.pagination.total);
      }
    } catch {
      console.error("Error loading products");
      toast.error("Lỗi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize);
  }, [currentPage, pageSize, fetchProducts]);

  const handleDeleteProduct = async () => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      // Chức năng xóa đang được cập nhật với API mới
      toast.info("Chức năng xóa đang được cập nhật với API mới");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  if (loading && products.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#004535]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng và thông tin sản phẩm ({totalElements} sản phẩm)</p>
        </div>
        <button onClick={() => setActiveTab('add-product')} className="bg-[#004535] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#003528] flex items-center gap-2 shadow-lg transition-all active:scale-95">
          <PlusCircle size={18} /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-bold border-b border-gray-100 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Giá bán (từ)</th>
                <th className="p-4">Tồn kho</th>
                <th className="p-4">Đã đặt</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? products.map(product => {
                const imgUrl = product.img ? product.img.split(';')[0] : '';
                const availableTotal = parseInt(product.total_stock) - parseInt(product.total_reserved);

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <img src={imgUrl} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-800 line-clamp-1">{product.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase">{product.brand_name || 'N/A'}</span>
                          <span className="text-[10px] text-gray-400">ID: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#004535]">{formatCurrency(product.min_price)}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${availableTotal <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                          {product.total_stock}
                        </span>
                        {availableTotal <= 0 ? (
                          <span className="text-[10px] font-bold text-red-500 uppercase leading-none">Hết hàng</span>
                        ) : availableTotal <= 5 ? (
                          <span className="text-[10px] font-bold text-orange-500 uppercase leading-none">Sắp hết</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-500">{product.total_reserved}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setInventoryProduct(product)}
                          className="p-2 hover:bg-[#004535]/5 rounded-lg text-[#004535] transition-colors"
                          title="Quản lý kho"
                        >
                          <Boxes size={18} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <PackageSearch size={48} className="mb-4 opacity-20" />
                      <p>Không tìm thấy sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              Hiển thị{" "}
              <span className="font-bold text-slate-900">
                {products.length}
              </span>{" "}
              /{" "}
              <span className="font-bold text-slate-900">
                {totalElements}
              </span>{" "}
              sản phẩm
            </div>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="appearance-none text-xs sm:text-sm text-slate-700 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer w-full sm:w-auto hover:border-slate-400 transition-colors"
              >
                <option value="10" className="text-slate-700">10 / trang</option>
                <option value="15" className="text-slate-700">15 / trang</option>
                <option value="25" className="text-slate-700">25 / trang</option>
                <option value="50" className="text-slate-700">50 / trang</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-white border border-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${currentPage === pageNum
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-white border border-slate-300"
                      }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-white border border-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {inventoryProduct && (
        <InventoryModal
          product={inventoryProduct}
          onClose={() => setInventoryProduct(null)}
          onUpdateSuccess={() => fetchProducts(currentPage, pageSize)}
        />
      )}
    </div>
  );
};

export default ProductList;
