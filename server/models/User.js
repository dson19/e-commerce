import pool from '../config/db.js';

const create = async (email, username, password) => {
  const query = 'INSERT INTO users (email,username, password) VALUES ($1, $2, $3) RETURNING *';
  const values = [email, username, password];
  const res = await pool.query(query, values);
  return res.rows[0];
}
const findByEmail = async(email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const res = await pool.query(query, values);
  return res.rows[0];
}
const findById = async(id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [id];
  const res = await pool.query(query, values);
  return res.rows[0];
}
const findByIdNoPassword = async(id) => {
  const query = 'SELECT id, email, username FROM users WHERE id = $1';
  const values = [id];
  const res = await pool.query(query, values);
  return res.rows[0];
}
export default { create, findByEmail, findById, findByIdNoPassword };