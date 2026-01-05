import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrderThunk } from '@/redux/orderSlice';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export const useCheckout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { loading: orderLoading } = useSelector((state) =>state.order);

    const handleCheckout = async (selectedAddress) => {
        if (!selectedAddress) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            toast.error('Giỏ hàng của bạn đang trống');
            return;
        }

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    variant_id: item.variant_id || item.id, // Ensure we use variant_id
                    quantity: item.quantity
                })),
                address_id: selectedAddress.address_id,
                paymentMethod: 'Thanh toán khi nhận hàng', // Currently hardcoded as per previous code
                phone_number: selectedAddress.phone,
                name: selectedAddress.name
            };

            const resultAction = await dispatch(createOrderThunk(orderData)).unwrap();
            toast.success('Tạo đơn hàng thành công');

            // Clear cart
            await clearCart();

            // Navigate to success page
            navigate(`/checkout/success/${resultAction.order_id}`);
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra khi tạo đơn hàng');
        }
    };

    return {
        handleCheckout,
        orderLoading
    };
};
