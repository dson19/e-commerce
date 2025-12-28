import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

// Specify path to .env file relative to current working directory (project root)
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const deduplicateCategories = async () => {
    try {
        console.log("Starting deduplication...");
        
        // Find duplicates
        const findDuplicatesQuery = `
            SELECT category_name, COUNT(*)
            FROM categories
            WHERE parent_id IS NULL
            GROUP BY category_name
            HAVING COUNT(*) > 1;
        `;
        
        const duplicates = await pool.query(findDuplicatesQuery);
        
        for (const row of duplicates.rows) {
            const name = row.category_name;
            console.log(`Processing duplicate: ${name}`);
            
            // Get all instances ordered by ID
            const instancesRes = await pool.query(
                'SELECT category_id FROM categories WHERE category_name = $1 AND parent_id IS NULL ORDER BY category_id ASC', 
                [name]
            );
            
            const instances = instancesRes.rows;
            const keepId = instances[0].category_id;
            console.log(`Keeping ID: ${keepId}`);
            
            for (let i = 1; i < instances.length; i++) {
                const removeId = instances[i].category_id;
                console.log(`Removing ID: ${removeId}`);
                
                // Move children to the kept parent
                await pool.query('UPDATE categories SET parent_id = $1 WHERE parent_id = $2', [keepId, removeId]);
                
                // Move products to the kept category (if any are directly linked to parent, though unlikely for this schema)
                await pool.query('UPDATE products SET category_id = $1 WHERE category_id = $2', [keepId, removeId]);
                
                // Delete the duplicate
                await pool.query('DELETE FROM categories WHERE category_id = $1', [removeId]);
            }
        }
        
        console.log("Deduplication complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error deduplicating:", error);
        process.exit(1);
    }
};

deduplicateCategories();
