import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext"; // <--- 1. Import Context

import { PRODUCTS } from "../data/mockData";
import RelatedProductCard from "../components/RelatedProductCard";

// Import các component con
import ProductBreadcrumb from "./product_detail/ProductBreadcrumb";
import ProductGallery from "./product_detail/ProductGallery";
import ProductInfo from "./product_detail/ProductInfo";
import ProductTabs from "./product_detail/ProductTabs";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const currentProductId = parseInt(productId, 10);

  // 2. Lấy hàm addToCart từ Context
  const { addToCart } = useCart();

  // States
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOptions, setSelectedOptions] = useState({});

  // Effect: Load Data & Reset
  useEffect(() => {
    const product = PRODUCTS.find((p) => p.id === currentProductId);

    if (product) {
      const extendedProduct = {
        ...product,
        reviewsCount: 45,
        rating: 5,
        description:
          "Đây là mô tả chi tiết của sản phẩm. Ví dụ: iPhone 15 Pro Max được chế tạo từ Titanium chuẩn hàng không vũ trụ, cực kỳ bền bỉ và nhẹ. Chip A17 Pro mang lại hiệu năng đồ họa đột phá.",
        options: [
          {
            name: "Màu sắc",
            variants: ["Titan Đen", "Titan Tự nhiên", "Titan Xanh"],
          },
          { name: "Bộ nhớ", variants: ["256GB", "512GB", "1TB"] },
        ],
        gallery: [
          { id: 1, url: product.img.split(";")[0] },
          {
            id: 2,
            url:
              PRODUCTS.find((p) => p.id === 2)?.img.split(";")[0] ||
              product.img.split(";")[0],
          },
          {
            id: 3,
            url:
              PRODUCTS.find((p) => p.id === 5)?.img.split(";")[0] ||
              product.img.split(";")[0],
          },
        ],
      };

      setProductData(extendedProduct);

      // Reset states
      setMainImage(extendedProduct.gallery[0].url);
      setSelectedOptions({});
      setActiveTab("description");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setProductData(null);
    }
  }, [currentProductId]);

  // Handlers
  const handleOptionSelect = (optionName, variant) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: variant }));
  };

  // 3. Sửa hàm này để nhận quantity từ con
  const handleAddToCart = (quantity) => {
    if (
      productData.options.length > 0 &&
      Object.keys(selectedOptions).length < productData.options.length
    ) {
      toast.error(
        "Vui lòng chọn đầy đủ các tùy chọn (Màu sắc, Bộ nhớ) trước khi thêm vào giỏ."
      );
      return;
    }

    const selectedVariant =
      productData.options.length > 0
        ? ` (${Object.values(selectedOptions).join(", ")})`
        : "";

    // 4. Gọi hàm addToCart thật từ Context với số lượng đã chọn
    addToCart(productData, quantity);

    toast.success(
      <div className="flex items-center">
        <ShoppingBag className="w-5 h-5 mr-3 text-green-600" />
        Đã thêm **{productData.name}
        {selectedVariant}** (SL: {quantity}) vào giỏ hàng!
      </div>,
      {
        action: {
          label: "Xem giỏ hàng",
          onClick: () => navigate("/cart"),
        },
        duration: 4000,
      }
    );
  };

  // Render Loading/Error
  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-red-500">
          404 - Không tìm thấy sản phẩm.
        </h1>
      </div>
    );
  }

  // Data cho Related Products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === productData.category && p.id !== currentProductId
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-10 rounded-lg">
      <div className="container mx-auto max-w-7xl">
        <ProductBreadcrumb
          category={productData.category}
          name={productData.name}
        />

        <div className="bg-white shadow-xl rounded-t-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ProductGallery
            gallery={productData.gallery}
            mainImage={mainImage}
            setMainImage={setMainImage}
            productName={productData.name}
          />

          <ProductInfo
            product={productData}
            selectedOptions={selectedOptions}
            handleOptionSelect={handleOptionSelect}
            handleAddToCart={handleAddToCart} // Truyền prop xuống
          />
        </div>

        <ProductTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          description={productData.description}
          reviewsCount={productData.reviewsCount}
        />

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sản phẩm tương tự
            </h2>
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
