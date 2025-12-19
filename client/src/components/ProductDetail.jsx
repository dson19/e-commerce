// ProductDetail.jsx
import React, { useState, useEffect } from 'react'; // <-- Đã thêm useEffect
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner'; // Cần cài đặt sonner
import { PRODUCTS } from '../data/mockData'; 
import RelatedProductCard from '../components/RelatedProductCard';
import { Button } from "@/components/ui/button"; 
import { Star, Truck, Shield, ShoppingBag, CreditCard } from 'lucide-react';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const currentProductId = parseInt(productId, 10);

    // Khai báo State
    const [productData, setProductData] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [selectedOptions, setSelectedOptions] = useState({});

    // --- LOGIC: TẢI VÀ RESET DỮ LIỆU KHI ID THAY ĐỔI (QUAN TRỌNG) ---
    useEffect(() => {
        const product = PRODUCTS.find(p => p.id === currentProductId);

        if (product) {
            // Giả định dữ liệu mở rộng cho UI (Bạn có thể chuyển logic này ra ngoài)
            const extendedProduct = {
                ...product,
                reviewsCount: 45,
                rating: 5,
                description: "Đây là mô tả chi tiết của sản phẩm. Ví dụ: iPhone 15 Pro Max được chế tạo từ Titanium chuẩn hàng không vũ trụ, cực kỳ bền bỉ và nhẹ. Chip A17 Pro mang lại hiệu năng đồ họa đột phá.",
                options: [
                    { name: "Màu sắc", variants: ["Titan Đen", "Titan Tự nhiên", "Titan Xanh"] },
                    { name: "Bộ nhớ", variants: ["256GB", "512GB", "1TB"] }
                ],
                gallery: [
                    { id: 1, url: product.img.split(';')[0] },
                    { id: 2, url: PRODUCTS.find(p => p.id === 2)?.img.split(';')[0] || product.img.split(';')[0] }, 
                    { id: 3, url: PRODUCTS.find(p => p.id === 5)?.img.split(';')[0] || product.img.split(';')[0] }, 
                ]
            };

            setProductData(extendedProduct);
            
            // 1. Reset States
            setMainImage(extendedProduct.gallery[0].url); // Đặt lại ảnh chính
            setSelectedOptions({}); // Xóa các tùy chọn đã chọn
            setActiveTab('description'); // Đặt lại về tab Mô tả

            // 2. Cuộn lên đầu trang
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setProductData(null);
        }

    }, [currentProductId]); // <-- Chạy lại khi tham số productId thay đổi

    // Xử lý khi không tìm thấy sản phẩm
    if (!productData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <h1 className="text-3xl font-bold text-red-500">404 - Không tìm thấy sản phẩm.</h1>
            </div>
        );
    }
    
    // Đã có dữ liệu sản phẩm mới
    const extendedProduct = productData;
    const relatedProducts = PRODUCTS
        .filter(p => p.category === extendedProduct.category && p.id !== currentProductId)
        .slice(0, 5);


    // --- HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG (SỬ DỤNG TOAST) ---
    const handleAddToCart = () => {
        if (extendedProduct.options.length > 0 && Object.keys(selectedOptions).length < extendedProduct.options.length) {
            toast.error("Vui lòng chọn đầy đủ các tùy chọn (Màu sắc, Bộ nhớ) trước khi thêm vào giỏ.");
            return;
        }

        const selectedVariant = extendedProduct.options.length > 0 ? ` (${Object.values(selectedOptions).join(', ')})` : '';

        toast.success(
            <div className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-3 text-green-600" />
                Đã thêm **{extendedProduct.name}{selectedVariant}** vào giỏ hàng!
            </div>,
            {
                action: {
                    label: 'Xem giỏ hàng',
                    onClick: () => navigate('/cart'),
                },
                duration: 4000, 
            }
        );
    };
    
    const handleOptionSelect = (optionName, variant) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: variant }));
    };

    const renderRating = (r) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < r ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 rounded-lg">
            <div className="container mx-auto max-w-7xl">
                
                {/* Breadcrumbs */}
                <div className="flex text-sm text-gray-500 mb-6 gap-4 pl-5">
                    <Link to="/" className="hover:text-primary">Trang chủ</Link> / 
                    <Link to={`/category/${extendedProduct.category}`} className="hover:text-primary">{extendedProduct.category.toUpperCase()}</Link> / 
                    <span className="font-semibold text-gray-800">{extendedProduct.name}</span>
                </div>

                {/* --- Product Hero Section (Áp dụng rounded-t-xl) --- */}
                <div className="bg-white shadow-xl rounded-t-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Cột trái: Gallery */}
                    <div>
                        {/* Ảnh chính (Áp dụng rounded-t-lg) */}
                        <div className="p-4 bg-gray-100 rounded-t-lg flex items-center justify-center h-[450px] mb-4">
                            <img src={mainImage} alt={extendedProduct.name} className="w-full h-full object-contain" />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {extendedProduct.gallery.map(img => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    alt="thumb"
                                    className={`w-20 h-20 object-contain p-1 border rounded-lg cursor-pointer transition-all ${mainImage === img.url ? 'border-primary shadow-md' : 'border-gray-200'}`}
                                    onClick={() => setMainImage(img.url)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Thông tin, Tùy chọn & CTA */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{extendedProduct.name}</h1>
                        
                        <div className="flex items-center space-x-2 mb-6 border-b pb-4 border-gray-100">
                            <div className="flex">{renderRating(extendedProduct.rating)}</div>
                            <span className="text-sm text-gray-600">({extendedProduct.reviewsCount} Đánh giá)</span>
                        </div>

                        {/* Giá */}
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-red-600 block">{extendedProduct.price}</span>
                            <span className="text-xl text-gray-400 line-through mr-3">{extendedProduct.oldPrice}</span>
                            <span className="text-lg font-semibold text-green-600">
                                ({extendedProduct.discount})
                            </span>
                        </div>

                        {/* Lựa chọn Phiên bản/Màu sắc */}
                        {extendedProduct.options.map(option => (
                            <div key={option.name} className="mb-6">
                                <p className="font-semibold mb-2">{option.name}: <span className="text-primary font-bold">{selectedOptions[option.name] || 'Chưa chọn'}</span></p>
                                <div className="flex flex-wrap gap-2">
                                    {option.variants.map(variant => (
                                        <button
                                            key={variant}
                                            onClick={() => handleOptionSelect(option.name, variant)}
                                            className={`px-4 py-2 border rounded-full text-sm transition-all ${
                                                selectedOptions[option.name] === variant
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Nút CTA */}
                        <div className="flex flex-col gap-3 mt-8">
                            <Button 
                                onClick={handleAddToCart}
                                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-colors shadow-lg"
                            >
                                <ShoppingBag className="w-5 h-5 mr-3" />
                                THÊM VÀO GIỎ HÀNG
                            </Button>
                        </div>
                        
                        {/* Trust Factors */}
                        <div className="space-y-3 pt-8 border-t border-gray-200 mt-8">
                            <div className="flex items-center space-x-3 text-gray-700">
                                <Truck className="w-5 h-5 text-green-500" />
                                <span>Miễn phí vận chuyển cho đơn hàng trên 5 triệu VNĐ</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-700">
                                <Shield className="w-5 h-5 text-green-500" />
                                <span>Bảo hành chính hãng 12 tháng</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-700">
                                <CreditCard className="w-5 h-5 text-green-500" />
                                <span>Thanh toán an toàn qua VNPAY, Momo, Visa/Mastercard</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section (Áp dụng rounded-b-xl nếu bạn muốn nó nối liền với Hero Section) */}
                <div className="mt-4 bg-white shadow-xl rounded-b-xl p-6 md:p-8"> {/* Đã thay mt-16 bằng mt-4 để nối */}
                    <div className="flex space-x-8 border-b border-gray-200 mb-6">
                        <TabButton name="Mô tả chi tiết" tabId="description" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton name="Thông số kỹ thuật" tabId="specs" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton name={`Đánh giá (${extendedProduct.reviewsCount})`} tabId="reviews" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    <div className="py-4 text-gray-700 leading-relaxed">
                        {activeTab === 'description' && (
                            <div>
                                <h3 className="text-xl font-bold mb-3">Thông tin chi tiết</h3>
                                <p>{extendedProduct.description}</p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <table className="w-full text-left border-collapse">
                                <tbody>
                                    <tr><th className="py-2 border-b">Màn hình</th><td className="py-2 border-b">Super Retina XDR, 6.7 inch</td></tr>
                                    <tr><th className="py-2 border-b">Chip</th><td className="py-2 border-b">A17 Pro</td></tr>
                                    <tr><th className="py-2 border-b">Camera sau</th><td className="py-2 border-b">48MP + 12MP + 12MP (Zoom quang 5x)</td></tr>
                                    <tr><th className="py-2">Pin</th><td className="py-2">Hỗ trợ sạc nhanh 27W</td></tr>
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'reviews' && (
                            <p>Đây là nơi hiển thị danh sách đánh giá của khách hàng.</p>
                        )}
                    </div>
                </div>

                {/* Sản phẩm liên quan */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm tương tự</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {relatedProducts.map(p => (
                                <RelatedProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ name, tabId, activeTab, setActiveTab }) => (
    <button
        className={`pb-3 text-lg font-medium transition-colors ${
            activeTab === tabId ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab(tabId)}
    >
        {name}
    </button>
);

export default ProductDetail;