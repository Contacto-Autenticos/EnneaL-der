const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwrlijzctnzbrkmurvjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
);

async function checkApprovedUsers() {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select('id, full_name, email, workshop_name, created_at')
    .eq('payment_status', 'APPROVED');
    
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

checkApprovedUsers();
