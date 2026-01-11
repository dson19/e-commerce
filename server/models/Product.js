import pool from "../config/db.js";

export const getReviewsByProductId = async (productId) => {
  const query = 'SELECT * FROM reviews WHERE product_id = $1';
  const values = [productId];
  const res = await pool.query(query, values);
  return res.rows;
};

export const getBrandByProductId = async (brand_id) => {
  const query = `
    SELECT b.brand_name FROM brands b
    WHERE b.brand_id = $1
  `;
  const values = [brand_id];
  const res = await pool.query(query, values);
  return res.rows[0]; 
};

export const getCategoryByProductId = async (category_id) => {
  const query = `
    SELECT c.category_name FROM categories c
    WHERE c.category_id = $1
  `;
  const values = [category_id];
  const res = await pool.query(query, values);
  return res.rows[0]; 
};