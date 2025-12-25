import pool from '../config/db.js';

const resetCart = async () => {
    try {
        console.log("Dropping cart_items table...");
        await pool.query('DROP TABLE IF EXISTS cart_items CASCADE');
        console.log("cart_items table dropped.");

        const query = `
            CREATE TABLE cart_items (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            );
        `;
        await pool.query(query);
        console.log("cart_items table recreated successfully!");

    } catch (error) {
        console.error("Error resetting cart table:", error);
    } finally {
        pool.end();
    }
};

resetCart();
