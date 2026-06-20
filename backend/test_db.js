import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data, error } = await supabase.from('notifications').select('*').limit(1);
    console.log("Error:", error);
    if (error && error.code === '42P01') {
        console.log("Table does not exist. Please run raw SQL to create it.");
        // We can create it via SQL
    }
}
run();
