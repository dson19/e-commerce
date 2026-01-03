import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";

const handleCassoWebhook = asyncHandler(async (req, res) => {
    const secure_token = req.headers['secure-token'];
    if (secure_token !== process.env.CASSO_SECURE_TOKEN){
        return res.status(401).json({ message: "Unauthorized" });  
    }
    const {data} = req.body;
    if (!data || data.length ===0){
        return res.status(200).json({message: "No data"});
    }
    for (const transaction of data){
        const {description , amount} = transaction;
        const match = description.match(/OrderID(\d+)/i);
        if (match){
            const orderId = match[1];
            const order = await Order.getOrderByIdNoUserId(orderId);
            if (order){
                if (order.status === 'paid'){
                    console.log(`Order is already paid.`);
                    continue;
                }
            const expectedAmount = parseFloat(order.grand_total);
            const receivedAmount = parseFloat(amount);
            if (expectedAmount === receivedAmount){
                await Order.updateOrderStatusToPaid(orderId);
                console.log(`Order ${orderId} marked as paid.`);
            }
            else if (expectedAmount < receivedAmount){
                await Order.updateOrderStatusToPaid(orderId);
                console.log(`Order ${orderId} marked as paid with overpayment.`);
            }
            else {
                console.log(`Payment amount ${receivedAmount} is less than expected ${expectedAmount} for Order ${orderId}.`);
            }
        }
        else {
            console.log(`Order with ID ${orderId} not found.`);
        }
        }
        else {
            console.log(`No OrderID found in description: ${description}`);
        }
    }
    return res.status(200).json({message: "Webhook processed" });
});

export default { handleCassoWebhook };