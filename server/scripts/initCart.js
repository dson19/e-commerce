import pool from '../config/db.js';

const createCartTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS cart_items (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id)
        );
    `;

    try {
        await pool.query(query);
        console.log("Cart table created successfully!");
    } catch (error) {
        console.error("Error creating cart table:", error);
    } finally {
        pool.end();
    }
};

createCartTable();
