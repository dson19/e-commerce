import pool from '../config/db.js';

// Nhận thêm gender và phoneNumber
const create = async (email, fullname, password, gender, phoneNumber) => {
  const query = `
    INSERT INTO users (email, fullname, password, gender, phone_number) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
  `;

  const values = [email, fullname, password, gender, phoneNumber];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const findByEmail = async(email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const res = await pool.query(query, values);
  return res.rows[0];
}


const findByPhone = async(phonenumber) => {
  const query = 'SELECT * FROM users WHERE phone_number = $1';
  const values = [phonenumber];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const findById = async(id) => {
  const query = 'SELECT * FROM users WHERE user_id = $1';
  const values = [id];
  const res = await pool.query(query, values);
  return res.rows[0];
}
const findByIdNoPassword = async(id) => {
  const query = 'SELECT user_id, email, fullname, phone_number, gender FROM users WHERE user_id = $1';
  const values = [id];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const updatePassword = async (email, newPassword) => {
  const query = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING *';
  const values = [newPassword, email];
  const res = await pool.query(query, values);
  return res.rows[0];
}

const updateProfile = async (userId, fullname) => {
  const query = 'UPDATE users SET fullname = $1 WHERE user_id = $2 RETURNING *';
  const values = [fullname, userId];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export default { create, findByEmail, findByPhone, findById, findByIdNoPassword, updatePassword, updateProfile }; // Nhớ export thêm updatePassword