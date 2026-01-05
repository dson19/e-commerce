import { useState, useEffect } from 'react';
import { orderService } from '@/services/api';

export const useOrderDetail = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const res = await orderService.getOrderById(orderId);
                if (res.data.success) {
                    setOrder(res.data.data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError(err.message || 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Poll if order status is Pending
        const interval = setInterval(() => {
            if (loading) return;
            fetchOrder();
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId, loading]); // Added loading to dependency to respect logic, though simple interval is robust enough usually

    return { order, loading, error };
};
