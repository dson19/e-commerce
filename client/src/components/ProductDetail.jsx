import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/mockData";
import RelatedProductCard from "../components/RelatedProductCard";

// Import các component con đã tách
import ProductBreadcrumb from "../components/product_detail/ProductBreadcrumb";
import ProductGallery from "../components/product_detail/ProductGallery";
import ProductInfo from "../components/product_detail/ProductInfo";
import ProductTabs from "../components/product_detail/ProductTabs";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const currentProductId = parseInt(productId, 10);
  const { addToCart } = useCart();

  // States
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const product = PRODUCTS.find((p) => p.id === currentProductId);
    if (product) {
      // Mock data mở rộng (Giả lập dữ liệu đầy đủ)
      const extendedProduct = {
        ...product,
        reviewsCount: 45,
        rating: 4.8,
        description: "Đây là mô tả chi tiết của sản phẩm...",
        options: [
          { name: "Màu sắc", variants: ["Titan Đen", "Titan Tự nhiên", "Titan Xanh"] },
          { name: "Bộ nhớ", variants: ["256GB", "512GB", "1TB"] },
        ],
        gallery: [
          { id: 1, url: product.img.split(";")[0] },
          { id: 2, url: PRODUCTS.find((p) => p.id === 2)?.img.split(";")[0] || product.img.split(";")[0] },
          { id: 3, url: PRODUCTS.find((p) => p.id === 5)?.img.split(";")[0] || product.img.split(";")[0] },
        ],
      };
      setProductData(extendedProduct);
      setMainImage(extendedProduct.gallery[0].url);
      setSelectedOptions({});
      setActiveTab("description");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentProductId]);

  const handleOptionSelect = (optionName, variant) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: variant }));
  };

  const handleAddToCart = async (quantity) => {
    if (productData.options.length > 0 && Object.keys(selectedOptions).length < productData.options.length) {
      toast.error("Vui lòng chọn đầy đủ các tùy chọn (Màu sắc, Bộ nhớ)!");
      return;
    }
    const selectedVariant = productData.options.length > 0 ? ` (${Object.values(selectedOptions).join(", ")})` : "";
    
    const success = await addToCart(productData, quantity);
    
    if (success) {
      toast.success(`Đã thêm ${productData.name}${selectedVariant} vào giỏ!`, {
        action: { label: "Xem giỏ", onClick: () => navigate("/cart") },
      });
    }
  };

  if (!productData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const relatedProducts = PRODUCTS.filter(p => p.category === productData.category && p.id !== currentProductId).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 font-sans text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <ProductBreadcrumb category={productData.category} name={productData.name} />

        {/* Main Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7">
                    <ProductGallery 
                        gallery={productData.gallery} 
                        mainImage={mainImage} 
                        setMainImage={setMainImage} 
                    />
                </div>
                <div className="lg:col-span-5">
                    <ProductInfo
                        product={productData}
                        selectedOptions={selectedOptions}
                        handleOptionSelect={handleOptionSelect}
                        handleAddToCart={handleAddToCart}
                    />
                </div>
            </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
            <ProductTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                description={productData.description}
                reviewsCount={productData.reviewsCount}
            />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="w-1.5 h-7 bg-[#004535] rounded-full block"></span>
                    Sản phẩm tương tự
                </h2>
                <button onClick={() => navigate(`/category/${productData.category}`)} className="text-sm font-medium text-[#004535] hover:underline flex items-center gap-1">
                    Xem tất cả <ChevronRight size={16}/>
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;