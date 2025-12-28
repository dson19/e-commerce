import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const fixDuplicate = async () => {
    try {
        console.log("Checking for 'Màn hình' duplicates...");
        
        // Find all variants of Màn hình
        const res = await pool.query(`
            SELECT category_id, category_name 
            FROM categories 
            WHERE category_name ILIKE '%màn hình%' AND parent_id IS NULL
            ORDER BY category_id ASC
        `);
        
        console.log("Found categories:", res.rows);
        
        if (res.rows.length > 1) {
            // Assume the last one (highest ID) is the one to delete
            const toDelete = res.rows[res.rows.length - 1];
            const toKeep = res.rows[0];
            
            console.log(`Deleting duplicate ID: ${toDelete.category_id} (${toDelete.category_name})`);
            console.log(`Keeping ID: ${toKeep.category_id} (${toKeep.category_name})`);
            
            // Re-parent children if any (just in case)
            await pool.query('UPDATE categories SET parent_id = $1 WHERE parent_id = $2', [toKeep.category_id, toDelete.category_id]);
            await pool.query('UPDATE products SET category_id = $1 WHERE category_id = $2', [toKeep.category_id, toDelete.category_id]);
            
            // Delete
            await pool.query('DELETE FROM categories WHERE category_id = $1', [toDelete.category_id]);
            console.log("Deletion successful.");
        } else {
            console.log("No duplicates found or only one 'Màn hình' category exists.");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixDuplicate();
