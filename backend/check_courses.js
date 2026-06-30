import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    if (error) throw error;
    console.log(Object.keys(data[0] || {}));
}

run().catch(console.error);
