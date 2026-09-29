import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwrlijzctnzbrkmurvjf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAccessCode() {
    const { data } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', 'LIDER-U6BU6Y');
    
    console.log('Access code result:', data);
}

checkAccessCode();
