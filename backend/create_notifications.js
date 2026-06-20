import { pool } from './src/config/db.js';

async function setup() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL,
                link TEXT,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
        `);
        console.log("Table created successfully");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit(0);
    }
}
setup();
