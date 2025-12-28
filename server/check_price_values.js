import pool from './config/db.js';

const check = async () => {
  try {
    const pRes = await pool.query("SELECT id, name FROM products WHERE name ILIKE '%iPhone 16 Pro Max%'");
    if (pRes.rows.length === 0) {
        console.log("Product not found");
        return;
    }
    const pid = pRes.rows[0].id;
    console.log(`Product: ${pRes.rows[0].name} (ID: ${pid})`);

    const vRes = await pool.query("SELECT variant_id, sku, color, price, old_price FROM product_variants WHERE product_id = $1", [pid]);
    console.log("Variants:", JSON.stringify(vRes.rows, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
      setTimeout(() => process.exit(), 1000);
  }
};
check();
