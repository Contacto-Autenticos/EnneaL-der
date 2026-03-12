
const fetch = require('node-fetch');

const url = 'https://hwrlijzctnzbrkmurvjf.supabase.co/functions/v1/send-workshop-email';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y';

async function test() {
  const payload = {
    email: 'test@example.com',
    name: 'Test User (Verificación)',
    workshop_type: 'VIRTUAL',
    workshop_date: '14-17 de Abril',
    workshop_time: '7:00 PM - 9:00 PM'
  };

  console.log('Invocando función:', url);
  
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
    console.error('Error:', err);
  }
}

test();
