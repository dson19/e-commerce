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
  const query = 'SELECT user_id, email, fullname, phone_number, gender, role FROM users WHERE user_id = $1';
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
const getAddresses = async (userId) => {
  const query = 'SELECT * FROM addresses WHERE user_id = $1';
  const values = [userId];
  const res = await pool.query(query, values);
  return res.rows;
}
const addAddress = async (userId, data, isDefault = false) => {
  const client =  await pool.connect();
  try{
    await client.query('BEGIN');
    const check = await client.query('SELECT * FROM addresses WHERE user_id = $1', [userId]);
    if (isDefault || check.rows.length === 0){
      isDefault = true;
    }
    if (isDefault){
      await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }
    const query = 'INSERT INTO addresses (user_id, city, district, ward, street, is_default, name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [userId, data.city, data.district, data.ward, data.street, isDefault, data.name];
    const res = await client.query(query, values);
    await client.query('COMMIT');
    return res.rows[0];
  } catch (error){
    await client.query('ROLLBACK');
    throw error;
  }
  finally{
    client.release();
  }
}

const deleteAddress = async (user_id, address_id) => {
  // phai cung 1 ket noi va co rollback (neu co loi)
  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    const query = 'DELETE FROM addresses WHERE address_id = $1 AND user_id = $2 RETURNING *';
    const values = [address_id, user_id];
    const res = await client.query(query, values);
    const deletedAddress = res.rows[0];
    if (!deletedAddress){
      await client.query('ROLLBACK');
      return null;
    }
    if (deletedAddress.is_default){
      const anotherAddressRes = await client.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY address_id ASC LIMIT 1', [user_id]);
      if (anotherAddressRes.rows.length > 0){
        const anotherAddress = anotherAddressRes.rows[0];
        await client.query('UPDATE addresses SET is_default = true WHERE address_id = $1 AND user_id = $2', [anotherAddress.address_id, user_id]);
      }
    }
    await client.query('COMMIT');
    return deletedAddress;
  } catch (error){
    await client.query('ROLLBACK');
    throw error;
  }
  finally{
    client.release();
  }
}

const updateAddress = async (user_id, address_id, data, isDefault = false) => {
  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    if (isDefault){
      // set tat ca con lai ve false 
      await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user_id]);
      const query = 'UPDATE addresses SET city = $1, district = $2, ward = $3, street = $4, is_default = true, name = $7 WHERE address_id = $5 AND user_id = $6 RETURNING *';
      const values = [data.city, data.district, data.ward, data.street, address_id, user_id, data.name];
      const res = await client.query(query, values);
      await client.query('COMMIT');
      return res.rows[0];
    }
    else {
      const query = 'UPDATE addresses SET city = $1, district = $2, ward = $3, street = $4, name = $7 WHERE address_id = $5 AND user_id = $6 RETURNING *';
      const values = [data.city, data.district, data.ward, data.street, address_id, user_id, data.name];
      const res = await client.query(query, values);
      await client.query('COMMIT');
      return res.rows[0];
    }
  } catch (error){
    await client.query('ROLLBACK');
    throw error;
  }
  finally{
    client.release();
  }
}
const getDefaultAddress = async (userId) => {
  const query = 'SELECT * FROM addresses WHERE user_id = $1 AND is_default = true';
  const values = [userId];
  const res = await pool.query(query, values);
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows[0];
}
export default { create, findByEmail, findByPhone, findById, findByIdNoPassword, updatePassword, updateProfile, getAddresses, addAddress, deleteAddress, updateAddress }; // Nhớ export thêm updatePassword