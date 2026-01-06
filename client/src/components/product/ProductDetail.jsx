import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productService } from "../../services/api";

import RelatedProductCard from "./RelatedProductCard";

// Import các component con đã tách
import ProductBreadcrumb from "./detail/ProductBreadcrumb";
import ProductGallery from "./detail/ProductGallery";
import ProductInfo from "./detail/ProductInfo";
import ProductTabs from "./detail/ProductTabs";

const ProductDetail = () => {
  const { productId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sku = searchParams.get('sku');

  const navigate = useNavigate();
  // const currentProductId = parseInt(productId, 10); // ID from API might be int or string, safe to keep as is for fetch
  const { addToCart } = useCart();

  // States
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // 1. Fetch Data Effect (Runs only on ID/Slug change)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Use slug if available, otherwise productId
        const identifier = slug || productId;
        const response = await productService.getProduct(identifier);
        const product = response.data.data;

        // --- MAPPING DATA (Support new structure) ---
        let mappedOptions = [];
        let galleryImages = [];

        // 1. Map Variants -> Options (Màu sắc) & Gallery
        if (product.variants && product.variants.length > 0) {
          // Color Option
          const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
          if (colors.length > 0) {
            mappedOptions.push({
              name: "Màu sắc",
              variants: colors,
              key: 'color'
            });
          }

          // Storage (ROM) Option
          const roms = [...new Set(product.variants.map(v => v.rom).filter(Boolean))];
          if (roms.length > 0) {
            // Sort ROMs numerically if possible (e.g. 128GB < 256GB)
            roms.sort((a, b) => parseInt(a) - parseInt(b));
            mappedOptions.push({
              name: "Dung lượng",
              variants: roms,
              key: 'rom'
            });
          }

          // RAM Option
          const rams = [...new Set(product.variants.map(v => v.ram).filter(Boolean))];
          if (rams.length > 0) {
            rams.sort((a, b) => parseInt(a) - parseInt(b));
            mappedOptions.push({
              name: "RAM",
              variants: rams,
              key: 'ram'
            });
          }

          // Gallery from Variants
          product.variants.forEach((v, index) => {
            // Support both 'img' (new) and 'image_url' (old)
            const vImg = v.img || v.image_url;
            if (vImg) {
              galleryImages.push({
                id: `var-${index}`,
                url: vImg.split(';')[0], // Clean if multiple
                color: v.color // Attach color for syncing
              });
            }
          });
        }

        // Add main product image to gallery if not present
        const mainImgUrl = product.img ? product.img.split(';')[0] : null;
        if (mainImgUrl) {
          // Check if this image matches any variant to retrieve color
          const matchingVariant = product.variants.find(v => {
            const vUrl = v.img || v.image_url;
            return vUrl && vUrl.split(';')[0] === mainImgUrl;
          });

          // Insert at beginning
          galleryImages.unshift({
            id: 'main',
            url: mainImgUrl,
            color: matchingVariant ? matchingVariant.color : null
          });
        }

        // Deduplicate gallery
        const myUniqueGallery = [];
        const seenUrls = new Set();

        galleryImages.forEach(img => {
          if (!seenUrls.has(img.url)) {
            seenUrls.add(img.url);
            myUniqueGallery.push(img);
          } else {
            // If we've seen this URL, check if the NEW item has a color but the EXISTING one doesn't
            const existingIndex = myUniqueGallery.findIndex(g => g.url === img.url);
            if (existingIndex !== -1 && !myUniqueGallery[existingIndex].color && img.color) {
              myUniqueGallery[existingIndex].color = img.color;
            }
          }
        });
        galleryImages = myUniqueGallery;

        // Fallback gallery
        if (galleryImages.length === 0) {
          galleryImages.push({ id: 'default', url: "https://via.placeholder.com/400" });
        }

        const extendedProduct = {
          ...product,
          // Support 'currentPrice' (new) or 'min_price' (old)
          price: product.currentPrice || product.min_price || "Liên hệ",
          oldPrice: product.oldPrice || null,
          reviewsCount: product.reviewsCount || 0,
          rating: product.rating || (4 + Math.random()).toFixed(1),
          options: mappedOptions,
          gallery: galleryImages,
          specs: product.specs || {}
        };

        setProductData(extendedProduct);
        setMainImage(galleryImages[0].url);

        // Fallback: If no SKU provided, select the variant that matches the main image, otherwise the first variant
        if (extendedProduct.variants && extendedProduct.variants.length > 0) {
          let defaultVariant = extendedProduct.variants[0];

          // Try to find variant matching the main image
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
    const fetchRelatedProducts = async (cateId, currentId) => {
      try {
        const res = await productService.getProducts();
        const all = res.data.data;
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
  }, [productId, slug]); // Only fetch data on ID/Slug change

  // 2. SKU Sync Effect (URL -> Options)
  useEffect(() => {
    if (!productData || !sku) return;

    // Find variant by SKU
    // Match by sku field OR by id pattern if we used that (SP-ID)
    let variantBySku = productData.variants?.find(v => v.sku === sku || `SP-${v.id}` === sku);

    if (variantBySku) {
      const newOptions = {};

      // Map variant props to options
      productData.options.forEach(opt => {
        const key = opt.key || 'color';
        if (variantBySku[key]) {
          newOptions[opt.name] = variantBySku[key];
        }
      });

      // Only update if different to avoid loop/re-render
      // Simple JSON stringify comparison for flat objects
      if (JSON.stringify(newOptions) !== JSON.stringify(selectedOptions)) {
        setSelectedOptions(newOptions);

        // Also update image
        const vImg = variantBySku.img || variantBySku.image_url;
        if (vImg) setMainImage(vImg.split(';')[0]);
      }
    }
  }, [sku, productData]); // Run when SKU or Data changes

  // 3. Option Sync Effect (Selection -> URL)
  useEffect(() => {
    // Wait until productData is loaded and options are selected
    if (!productData || !productData.variants || Object.keys(selectedOptions).length === 0) return;

    // Find variant matching ALL current selectedOptions
    const matchedVariant = productData.variants.find(v => {
      return productData.options.every(opt => {
        const selectedVal = selectedOptions[opt.name];
        if (!selectedVal) return true; // Loose match? Or strict? 

        const key = opt.key || 'color';
        return v[key] == selectedVal;
      });
    });

    // If we found a specific variant AND it's different from current SKU in URL
    if (matchedVariant) {
      const variantSku = matchedVariant.sku || `SP-${matchedVariant.id}`;
      // Only update if URL is different
      if (variantSku !== sku) {
        // Update URL without reloading state (replace: true creates new history entry or replaces current)
        setSearchParams({ sku: variantSku }, { replace: true });
      }
    }
  }, [selectedOptions, productData]); // Run when options change

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

  const handleGalleryImageSelect = (imgObj) => {
    setMainImage(imgObj.url);
    if (imgObj.color) {
      handleOptionSelect("Màu sắc", imgObj.color);
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
          if (!selectedVal) return true;

          // Match by key if exists, otherwise fallback to color property
          const key = opt.key || 'color';
          return v[key] === selectedVal;
        });
      });
    }

    // Construct cart item
    const cartItem = {
      ...productData,
      variant_id: selectedVariantObj?.id || selectedVariantObj?.variant_id || productData.id,
      selectedVariant: selectedVariantObj || null,
      // Override price if variant has specific price
      price: selectedVariantObj ? (selectedVariantObj.bestPrice || selectedVariantObj.price || productData.price) : productData.price,
      // Override image if variant has specific image
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
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviewsCount={productData.reviewsCount}
            specs={productData.specs} // Pass specs to tabs if needed
            productId={productData.id}
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