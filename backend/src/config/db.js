import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js';

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is missing in .env');
}

// Initialize Supabase client for Auth and Storage
export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })

// Initialize pure Postgres pool for data access
const { Pool, types } = pg;
types.setTypeParser(1114, str => new Date(str + 'Z'));

export const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});


export const query = (text, params) => {
    logger.info(`[DB QUERY] Executing: ${text}`);
    if (params && params.length > 0) {
        logger.info(`[DB PARAMS] ${JSON.stringify(params)}`);
    }
    return pool.query(text, params);
};
