import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import pool from '../config/db.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

export const getPromotions = async (req, res) => {
    try {
    const userId = req.user ? req.user.user_id : null; 
    const promotions = await Promotion.getAvailablePromotions(userId);
    res.json(promotions);
  } catch (error) {
    console.error("Error getting promotions:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách voucher" });
  }
};

export const validatePromotion = asyncHandler(async (req, res) => {
    const { code, cartItems, cartTotal, userId } = req.body;
    const voucher = await Promotion.findByCode(code);
    if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
    };
    const now = new Date();
    if (!voucher.is_active) return res.status(400).json({ message: "Mã đã bị vô hiệu hóa" });
    if (new Date(voucher.start_date) > now) return res.status(400).json({ message: "Mã chưa đến đợt áp dụng" });
    if (new Date(voucher.end_date) < now) return res.status(400).json({ message: "Mã đã hết hạn" });
    if (voucher.used_count >= voucher.usage_limit) return res.status(400).json({ message: "Mã đã hết lượt sử dụng" });

    // kiem tra user da su dung chua
    if (userId) {
      const isUsed = await Promotion.checkUserUsage(userId, voucher.promotion_id);
      if (isUsed) return res.status(400).json({ message: "Bạn đã sử dụng mã này rồi" });
    }
    const scopes = await Promotion.getScopes(voucher.promotion_id);
    let eligibleAmount = 0;
    let eligibleItems = [];
    if (scopes.length === 0) {
        // Áp dụng cho toàn bộ giỏ hàng
        eligibleAmount = cartTotal;
        eligibleItems = cartItems;
    }
    else {
        // Áp dụng cho các sản phẩm cụ thể
        for (const item of cartItems) {
            let isMatch = false;
            let brand = await Product.getBrandByProductId(item.brand_id);
            let category = await Product.getCategoryByProductId(item.category_id);
            for (const scope of scopes) {
                if (scope.target_type === 'product' && scope.target_id === item.variant_id) isMatch = true;
                if (scope.target_type === 'category' && scope.target_id === category.category_id) isMatch = true; // Cần chắc chắn cartItem có category_id
                if (scope.target_type === 'brand' && scope.target_id === brand.brand_id) isMatch = true;     
                }
            if (isMatch) {
                eligibleAmount += item.price * item.quantity;
                eligibleItems.push(item);
            }
        }
    }

    // kiem tra min don hang
    if(Number(cartTotal) < Number(voucher.min_order_value)) {
        return res.status(400).json({ message: `Đơn hàng tối thiểu để áp dụng mã này là ${voucher.min_order_value}đ` });
    }

    if (eligibleAmount === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào trong giỏ hàng được áp dụng mã này" });
    }

    // Tính toán giảm giá
    let discountAmount = 0;
    if (voucher.discount_type === 'percentage') {
        discountAmount = (eligibleAmount * Number(voucher.discount_value)) / 100;
        if (voucher.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(voucher.max_discount_amount));
      }
    } else if (voucher.discount_type === 'fixed') {
        discountAmount = voucher.discount_value;
    }
    res.json({
      success: true,
      voucher: {
        code: voucher.code,
        discount_amount: discountAmount,
        promotion_id: voucher.promotion_id
      }
    });
});

// Admin: Tạo promotion mới
export const createPromotion = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discount_type, 
    discount_value,
    max_discount_amount,
    min_order_value,
    start_date,
    end_date,
    usage_limit,
    apply_type, // 'all', 'category', 'brand', 'product'
    scopes // Array of { type: 'category'|'brand'|'product', id: string }
  } = req.body;

  // Validation
  if (!code || !description || !start_date || !end_date || !usage_limit || 
      !discount_type || !discount_value || !min_order_value) {
    throw new ErrorResponse('Vui lòng điền đầy đủ thông tin', 400);
  }

  if (discount_type === 'percentage' && (discount_value < 1 || discount_value > 100)) {
    throw new ErrorResponse('Giá trị giảm giá phần trăm phải từ 1-100', 400);
  }

  if (new Date(start_date) >= new Date(end_date)) {
    throw new ErrorResponse('Ngày kết thúc phải sau ngày bắt đầu', 400);
  }

  // Check code duplicate
  const existing = await Promotion.findByCode(code);
  if (existing) {
    throw new ErrorResponse('Mã voucher đã tồn tại', 409);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Tạo promotion
    const promotion = await Promotion.create(client, {
      code,
      description,
      discount_type,
        discount_value,
        max_discount_amount,
        min_order_value,
      start_date,
      end_date,
      usage_limit,
      is_active: true
    });

    // Thêm scopes nếu có
    if (apply_type !== 'all' && scopes && scopes.length > 0) {
      for (const scope of scopes) {
        await Promotion.addScope(client, promotion.promotion_id, scope.type, scope.id);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: promotion
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Lấy categories cho admin form
export const getCategoriesForAdmin = asyncHandler(async (req, res) => {
  const categories = await Promotion.getAllCategories();
  res.json({
    success: true,
    data: categories
  });
});

// Lấy brands cho admin form
export const getBrandsForAdmin = asyncHandler(async (req, res) => {
  const brands = await Promotion.getAllBrands();
  res.json({
    success: true,
    data: brands
  });
});

// Tìm sản phẩm cho admin form
export const searchProductsForAdmin = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  if (!search || search.length < 2) {
    return res.json({
      success: true,
      data: []
    });
  }
  const products = await Promotion.searchProducts(search);
  res.json({
    success: true,
    data: products
  });
});

// Lấy tất cả promotions cho admin
export const getAllPromotionsForAdmin = asyncHandler(async (req, res) => {
  const promotions = await Promotion.getAllPromotions();
  const promotionScopes = await Promise.all(promotions.map(async (promotion) => {
    const scopes = await Promotion.getScopes(promotion.promotion_id);
    return { ...promotion, scopes };
  }));
  res.json({
    success: true,
    data: promotionScopes
  });
});
