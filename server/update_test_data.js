import pool from './config/db.js';

const update_and_check = async () => {
  try {
    const res = await pool.query("SELECT id FROM products WHERE name ILIKE '%iPhone 16 Pro Max%'");
    const pid = res.rows[0].id;

    // Check before
    const vResBefore = await pool.query("SELECT color, price, old_price FROM product_variants WHERE product_id = $1", [pid]);
    console.log("Before:", JSON.stringify(vResBefore.rows, null, 2));

    // Update Titan Tu Nhien to have an old price if it doesn't
    await pool.query("UPDATE product_variants SET old_price = 33990000 WHERE product_id = $1 AND color = 'Titan Tự Nhiên'", [pid]);

    // Check after
    const vResAfter = await pool.query("SELECT color, price, old_price FROM product_variants WHERE product_id = $1", [pid]);
    console.log("After:", JSON.stringify(vResAfter.rows, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
      setTimeout(() => process.exit(), 1000);
  }
};
update_and_check();
