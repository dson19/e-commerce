import pool from './server/config/db.js';

const migrate = async () => {
    try {
        // Add phone column to addresses table if it doesn't exist
        await pool.query("ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
        console.log('Migration successful: phone column added to addresses table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
