import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
// import { PRODUCTS } from '../data/mockData'; // Deprecated
import axios from 'axios';

// Import các component con
import ProductFilter from '../components/product_page/ProductFilter';
import SortBar from '../components/product_page/SortBar';
import ProductCard from '@/components/ProductCard';
import { SearchX } from 'lucide-react';

const ProductsPage = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const initialBrand = searchParams.get('brand');

   // --- 1. STATES QUẢN LÝ LỌC ---
   const [selectedBrand, setSelectedBrand] = useState(initialBrand || null); // Hãng (null = tất cả)

   // Sync state if URL changes (e.g. navigation from sidebar while on page)
   useEffect(() => {
      const brandParam = searchParams.get('brand');
      if (brandParam !== selectedBrand) {
         setSelectedBrand(brandParam || null);
      }
   }, [searchParams, selectedBrand]);

   // Handle brand selection by updating URL
   const handleBrandSelect = (brandSlug) => {
      const newParams = new URLSearchParams(searchParams);
      if (brandSlug) {
         newParams.set('brand', brandSlug);
      } else {
         newParams.delete('brand');
      }
      setSearchParams(newParams);
   };

   // Khoảng giá đang áp dụng lọc
   const [appliedPriceRange, setAppliedPriceRange] = useState([0, 1000000000]);

   // Khoảng giá hiển thị trên ô input (chưa áp dụng cho đến khi bấm nút)
   const [tempPriceRange, setTempPriceRange] = useState([0, 50000000]);

   const [sortOption, setSortOption] = useState('default'); // default, newest, price_asc, price_desc

   // Data state
   const [totalPages, setTotalPages] = useState(0);
   const [totalItems, setTotalItems] = useState(0);
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // --- Pagination State ---
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(15);

   // Fetch data
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            const params = {
               page: currentPage,
               limit: itemsPerPage,
               minPrice: appliedPriceRange[0] > 0 ? appliedPriceRange[0] : undefined,
               maxPrice: appliedPriceRange[1] < 1000000000 ? appliedPriceRange[1] : undefined,
               brand: selectedBrand || undefined,
               sort: sortOption !== 'default' ? sortOption : undefined
            };

            const response = await axios.get('http://localhost:5000/api/products', { params });

            // Map API data
            const mappedProducts = response.data.data.map(p => ({
               ...p,
               price: p.min_price || "0",
               category: p.brand_name ? p.brand_name.toLowerCase() : 'other'
            }));

            setProducts(mappedProducts);
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.total);

         } catch (err) {
            console.error("Failed to fetch products", err);
            setError("Không thể tải danh sách sản phẩm.");
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, [currentPage, itemsPerPage, selectedBrand, appliedPriceRange, sortOption]);

   // Hàm xử lý khi bấm nút "Áp dụng" giá
   const handleApplyPrice = (min, max) => {
      // Check if min/max are valid numbers (and not event objects)
      if (typeof min === 'number' && typeof max === 'number') {
         setAppliedPriceRange([min, max]);
      } else {
         // Nếu không truyền (hoặc là event), lấy từ state input
         setAppliedPriceRange(tempPriceRange);
      }
   };

   // Reset page when filters change (except page change itself)
   useEffect(() => {
      setCurrentPage(1);
   }, [selectedBrand, appliedPriceRange, sortOption]);




   return (
      <MainLayout>
         <div className="bg-[#F4F6F8] min-h-screen py-4">
            <div className="container mx-auto px-4 max-w-[1200px]">

               <div className="text-xs text-gray-500 mb-4">
                  Trang chủ / <span className="text-gray-800">Sản phẩm</span>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                  {/* CỘT TRÁI: BỘ LỌC */}
                  <aside className="sticky top-24 hidden lg:block lg:col-span-3 self-start">
                     <ProductFilter
                        selectedBrand={selectedBrand}
                        onBrandSelect={handleBrandSelect}
                        tempPriceRange={tempPriceRange}
                        setTempPriceRange={setTempPriceRange}
                        applyPriceFilter={handleApplyPrice}
                     />
                  </aside>

                  {/* CỘT PHẢI: KẾT QUẢ */}
                  <main className="lg:col-span-9">

                     {/* Banner danh mục (Giữ nguyên) */}


                     {/* Thanh sắp xếp */}
                     <SortBar
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                     />

                     {/* Danh sách sản phẩm */}
                     <div className="bg-white p-4 rounded-lg shadow-sm min-h-[500px]">
                        <h1 className="text-lg font-bold text-gray-800 mb-2">
                           {selectedBrand ? `Điện thoại ${selectedBrand.toUpperCase()}` : 'Tất cả điện thoại'}
                        </h1>

                        {loading ? (
                           <div className="flex justify-center items-center h-40">Đang tải sản phẩm...</div>
                        ) : error ? (
                           <div className="text-red-500 text-center">{error}</div>
                        ) : (
                           <>
                              {/* Pagination & Filter Bar */}
                              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                 {/* Left: Text Info */}
                                 <p className="text-sm text-gray-600">
                                    Hiển thị <span className="font-bold text-gray-900">{products.length}</span> / <span className="font-bold text-gray-900">{totalItems}</span> sản phẩm
                                 </p>

                                 {/* Right: Controls */}
                                 <div className="flex items-center gap-4">
                                    {/* Items Per Page Selector */}
                                    <div className="relative">
                                       <select
                                          value={itemsPerPage}
                                          onChange={(e) => {
                                             setItemsPerPage(Number(e.target.value));
                                             setCurrentPage(1);
                                          }}
                                          className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004535] focus:border-[#004535] cursor-pointer"
                                       >
                                          <option value={12}>12 / trang</option>
                                          <option value={15}>15 / trang</option>
                                          <option value={24}>24 / trang</option>
                                          <option value={48}>48 / trang</option>
                                       </select>
                                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                       </div>
                                    </div>

                                    {/* Pagination Buttons */}
                                    {totalPages > 1 && (
                                       <div className="flex items-center gap-1">
                                          <button
                                             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                             disabled={currentPage === 1}
                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
                                          >
                                             &lt;
                                          </button>

                                          {(() => {
                                             const delta = 1; // Number of pages to show on each side of current page
                                             const left = currentPage - delta;
                                             const right = currentPage + delta + 1;
                                             let range = [];
                                             let rangeWithDots = [];
                                             let l;

                                             for (let i = 1; i <= totalPages; i++) {
                                                if (i === 1 || i === totalPages || (i >= left && i < right)) {
                                                   range.push(i);
                                                }
                                             }

                                             for (let i of range) {
                                                if (l) {
                                                   if (i - l === 2) {
                                                      rangeWithDots.push(l + 1);
                                                   } else if (i - l !== 1) {
                                                      rangeWithDots.push('...');
                                                   }
                                                }
                                                rangeWithDots.push(i);
                                                l = i;
                                             }

                                             return rangeWithDots.map((page, index) => (
                                                <button
                                                   key={index}
                                                   onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                   disabled={page === '...'}
                                                   className={`w-8 h-8 flex items-center justify-center border rounded-md text-sm font-medium transition-colors ${page === currentPage
                                                      ? 'bg-[#00A76F] text-white border-[#00A76F]'
                                                      : page === '...'
                                                         ? 'border-transparent text-gray-500 cursor-default'
                                                         : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                                                      }`}
                                                >
                                                   {page}
                                                </button>
                                             ));
                                          })()}

                                          <button
                                             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                             disabled={currentPage === totalPages}
                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
                                          >
                                             &gt;
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {products.length > 0 ? (
                                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {products.map(product => (
                                       <ProductCard key={product.id} product={product} />
                                    ))}
                                 </div>
                              ) : (
                                 <div className="flex flex-col items-center justify-center py-10">
                                    <SearchX size={48} className="text-gray-300 mb-3" />
                                    <p className="text-gray-500">Không tìm thấy sản phẩm nào trong khoảng giá này.</p>
                                    <button
                                       onClick={() => {
                                          setSelectedBrand(null);
                                          setAppliedPriceRange([0, 1000000000]);
                                          // Reset page is handled in useEffect or manually here if needed, 
                                          // but useEffect on dependency change is safer.
                                          setCurrentPage(1);
                                       }}
                                       className="mt-4 px-4 py-2 bg-[#004535] text-white rounded text-sm hover:bg-[#003528]"
                                    >
                                       Xóa bộ lọc
                                    </button>
                                 </div>
                              )}

                              {/* Bottom Pagination Controls */}
                              {totalPages > 1 && (
                                 <div className="flex flex-col md:flex-row justify-end items-center mt-6 gap-4">
                                    <div className="flex items-center gap-4">
                                       {/* Items Per Page Selector */}
                                       <div className="relative">
                                          <select
                                             value={itemsPerPage}
                                             onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                             }}
                                             className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004535] focus:border-[#004535] cursor-pointer"
                                          >
                                             <option value={12}>12 / trang</option>
                                             <option value={15}>15 / trang</option>
                                             <option value={24}>24 / trang</option>
                                             <option value={48}>48 / trang</option>
                                          </select>
                                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-1">
                                          <button
                                             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                             disabled={currentPage === 1}
                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
                                          >
                                             &lt;
                                          </button>

                                          {(() => {
                                             const delta = 1;
                                             const left = currentPage - delta;
                                             const right = currentPage + delta + 1;
                                             let range = [];
                                             let rangeWithDots = [];
                                             let l;

                                             for (let i = 1; i <= totalPages; i++) {
                                                if (i === 1 || i === totalPages || (i >= left && i < right)) {
                                                   range.push(i);
                                                }
                                             }

                                             for (let i of range) {
                                                if (l) {
                                                   if (i - l === 2) {
                                                      rangeWithDots.push(l + 1);
                                                   } else if (i - l !== 1) {
                                                      rangeWithDots.push('...');
                                                   }
                                                }
                                                rangeWithDots.push(i);
                                                l = i;
                                             }

                                             return rangeWithDots.map((page, index) => (
                                                <button
                                                   key={index}
                                                   onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                   disabled={page === '...'}
                                                   className={`w-8 h-8 flex items-center justify-center border rounded-md text-sm font-medium transition-colors ${page === currentPage
                                                      ? 'bg-[#00A76F] text-white border-[#00A76F]'
                                                      : page === '...'
                                                         ? 'border-transparent text-gray-500 cursor-default'
                                                         : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                                                      }`}
                                                >
                                                   {page}
                                                </button>
                                             ));
                                          })()}

                                          <button
                                             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                             disabled={currentPage === totalPages}
                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500"
                                          >
                                             &gt;
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </>
                        )}
                     </div>

                  </main>
               </div>
            </div>
         </div>
      </MainLayout>
   );
};

export default ProductsPage;