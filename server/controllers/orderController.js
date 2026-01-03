import asyncHandler from "../utils/asyncHandler.js";
import { ErrorResponse } from "../middleware/errorMiddleware.js";
import Order from "../models/Order.js";

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { items, address_id, paymentMethod, phone_number, name} = req.body;
    if (!items || items.length === 0) {
        throw new ErrorResponse("Giỏ hàng trống", 400);
    }
    const order = await Order.createOrder(userId, items, address_id, paymentMethod, phone_number, name);
    res.status(201).json({
        success: true,
        data: order
    });
});
const getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const order = await Order.getOrderById(userId, orderId);
    if (!order) {
        throw new ErrorResponse("Đơn hàng không tồn tại", 404);
    }
    res.status(200).json({
        success: true,
        data: order
    });
});
const getUserOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orders = await Order.getUserOrderHistory(userId);
    res.status(200).json({
        success: true,
        data: orders
    });
});
export default { createOrder, getOrderById, getUserOrderHistory };