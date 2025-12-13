import pool from '../config/db.js';

const create = async (email, password) => {
  const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
  const values = [email, password];
  const res = await pool.query(query, values);
  return res.rows[0];
}
const findByEmail = async(email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export default { create, findByEmail };