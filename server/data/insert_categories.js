import dotenv from 'dotenv';
import path from 'path';

// Specify path to .env file relative to current working directory (project root)
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const subCategories = {
    "Điện thoại": ["iPhone", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme", "Nokia", "Asus"],
    "Laptop": ["MacBook", "Dell", "HP", "Asus", "Acer", "Lenovo", "MSI", "LG Gram"],
    "Tablet": ["iPad", "Samsung Tab", "Xiaomi Pad", "Lenovo Tab"],
    "Âm thanh": [],
    "Màn hình": [],
    "Khác": []
};

const insertCategories = async () => {
    // Dynamic import to ensure env is loaded first
    const { default: pool } = await import('../config/db.js');
    
    try {
        console.log("Creating categories table if not exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                category_id SERIAL PRIMARY KEY,
                parent_id INTEGER REFERENCES categories(category_id),
                category_name VARCHAR(255) UNIQUE NOT NULL
            );
        `);
        
        try {
            await pool.query('ALTER TABLE categories ADD CONSTRAINT categories_category_name_unique UNIQUE (category_name)');
            console.log("Added unique constraint to category_name");
        } catch (e) {
            console.log("Constraint addition skipped (likely exists or diff name):", e.message);
        }

        console.log("Starting category insertion...");

        // Iterate over parent categories
        for (const [parentName, children] of Object.entries(subCategories)) {
            // Insert or Get Parent
            let parentId;
            const existingParent = await pool.query('SELECT category_id FROM categories WHERE category_name = $1', [parentName]);
            
            if (existingParent.rows.length > 0) {
                parentId = existingParent.rows[0].category_id;
                // Ensure parent_id is NULL for root categories? User might not want to overwrite if manual changes were made, but for now let's leave it.
                // Optionally update: await pool.query('UPDATE categories SET parent_id = NULL WHERE category_id = $1', [parentId]);
                console.log(`Parent exists: ${parentName} (ID: ${parentId})`);
            } else {
                const parentRes = await pool.query(`
                    INSERT INTO categories (category_name, parent_id)
                    VALUES ($1, NULL)
                    RETURNING category_id;
                `, [parentName]);
                parentId = parentRes.rows[0].category_id;
                console.log(`Inserted Parent: ${parentName} (ID: ${parentId})`);
            }

            // Insert Children
            for (const childName of children) {
                const existingChild = await pool.query('SELECT category_id FROM categories WHERE category_name = $1', [childName]);
                
                if (existingChild.rows.length > 0) {
                    // Update parent_id to link to the correct parent
                    await pool.query('UPDATE categories SET parent_id = $1 WHERE category_name = $2', [parentId, childName]);
                    console.log(`  - Updated Child: ${childName} (Parent ID: ${parentId})`);
                } else {
                    await pool.query(`
                        INSERT INTO categories (category_name, parent_id)
                        VALUES ($1, $2)
                    `, [childName, parentId]);
                    console.log(`  - Inserted Child: ${childName}`);
                }
            }
        }

        console.log("Category insertion complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting categories full details:", error);
        process.exit(1);
    }
};

insertCategories();
