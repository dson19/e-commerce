import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env BEFORE importing pool
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import pool from '../config/db.js';

const checkData = async () => {
    let output = "--- CART DEBUG LOG ---\n";
    try {
        output += "DB URL length: " + (process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0) + "\n";
        
        const users = await pool.query('SELECT user_id, email, fullname FROM users ORDER BY user_id DESC LIMIT 5');
        output += "\n--- RECENT USERS ---\n" + JSON.stringify(users.rows, null, 2) + "\n";

        const carts = await pool.query('SELECT * FROM carts');
        output += "\n--- CARTS ---\n" + JSON.stringify(carts.rows, null, 2) + "\n";

        const cartItems = await pool.query('SELECT * FROM cart_items');
        output += "\n--- CART ITEMS ---\n" + JSON.stringify(cartItems.rows, null, 2) + "\n";

        const variantSchema = await pool.query('SELECT * FROM product_variants LIMIT 1');
        output += "\n--- PRODUCT_VARIANTS SCHEMA (1 ROW) ---\n" + JSON.stringify(variantSchema.rows, null, 2) + "\n";

        output += "\n--- ANALYZING VARIANT IDS IN CART_ITEMS ---\n";
        const variantIds = cartItems.rows.map(i => i.variant_id);
        if (variantIds.length > 0) {
            const variants = await pool.query(`SELECT variant_id, product_id FROM product_variants WHERE variant_id = ANY($1)`, [variantIds]);
            output += "Variants found in product_variants: " + JSON.stringify(variants.rows, null, 2) + "\n";
        }

        if (carts.rows.length > 0) {
            for (const cart of carts.rows) {
                // Use LEFT JOIN to see where it breaks
                const query = `
                    SELECT 
                        ci.cart_item_id, 
                        ci.variant_id, 
                        ci.quantity, 
                        p.name as product_name, 
                        pv.variant_id as pv_id,
                        p.id as p_id
                    FROM cart_items ci
                    LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
                    LEFT JOIN products p ON pv.product_id = p.id
                    WHERE ci.cart_id = $1
                `;
                const joinedItems = await pool.query(query, [cart.cart_id]);
                output += `\n--- ITEMS IN CART ${cart.cart_id} (User ID: ${cart.user_id}) (LEFT JOIN) ---\n`;
                output += JSON.stringify(joinedItems.rows, null, 2) + "\n";
            }
        }

    } catch (err) {
        output += "\nDEBUG ERROR: " + err.message + "\n";
    } finally {
        fs.writeFileSync(path.join(__dirname, 'cart_debug.txt'), output);
        console.log("Debug results written to server/data/cart_debug.txt");
        await pool.end();
        process.exit(0);
    }
};

checkData();
