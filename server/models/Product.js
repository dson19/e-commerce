import pool from "../config/db.js";

export const getReviewsByProductId = async (productId) => {
  const query = 'SELECT * FROM reviews WHERE product_id = $1';
  const values = [productId];
  const res = await pool.query(query, values);
  return res.rows;
};

const getBrandByProductId = async (brand_id) => {
  const query = `
    SELECT b.brand_name FROM brands b
    WHERE b.brand_id = $1
  `;
  const values = [brand_id];
  const res = await pool.query(query, values);
  return res.rows[0]; 
};

const getCategoryByProductId = async (category_id) => {
  const query = `
    WITH RECURSIVE category_path AS (
      SELECT category_id, category_name, parent_id
      FROM categories
      WHERE category_id = $1
      UNION ALL
      SELECT c.category_id, c.category_name, c.parent_id
      FROM categories c
      INNER JOIN category_path cp ON c.category_id = cp.parent_id
    )
    SELECT * FROM category_path ORDER BY parent_id NULLS FIRST LIMIT 1
  `;
  const values = [category_id];
  const res = await pool.query(query, values);
  return res.rows[0]; 
};
export default { 
  getBrandByProductId,
  getCategoryByProductId
};