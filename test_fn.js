const url = 'https://hwrlijzctnzbrkmurvjf.supabase.co/functions/v1/send-workshop-email';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y';

async function testEmail(templateId) {
  const payload = {
    email: 'carlose.orozcob@gmail.com',
    name: 'Carlos Orozco (Test Taller)',
    workshop_type: 'Haz que suceda',
    workshop_date: '27 de junio',
    workshop_time: '9:00 AM - 5:00 PM',
    workshop_location: 'Casa Obeso, Cali Colombia',
    workshop_location_name: 'Casa Obeso',
    workshop_location_url: 'https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali',
    templateId: templateId
  };

  console.log(`Enviando plantilla ID ${templateId}...`);
  
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
    console.log(`Status Plantilla ${templateId}:`, response.status);
    console.log(`Resultado Plantilla ${templateId}:`, JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Error en Plantilla ${templateId}:`, err);
  }
}

async function runTests() {
    await testEmail(1);
    await testEmail(2);
    await testEmail(3);
}

runTests();
