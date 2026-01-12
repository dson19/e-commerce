import React, { useState, useEffect } from 'react';
import { adminService, promotionService } from '@/services/api';
import { toast } from 'sonner';
import { productService } from '@/services/api';
import { X, Search } from 'lucide-react';

const AddPromotionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount_amount: '',
    min_order_value: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    target_type: 'all',
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (productSearch.length >= 2) {
      const timer = setTimeout(() => {
        searchProducts();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProductResults([]);
    }
  }, [productSearch]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, brandsRes] = await Promise.all([
        productService.getParentCategories(),
        productService.getBrands(),
      ]);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setBrands(brandsRes.data?.data || brandsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const searchProducts = async () => {
    try {
      const response = await productService.searchProducts(productSearch);
      setProductResults(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
  };

  const handleProductSelect = (product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
      setProductSearch('');
      setProductResults([]);
    }
  };

  const handleProductRemove = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const buildScopes = () => {
    const scopesArray = [];
    
    if (formData.target_type === 'category') {
      selectedCategories.forEach((catId) => {
          // Gửi trực tiếp catId (là số)
          scopesArray.push({ type: 'category', id: catId });
      });
    } else if (formData.target_type === 'brand') {
      selectedBrands.forEach((brandId) => {
          // Gửi trực tiếp brandId (là số)
          scopesArray.push({ type: 'brand', id: brandId });
      });
    } else if (formData.target_type === 'product') {
      selectedProducts.forEach((product) => {
        // Gửi product.id (là số)
        scopesArray.push({ type: 'product', id: product.id });
      });
    }

    return scopesArray;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation cơ bản
    if (!formData.code || !formData.description || !formData.start_date || 
        !formData.end_date || !formData.usage_limit || !formData.discount_value || 
        !formData.min_order_value) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // 2. Validation Scope
    if (formData.target_type !== 'all') {
      if (formData.target_type === 'category' && selectedCategories.length === 0) {
        toast.error('Vui lòng chọn ít nhất một danh mục');
        return;
      }
      if (formData.target_type === 'brand' && selectedBrands.length === 0) {
        toast.error('Vui lòng chọn ít nhất một thương hiệu');
        return;
      }
      if (formData.target_type === 'product' && selectedProducts.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm');
        return;
      }
    }

    try {
      setLoading(true);
      const scopes = buildScopes();
      const payload = {
        ...formData,
        usage_limit: parseInt(formData.usage_limit),
        discount_value: parseFloat(formData.discount_value),
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        min_order_value: parseFloat(formData.min_order_value),
        scopes: scopes
      };

      await adminService.createPromotion(payload);
      
      toast.success('Tạo voucher thành công!');
      
      // Reset form
      setFormData({
        code: '', description: '', discount_type: 'percentage', discount_value: '',
        max_discount_amount: '', min_order_value: '', start_date: '', end_date: '',
        usage_limit: '', target_type_type: 'all',
      });
      setSelectedCategories([]);
      setSelectedBrands([]);
      setSelectedProducts([]);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo Voucher Mới</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã Voucher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              placeholder="VD: SALE2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              placeholder="100"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
            placeholder="Mô tả voucher..."
            required
          />
        </div>

        {/* Ngày bắt đầu và kết thúc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Loại giảm giá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (đ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              placeholder={formData.discount_type === 'percentage' ? '10' : '50000'}
              min="1"
              max={formData.discount_type === 'percentage' ? '100' : undefined}
              step={formData.discount_type === 'percentage' ? '1' : '1000'}
              required
            />
            {formData.discount_type === 'percentage' && (
              <p className="text-xs text-gray-500 mt-1">Nhập từ 1-100</p>
            )}
          </div>
        </div>

        {formData.discount_type === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảm tối đa (đ) (Tùy chọn)
            </label>
            <input
              type="number"
              name="max_discount_amount"
              value={formData.max_discount_amount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
              placeholder="100000"
              min="0"
              step="1000"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn hàng tối thiểu (đ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="min_order_value"
            value={formData.min_order_value}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004535] focus:border-transparent"
            placeholder="100000"
            min="0"
            step="1000"
            required
          />
        </div>

        {/* Áp dụng cho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Áp dụng cho <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target_type"
                value="all"
                checked={formData.target_type === 'all'}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
              />
              <span>Tất cả sản phẩm</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target_type"
                value="category"
                checked={formData.target_type === 'category'}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
              />
              <span>Theo Danh mục</span>
            </label>

            {formData.target_type === 'category' && (
              <div className="ml-7 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {loadingData ? (
                  <p className="text-sm text-gray-500">Đang tải...</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.category_id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.category_id)}
                          onChange={() => handleCategoryToggle(category.category_id)}
                          className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
                        />
                        <span className="text-sm">{category.category_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target_type"
                value="brand"
                checked={formData.target_type === 'brand'}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
              />
              <span>Theo Thương hiệu</span>
            </label>

            {formData.target_type === 'brand' && (
              <div className="ml-7 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {loadingData ? (
                  <p className="text-sm text-gray-500">Đang tải...</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand.brand_id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.brand_id)}
                          onChange={() => handleBrandToggle(brand.brand_id)}
                          className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
                        />
                        <span className="text-sm">{brand.brand_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target_type"
                value="product"
                checked={formData.target_type === 'product'}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#004535] focus:ring-[#004535]"
              />
              <span>Sản phẩm cụ thể</span>
            </label>

            {formData.target_type === 'product' && (
              <div className="ml-7 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004535] focus:border-transparent"
                  />
                </div>
                {productResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white mb-3">
                    {productResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.brand_name} - {product.category_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div>
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.brand_name} - {product.category_name}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleProductRemove(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#004535] text-white rounded-lg font-medium hover:bg-[#003d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo...' : 'Tạo Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPromotionForm;
