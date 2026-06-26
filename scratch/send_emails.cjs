const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwrlijzctnzbrkmurvjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
);

async function sendEmails() {
  // Check if juridico is in DB
  const { data: user, error } = await supabase
    .from('workshop_registrations')
    .select('full_name')
    .eq('email', 'juridico@cargaya.com.co')
    .limit(1);

  let juridicoName = 'Participante';
  if (user && user.length > 0) {
    juridicoName = user[0].full_name;
  }

  const targets = [
    { email: 'mathewmolina38@gmail.com', name: 'Mathew Molina' },
    { email: 'juridico@cargaya.com.co', name: juridicoName }
  ];

  for (const target of targets) {
    const payload = {
      email: target.email,
      name: target.name,
      workshop_type: 'HAZ QUE SUCEDA',
      workshop_date: '27 de Junio',
      workshop_time: '9:00 AM - 5:00 PM',
      workshop_location: 'https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali',
      workshop_location_name: 'Casa Obeso Cali, Colombia',
      workshop_location_url: 'https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali',
      workshop_name: 'Haz que suceda',
      lugar_nombre: 'Casa Obeso Cali, Colombia',
      templateId: 3
    };

    console.log(`Sending to ${target.email}...`);
    const { data: response, error: invokeError } = await supabase.functions.invoke('send-workshop-email', {
      body: payload
    });

    if (invokeError) {
      console.error(`Failed to send to ${target.email}:`, invokeError);
    } else {
      console.log(`Sent to ${target.email}. Response:`, response);
    }
  }
}

sendEmails();
