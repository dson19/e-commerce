import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import { SearchX } from 'lucide-react';
import { productService } from '../services/api';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query });
        const productsData = res.data.data || [];

        const mapped = productsData.map(p => ({
          ...p,
          price: p.min_price || "0"
        }));
        setResults(mapped);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <MainLayout>
      <div className="py-8 bg-white min-h-screen">
        {/* Phần tiêu đề kết quả */}
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Kết quả tìm kiếm cho: <span className="text-[#004535]">"{query}"</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Đang tìm kiếm..." : `Tìm thấy ${results.length} sản phẩm`}
          </p>
        </div>

        {/* Phần hiển thị danh sách sản phẩm */}
        {loading ? (
          <div className="flex justify-center py-20">Đang tải...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Phần hiển thị khi không tìm thấy kết quả
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <SearchX size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h2>
            <p className="text-gray-500 max-w-md">
              Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}".
              Hãy thử tìm kiếm bằng từ khóa khác.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;