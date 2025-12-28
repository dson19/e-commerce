import pool from './config/db.js';

const check = async () => {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
  } catch (e) {
    console.error(e);
  } finally {
      setTimeout(() => process.exit(), 1000);
  }
};
check();
