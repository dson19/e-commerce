import Cart from '../models/Cart.js';

const getCart = async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cart", error: error.message });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity, variantId } = req.body;
    try {
        const item = await Cart.addToCart(req.userId, productId, quantity, variantId);
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to add to cart", error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    try {
        await Cart.removeFromCart(req.userId, productId);
        res.status(200).json({ message: "Item removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove item", error: error.message });
    }
};

const updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const item = await Cart.updateQuantity(req.userId, productId, quantity);
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to update quantity", error: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.clearCart(req.userId);
        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
};

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };
