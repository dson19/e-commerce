import Cart from '../models/Cart.js';
import User from '../models/User.js';
import pool from '../config/db.js';

const testCartModel = async () => {
    try {
        // 1. Get a user or create one
        let user = await User.findByEmail('test@example.com');
        if (!user) {
            user = await User.create('test@example.com', 'Test User', 'password123', 'Male', '0123456789');
        }
        const userId = user.user_id;
        console.log("Testing with User ID:", userId);

        // 2. Clear cart first
        await Cart.clearCart(userId);
        console.log("Cart cleared.");

        // 3. Add item (Product ID 1 - Assuming it exists, if not this might fail FK constraint. 
        // We need a valid product ID. Let's assume 1 exists or create a dummy product if possible.
        // For now, let's try assuming product_id=1 exists.)
        // ERROR HANDLING: If product 1 doesn't exist, this fails. 
        // Let's check products first? No simple model for Product yet?
        // We will just try and catch.
        
        try {
             const added = await Cart.addToCart(userId, 1, 2);
             console.log("Added item:", added);
        } catch (e) {
            console.log("Could not add item (maybe product id 1 missing?):", e.message);
        }

        // 4. Get Cart
        const cart = await Cart.getCart(userId);
        console.log("Cart contents:", cart);

        // 5. Update Quantity
        if (cart.length > 0) {
            const updated = await Cart.updateQuantity(userId, 1, 5);
            console.log("Updated quantity:", updated);
        }

        // 6. Remove Item
        await Cart.removeFromCart(userId, 1);
        console.log("Removed item.");

        const finalCart = await Cart.getCart(userId);
        console.log("Final Cart:", finalCart);

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        pool.end();
    }
};

testCartModel();
