
// send_test_email.mjs
const url = 'https://hwrlijzctnzbrkmurvjf.supabase.co/functions/v1/send-workshop-email';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y';

async function sendTest() {
  const payload = {
    email: 'carlose.orozcob@gmail.com',
    name: 'Carlos Orozco',
    workshop_type: 'Taller Virtual de Eneagrama',
    workshop_date: '14, 15, 16 y 17 de Abril',
    workshop_time: '7:00 PM - 9:00 PM (Col)'
  };

  console.log('Enviando correo de prueba final con remitente "Auténticos"...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Resultado:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error enviando el correo:', err);
  }
}

sendTest();
