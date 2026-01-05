import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrderDetail';
import PaymentPendingSection from '@/components/checkout/PaymentPendingSection';
import OrderItemsList from '@/components/checkout/OrderItemsList';
import ShippingInfo from '@/components/checkout/ShippingInfo';

const CheckoutSuccessPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const res = await orderService.getOrderById(orderId);
                if (res.data.success) {
                    setOrder(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Đang cập nhật...';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Đang cập nhật...';
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004535] mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!order || error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
                <p className="text-gray-500 mb-8 max-w-md">Chúng tôi không thể tìm thấy thông tin cho mã đơn hàng này. Vui lòng kiểm tra lại trong lịch sử đơn hàng.</p>
                <Link to="/profile/orders" className="bg-[#004535] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003528] transition-all">
                    Xem lịch sử đơn hàng
                </Link>
            </div>
        );
    }

    const isPendingPayment = order.payment_method === 'VIETQR' && (order.status === 'Pending' || order.status === 'pending');

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            {/* Page Header */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
                {isPendingPayment ? (
                    <>
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-6 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Đơn hàng đang chờ thanh toán!</h1>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            Vui lòng quét mã QR dưới đây để hoàn tất thanh toán cho đơn hàng <span className="font-bold text-[#004535]">#{orderId}</span>.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Đặt hàng thành công!</h1>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            Cảm ơn bạn đã tin tưởng mua sắm tại MobileStore. Đơn hàng <span className="font-bold text-[#004535]">#{orderId}</span> của bạn đã được tiếp nhận và đang được xử lý.
                        </p>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details & Payment Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* VIETQR Payment Section */}
                    {isPendingPayment && <PaymentPendingSection order={order} />}

                    {/* Items List */}
                    <OrderItemsList order={order} isPendingPayment={isPendingPayment} />

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/" className="flex-1 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                            {isPendingPayment ? 'Mua thêm sản phẩm khác' : 'Tiếp tục mua sắm'}
                        </Link>
                        <Link to="/profile/orders" className={`flex-1 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isPendingPayment ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-[#004535] hover:bg-[#003528] shadow-[#004535]/20'}`}>
                            {isPendingPayment ? (
                                <>Kiểm tra trạng thái <ArrowRight size={18} /></>
                            ) : (
                                <>Theo dõi đơn hàng <ArrowRight size={18} /></>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Info Sidebar */}
                <ShippingInfo order={order} />
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
