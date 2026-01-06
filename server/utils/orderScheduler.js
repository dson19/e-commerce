import pool from '../config/db.js';
import Order from '../models/Order.js';

const startOrderCleanupTask = () => {
    // Run every minute (60 * 1000 ms)
    setInterval(async () => {
        try {
            // Find pending orders older than 10 minutes
            // Note: Postgres stores dates in UTC usually, but ensure server time is synced.
            // interval '10 minutes' adapts to DB clock.
            const query = `
                SELECT order_id 
                FROM orders 
                WHERE status = 'Pending' 
                AND order_date < NOW() - INTERVAL '10 minutes'
           `;

            const result = await pool.query(query);
            const expiredOrders = result.rows;

            if (expiredOrders.length > 0) {
                console.log(`[Scheduler] Tìm thấy ${expiredOrders.length} đơn hàng quá hạn. Đang hủy...`);

                for (const order of expiredOrders) {
                    try {
                        await Order.cancelOrder(order.order_id);
                        console.log(`[Scheduler] Đã hủy đơn hàng #${order.order_id}`);
                    } catch (err) {
                        console.error(`[Scheduler] Lỗi khi hủy đơn #${order.order_id}:`, err.message);
                    }
                }
            }

        } catch (error) {
            console.error('[Scheduler] Lỗi trong quá trình quét đơn hàng:', error);
        }
    }, 60 * 1000);

    console.log('[Scheduler] Đã khởi động trình quét đơn hàng quá hạn (10p).');
};

export default startOrderCleanupTask;
