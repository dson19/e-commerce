import pool from "../config/db.js";

export const getReviewsByProductId = async (productId) => {
  const query = 'SELECT * FROM reviews WHERE product_id = $1';
  const values = [productId];
  const res = await pool.query(query, values);
  return res.rows;
}