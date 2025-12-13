import pool from '../config/db.js';

// Nhận thêm gender và phoneNumber
const create = async (firstName, lastName, email, password, gender, phoneNumber) => {
  const query = `
    INSERT INTO users (firstname, lastname, email, password, gender, phone_number) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *
  `;

  const values = [firstName, lastName, email, password, gender, phoneNumber];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const findByEmail = async(email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const findByPhone = async(phoneNumber) => {
  const query = 'SELECT * FROM users WHERE phone_number = $1';
  const values = [phoneNumber];
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
export default { create, findByEmail, findByPhone, findById, findByIdNoPassword };