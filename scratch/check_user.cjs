const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwrlijzctnzbrkmurvjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
);

async function checkUser() {
  console.log('--- Latest user_leads ---');
  const { data: leads } = await supabase
    .from('user_leads')
    .select('id, full_name, email, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(leads);

  console.log('\n--- Latest workshop_registrations ---');
  const { data: workshops } = await supabase
    .from('workshop_registrations')
    .select('id, full_name, email, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(workshops);
}

checkUser();
