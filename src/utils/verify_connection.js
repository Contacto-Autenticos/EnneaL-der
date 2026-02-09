
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env manually since we're running with node directly, not vite
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing environment variables in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
    console.log('Testing connection to Supabase...');
    console.log('URL:', supabaseUrl);

    try {
        // Try to select from users table (even if empty)
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            if (error.code === '42P01') {
                console.error('Likely cause: Table "users" does not exist.');
            }
        } else {
            console.log('Connection successful!');
            console.log(`Table "users" exists and is accessible. Row count: ${count}`);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verifyConnection();
