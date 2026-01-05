import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await pool.query("ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
        console.log('Migration successful: phone column added to addresses table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
