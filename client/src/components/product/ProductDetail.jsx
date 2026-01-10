import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { productService, reviewService } from "../../services/api"; 

import RelatedProductCard from "./RelatedProductCard";
import ProductBreadcrumb from "./detail/ProductBreadcrumb";
import ProductGallery from "./detail/ProductGallery";
import ProductInfo from "./detail/ProductInfo";
import ProductTabs from "./detail/ProductTabs";

const ProductDetail = () => {
  const { productId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sku = searchParams.get('sku');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  // 3. Hàm fetch reviews riêng biệt để tái sử dụng (truyền xuống con)
  const refreshReviews = async (idToFetch) => {
    // Nếu không truyền ID, thử lấy từ productData hiện tại
    const targetId = idToFetch || productData?.id;
    if (!targetId) return;

    try {
      const res = await reviewService.getReviews(targetId);
      if (res.data.success) {
        setReviewsList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to refresh reviews", err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const identifier = slug || productId;
        const response = await productService.getProduct(identifier);
        const product = response.data.data;

        try {
           const reviewRes = await reviewService.getReviews(product.id);
           if (reviewRes.data.success) {
             setReviewsList(reviewRes.data.data);
           }
        } catch (reviewErr) {
           console.error("Error fetching initial reviews", reviewErr);
        }

        let mappedOptions = [];
        let galleryImages = [];

        if (product.variants && product.variants.length > 0) {
          const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
          if (colors.length > 0) {
            mappedOptions.push({ name: "Màu sắc", variants: colors, key: 'color' });
          }
          const roms = [...new Set(product.variants.map(v => v.rom).filter(Boolean))];
          if (roms.length > 0) {
            roms.sort((a, b) => parseInt(a) - parseInt(b));
            mappedOptions.push({ name: "Dung lượng", variants: roms, key: 'rom' });
          }
          const rams = [...new Set(product.variants.map(v => v.ram).filter(Boolean))];
          if (rams.length > 0) {
            rams.sort((a, b) => parseInt(a) - parseInt(b));
            mappedOptions.push({ name: "RAM", variants: rams, key: 'ram' });
          }
          product.variants.forEach((v, index) => {
            const vImg = v.img || v.image_url;
            if (vImg) {
              galleryImages.push({
                id: `var-${index}`,
                url: vImg.split(';')[0],
                color: v.color
              });
            }
          });
        }

        const mainImgUrl = product.img ? product.img.split(';')[0] : null;
        if (mainImgUrl) {
          const matchingVariant = product.variants.find(v => {
            const vUrl = v.img || v.image_url;
            return vUrl && vUrl.split(';')[0] === mainImgUrl;
          });
          galleryImages.unshift({
            id: 'main',
            url: mainImgUrl,
            color: matchingVariant ? matchingVariant.color : null
          });
        }

        const myUniqueGallery = [];
        const seenUrls = new Set();
        galleryImages.forEach(img => {
          if (!seenUrls.has(img.url)) {
            seenUrls.add(img.url);
            myUniqueGallery.push(img);
          } else {
            const existingIndex = myUniqueGallery.findIndex(g => g.url === img.url);
            if (existingIndex !== -1 && !myUniqueGallery[existingIndex].color && img.color) {
              myUniqueGallery[existingIndex].color = img.color;
            }
          }
        });
        galleryImages = myUniqueGallery;

        if (galleryImages.length === 0) {
          galleryImages.push({ id: 'default', url: "https://via.placeholder.com/400" });
        }

        const extendedProduct = {
          ...product,
          price: product.currentPrice || product.min_price || "Liên hệ",
          oldPrice: product.oldPrice || null,
          rating: product.rating || 5, // Có thể tính lại từ reviewsList nếu muốn
          options: mappedOptions,
          gallery: galleryImages,
          specs: product.specs || {}
        };

        setProductData(extendedProduct);
        setMainImage(galleryImages[0].url);

        if (extendedProduct.variants && extendedProduct.variants.length > 0) {
          let defaultVariant = extendedProduct.variants[0];
          const mainImg = product.img ? product.img.split(';')[0] : null;
          if (mainImg) {
            const match = extendedProduct.variants.find(v => {
              const vImg = v.img || v.image_url;
              return vImg && vImg.split(';')[0] === mainImg;
            });
            if (match) defaultVariant = match;
          }

          let initialOptions = {};
          extendedProduct.options.forEach(opt => {
            const key = opt.key;
            if (defaultVariant[key]) {
              initialOptions[opt.name] = defaultVariant[key];
            }
          });

          if (defaultVariant.color) {
            const vImg = defaultVariant.img || defaultVariant.image_url;
            if (vImg) setMainImage(vImg.split(';')[0]);
          }
          setSelectedOptions(initialOptions);
        }

        setActiveTab("specs");
        fetchRelatedProducts(product.category_id || product.brand_id, product.id);

      } catch (err) {
        console.error("Error fetching product", err);
        setError("Không tìm thấy sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (cateId, currentId) => {
      try {
        const res = await productService.getProducts();
        const all = res.data.data;
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
  }, [productId, slug]);

  useEffect(() => {
    if (!productData || !sku) return;
    let variantBySku = productData.variants?.find(v => v.sku === sku || `SP-${v.id}` === sku);

    if (variantBySku) {
      const newOptions = {};
      productData.options.forEach(opt => {
        const key = opt.key || 'color';
        if (variantBySku[key]) {
          newOptions[opt.name] = variantBySku[key];
        }
      });
      if (JSON.stringify(newOptions) !== JSON.stringify(selectedOptions)) {
        setSelectedOptions(newOptions);
        const vImg = variantBySku.img || variantBySku.image_url;
        if (vImg) setMainImage(vImg.split(';')[0]);
      }
    }
  }, [sku, productData]);

  useEffect(() => {
    if (!productData || !productData.variants || Object.keys(selectedOptions).length === 0) return;
    const matchedVariant = productData.variants.find(v => {
      return productData.options.every(opt => {
        const selectedVal = selectedOptions[opt.name];
        if (!selectedVal) return true;
        const key = opt.key || 'color';
        return v[key] == selectedVal;
      });
    });
    if (matchedVariant) {
      const variantSku = matchedVariant.sku || `SP-${matchedVariant.id}`;
      if (variantSku !== sku) {
        setSearchParams({ sku: variantSku }, { replace: true });
      }
    }
  }, [selectedOptions, productData]);

  const handleOptionSelect = (optionName, variant) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: variant }));
    if (optionName === "Màu sắc" && productData.variants) {
      const variantData = productData.variants.find(v => v.color === variant);
      if (variantData) {
        const vImg = variantData.img || variantData.image_url;
        if (vImg) {
          setMainImage(vImg.split(';')[0]);
        }
      }
    }
  };

  const handleGalleryImageSelect = (imgObj) => {
    setMainImage(imgObj.url);
    if (imgObj.color) {
      handleOptionSelect("Màu sắc", imgObj.color);
    }
  };

  const handleAddToCart = async (quantity) => {
    if (productData.options.length > 0 && Object.keys(selectedOptions).length < productData.options.length) {
      toast.error("Vui lòng chọn đầy đủ các tùy chọn!");
      return;
    }
    let selectedVariantObj = null;
    if (productData.variants) {
      selectedVariantObj = productData.variants.find(v => {
        return productData.options.every(opt => {
          const selectedVal = selectedOptions[opt.name];
          if (!selectedVal) return true;
          const key = opt.key || 'color';
          return v[key] === selectedVal;
        });
      });
    }
    const cartItem = {
      ...productData,
      variant_id: selectedVariantObj?.id || selectedVariantObj?.variant_id || productData.id,
      selectedVariant: selectedVariantObj || null,
      price: selectedVariantObj ? (selectedVariantObj.bestPrice || selectedVariantObj.price || productData.price) : productData.price,
      img: selectedVariantObj ? (selectedVariantObj.img || selectedVariantObj.image_url || productData.img) : productData.img,
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
        <ProductBreadcrumb
          parentCategory={productData.parent_category_name}
          category={productData.category_name || productData.category}
          brand={productData.brand_name}
          name={productData.name}
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <ProductGallery
                gallery={productData.gallery}
                mainImage={mainImage}
                setMainImage={setMainImage}
                onImageSelect={handleGalleryImageSelect}
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
          {/* 4. Truyền Reviews và hàm Refresh xuống Tabs */}
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviewsCount={reviewsList.length} // Lấy độ dài mảng reviews thực tế
            specs={productData.specs}
            productId={productData.id}
            
            // Props mới
            reviews={reviewsList}
            onReviewChange={() => refreshReviews(productData.id)}
          />
        </div>

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