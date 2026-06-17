import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://hwrlijzctnzbrkmurvjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'); 
async function run() { 
  const { data, error } = await supabase.from('workshop_registrations').select('*').order('created_at', { ascending: false }).limit(5); 
  console.log(data); 
  if(error) console.log(error); 
} 
run();
