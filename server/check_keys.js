import pool from './config/db.js';

const check = async () => {
  try {
    const vRes = await pool.query("SELECT * FROM product_variants LIMIT 1");
    // Print keys
    if (vRes.rows.length > 0) {
        console.log("Columns:", Object.keys(vRes.rows[0]));
        console.log("Row:", JSON.stringify(vRes.rows[0], null, 2));
    } else {
        console.log("Table empty");
    }

  } catch (e) {
    console.error(e);
  } finally {
      setTimeout(() => process.exit(), 1000);
  }
};
check();
