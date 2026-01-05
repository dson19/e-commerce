import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export const useCheckout = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [orderLoading, setOrderLoading] = useState(false);

    const handleCheckout = async (selectedAddress) => {
        if (!selectedAddress) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            toast.error('Giỏ hàng của bạn đang trống');
            return;
        }

        setOrderLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    variant_id: item.variant_id || item.id,
                    quantity: item.quantity
                })),
                address_id: selectedAddress.address_id,
                paymentMethod: 'COD', // Changed to COD as per previous context preferences
                phone_number: selectedAddress.phone,
                name: selectedAddress.name
            };

            const res = await orderService.createOrder(orderData);

            if (res.data.success) {
                toast.success('Tạo đơn hàng thành công');
                await clearCart();
                navigate(`/checkout/success/${res.data.order_id || res.data.data.order_id}`);
            } else {
                toast.error(res.data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
            toast.error(msg);
        } finally {
            setOrderLoading(false);
        }
    };

    return {
        handleCheckout,
        orderLoading
    };
};
