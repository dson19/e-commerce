import pool from "../config/db";

// Lay danh sach khuyen mai dang hoat dong
const getAvailablePromotions = async (userId) => {
  let query = `
    SELECT p.* FROM promotions p
    LEFT JOIN user_promotions up 
      ON p.promotion_id = up.promotion_id 
      AND up.user_id = $1
    WHERE 
      p.is_active = TRUE 
      AND p.start_date <= NOW() 
      AND p.end_date >= NOW()
      AND p.used_count < p.usage_limit
      AND up.promotion_id IS NULL
    ORDER BY p.end_date ASC
  `;

  // Nếu userId là null (khách vãng lai chưa login), ta bỏ đoạn check user_promotions đi
  // để họ thấy hết các mã còn hạn
  let values = [userId];

  if (!userId) {
    query = `
      SELECT * FROM promotions 
      WHERE is_active = TRUE 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      AND used_count < usage_limit
      ORDER BY end_date ASC
    `;
    values = [];
  }

  const res = await pool.query(query, values);
  return res.rows;
};

// Tìm Voucher bằng Code 
const findByCode = async (code) => {
  const query = 'SELECT * FROM promotions WHERE code = $1';
  const res = await pool.query(query, [code]);
  return res.rows[0];
};

// Lấy Scope của một Promotion (để biết áp dụng cho sản phẩm nào)
const getScopes = async (promotionId) => {
  const query = 'SELECT * FROM promotion_scopes WHERE promotion_id = $1';
  const res = await pool.query(query, [promotionId]);
  return res.rows; 
};

// Kiểm tra người dùng đã sử dụng Voucher chưa
const checkUserUsage = async (userId, promotionId) => {
  const query = 'SELECT * FROM user_promotions WHERE user_id = $1 AND promotion_id = $2';
  const res = await pool.query(query, [userId, promotionId]);
  return res.rows.length > 0; // True nếu đã dùng
};

// Ghi nhận việc sử dụng Voucher của người dùng
const recordUsage = async (client, userId, promotionId, orderId, discountAmount) => {
  // Trừ số lượng Global
  await client.query(
    'UPDATE promotions SET used_count = used_count + 1 WHERE promotion_id = $1',
    [promotionId]
  );
  
  // Lưu lịch sử User dùng
  await client.query(
    `INSERT INTO user_promotions (user_id, promotion_id, order_id, discount_amount) 
     VALUES ($1, $2, $3, $4)`,
    [userId, promotionId, orderId, discountAmount]
  );
};

const findById = async (id) => {
  const query = 'SELECT * FROM promotions WHERE promotion_id = $1';
  const res = await pool.query(query, [id]);
  return res.rows[0];
};

// Tạo promotion mới
const create = async (client, promotionData) => {
  const {
    code,
    description,
    start_date,
    end_date,
    usage_limit,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount,
    is_active = true
  } = promotionData;

  const query = `
    INSERT INTO promotions (
      code, description, start_date, end_date, usage_limit,
      discount_type, discount_value, max_discount_amount, min_order_amount, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  
  const values = [
    code,
    description,
    start_date,
    end_date,
    usage_limit,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount,
    is_active
  ];

  const res = await client.query(query, values);
  return res.rows[0];
};

// Thêm scope cho promotion
const addScope = async (client, promotionId, targetType, targetId) => {
  const query = `
    INSERT INTO promotion_scopes (promotion_id, target_type, target_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const res = await client.query(query, [promotionId, targetType, targetId]);
  return res.rows[0];
};

// Lấy tất cả categories (parent categories)
const getAllCategories = async () => {
  const query = 'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY category_name ASC';
  const res = await pool.query(query);
  return res.rows;
};

// Lấy tất cả brands
const getAllBrands = async () => {
  const query = 'SELECT * FROM brands ORDER BY brand_name ASC';
  const res = await pool.query(query);
  return res.rows;
};

// Tìm sản phẩm theo tên
const searchProducts = async (searchTerm, limit = 20) => {
  const query = `
    SELECT p.id, p.name, p.slug, b.brand_name, c.category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.name ILIKE $1 OR b.brand_name ILIKE $1
    ORDER BY p.name ASC
    LIMIT $2
  `;
  const res = await pool.query(query, [`%${searchTerm}%`, limit]);
  return res.rows;
};

export default { 
  getAvailablePromotions, 
  findByCode, 
  getScopes, 
  checkUserUsage, 
  recordUsage,
  findById,
  create,
  addScope,
  getAllCategories,
  getAllBrands,
  searchProducts,
};