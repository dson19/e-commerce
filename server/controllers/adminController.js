import asyncHandler from 'express-async-handler';

export const getDashboardStats = asyncHandler(async (req, res) => {
    // Giả vờ đợi 1 giây cho giống mạng thật (Optional)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Trả về dữ liệu giả thay vì query Database
    res.json({
        success: true,
        data: {
            usersCount: 125,        // Giả vờ có 125 user
            ordersCount: 48,        // Giả vờ có 48 đơn
            revenue: 50000000,      // Giả vờ doanh thu 50 triệu
            recentOrders: []        // Mảng rỗng
        }
    });
});