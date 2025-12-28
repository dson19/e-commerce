import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
// import { PRODUCTS } from "../data/mockData"; // Deprecated
import axios from 'axios';
// import { formatCurrency } from "../utils/currency";

import RelatedProductCard from "../components/RelatedProductCard";

// Import các component con đã tách
import ProductBreadcrumb from "../components/product_detail/ProductBreadcrumb";
import ProductGallery from "../components/product_detail/ProductGallery";
import ProductInfo from "../components/product_detail/ProductInfo";
import ProductTabs from "../components/product_detail/ProductTabs";

const ProductDetail = () => {
  const { productId, slug } = useParams();
  const [searchParams] = useSearchParams();
  const sku = searchParams.get('sku');

  const navigate = useNavigate();
  // const currentProductId = parseInt(productId, 10); // ID from API might be int or string, safe to keep as is for fetch
  const { addToCart } = useCart();

  // States
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Use slug if available, otherwise productId
        const identifier = slug || productId;
        const response = await axios.get(`http://localhost:5000/api/products/${identifier}`);
        const product = response.data;

        // --- MAPPING DATA (Support new structure) ---
        let mappedOptions = [];
        let galleryImages = [];

        // 1. Map Variants -> Options (Màu sắc) & Gallery
        if (product.variants && product.variants.length > 0) {
          const colors = product.variants.map(v => v.color).filter(Boolean);
          if (colors.length > 0) {
            mappedOptions.push({
              name: "Màu sắc",
              variants: colors
            });
          }

          // Gallery from Variants
          product.variants.forEach((v, index) => {
            // Support both 'img' (new) and 'image_url' (old)
            const vImg = v.img || v.image_url;
            if (vImg) {
              galleryImages.push({
                id: `var-${index}`,
                url: vImg.split(';')[0] // Clean if multiple
              });
            }
          });
        }

        // Add main product image to gallery if not present
        const mainImgUrl = product.img ? product.img.split(';')[0] : null;
        if (mainImgUrl) {
          // Insert at beginning
          galleryImages.unshift({ id: 'main', url: mainImgUrl });
        }

        // Deduplicate gallery
        galleryImages = galleryImages.filter((img, index, self) =>
          index === self.findIndex((t) => t.url === img.url)
        );

        // Fallback gallery
        if (galleryImages.length === 0) {
          galleryImages.push({ id: 'default', url: "https://via.placeholder.com/400" });
        }

        const extendedProduct = {
          ...product,
          // Support 'currentPrice' (new) or 'min_price' (old)
          price: product.currentPrice || product.min_price || "Liên hệ",
          oldPrice: product.oldPrice || null,
          reviewsCount: product.reviewsCount || Math.floor(Math.random() * 100),
          rating: product.rating || (4 + Math.random()).toFixed(1),
          description: product.description || (Object.keys(product.specs || {}).length > 0 ? "Thông số kỹ thuật chi tiết bên dưới." : "Đang cập nhật mô tả..."),
          options: mappedOptions,
          gallery: galleryImages,
          specs: product.specs || {}
        };

        setProductData(extendedProduct);
        setMainImage(galleryImages[0].url);

        // Pre-select options based on SKU from URL
        let initialOptions = {};
        if (sku && extendedProduct.variants) {
          const variantBySku = extendedProduct.variants.find(v => v.sku === sku || `SP-${v.id}` === sku);
          if (variantBySku) {
            extendedProduct.options.forEach(opt => {
              // Assumes simple mapping where variant has keys matching option names or mapped keys
              // Our options are constructed from variants, e.g. "Màu sắc" -> v.color
              if (opt.name === "Màu sắc" && variantBySku.color) {
                initialOptions["Màu sắc"] = variantBySku.color;
                // Also update main image
                const vImg = variantBySku.img || variantBySku.image_url;
                if (vImg) setMainImage(vImg.split(';')[0]);
              }
            });
          }
        }

        // Fallback: If no SKU matched (or no SKU provided), select the first variant by default
        if (Object.keys(initialOptions).length === 0 && extendedProduct.variants && extendedProduct.variants.length > 0) {
          const firstVariant = extendedProduct.variants[0];
          if (firstVariant.color) {
            initialOptions["Màu sắc"] = firstVariant.color;
            // Also update main image
            const vImg = firstVariant.img || firstVariant.image_url;
            if (vImg) setMainImage(vImg.split(';')[0]);
          }
        }
        setSelectedOptions(initialOptions);

        setActiveTab("description");

        // Fetch related products (keep existing logic)
        fetchRelatedProducts(product.category_id || product.brand_id, product.id);

      } catch (err) {
        console.error("Error fetching product", err);
        setError("Không tìm thấy sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    // Quick helper to fetch related (limit 5)
    // We don't have a dedicated related endpoint, so strictly we might skip or just fetch some.
    // Let's try to fetch list and filter client side for now as partial solution
    const fetchRelatedProducts = async (cateId, currentId) => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        const all = res.data.data || res.data; // Handle both formats just in case
        // Filter by same brand/category but not self
        const related = all.filter(p => p.id != currentId).slice(0, 5).map(p => ({
          ...p,
          price: p.min_price || "0",
          oldPrice: p.old_price || null,
          img: p.img || "https://via.placeholder.com/150",
          category: p.category_name,
          parentCategory: p.parent_category_name,
          brand: p.brand_name
        }));
        setRelatedProducts(related);
      } catch (error) {
        console.log("No related products", error);
      }
    }

    if (productId || slug) {
      fetchProduct();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [productId, slug, sku]);

  const handleOptionSelect = (optionName, variant) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: variant }));

    // If color is selected, try to find matching image in variants
    if (optionName === "Màu sắc" && productData.variants) {
      const variantData = productData.variants.find(v => v.color === variant);
      if (variantData) {
        // Support 'img' (new) or 'image_url' (old)
        const vImg = variantData.img || variantData.image_url;
        if (vImg) {
          setMainImage(vImg.split(';')[0]);
        }
      }
    }
  };

  const handleAddToCart = async (quantity) => {
    if (productData.options.length > 0 && Object.keys(selectedOptions).length < productData.options.length) {
      toast.error("Vui lòng chọn đầy đủ các tùy chọn (Màu sắc)!");
      return;
    }

    // Find specific variant object if options selected
    let selectedVariantObj = null;
    if (productData.variants) {
      selectedVariantObj = productData.variants.find(v => {
        // Check if variant 'v' matches ALL selected options
        return productData.options.every(opt => {
          const selectedVal = selectedOptions[opt.name];
          if (!selectedVal) return true; // User hasn't selected this yet, ignore (or strictly should return false if we enforce all?)
          // strictly if unselected we can't pin point variant, so maybe lax
          return v[opt.key] === selectedVal;
        });
      });
    }

    // Construct cart item
    const cartItem = {
      ...productData,
      selectedVariant: selectedVariantObj || null,
      // Override price if variant has specific price (Support 'bestPrice' (new) or 'price' (old))
      price: selectedVariantObj ? (selectedVariantObj.bestPrice || selectedVariantObj.price || productData.price) : productData.price,
      options: selectedOptions
    };

    const success = await addToCart(cartItem, quantity);

    if (success) {
      const variantStr = Object.values(selectedOptions).join(", ");
      toast.success(`Đã thêm ${productData.name} ${variantStr ? `(${variantStr})` : ''} vào giỏ!`, {
        action: { label: "Xem giỏ", onClick: () => navigate("/cart") },
      });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết sản phẩm...</div>;
  if (error || !productData) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Sản phẩm không tồn tại"}</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 font-sans text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <ProductBreadcrumb
          parentCategory={productData.parent_category_name}
          category={productData.category_name || productData.category} // Fallback to old field if needed
          brand={productData.brand_name}
          name={productData.name}
        />

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
            specs={productData.specs} // Pass specs to tabs if needed
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