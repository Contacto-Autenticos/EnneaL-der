import fs from 'fs';
import https from 'https';

const users = [
  { "name": "Carmen Elvira Villaquiran", "email": "carmenelviravillaquiran@gmail.com" },
  { "name": "Julian Sierra Cano", "email": "jsierracano@gmail.com" },
  { "name": "Aminadab De Jesus", "email": "aadjesm@gmail.com" },
  { "name": "Lorena Castillo", "email": "castillo.molina.lorena@gmail.com" },
  { "name": "Viviana Colorado", "email": "vivianacolovallejo@gmail.com" },
  { "name": "Hernando Gaviria", "email": "hgaviria@grupa.com.co" },
  { "name": "Yeniffer Carabali Vente", "email": "hgaviria@grupa.com.co" },
  { "name": "Keitty Eliana Torres Rivera", "email": "keittytorres@gmail.com" },
  { "name": "Marcela Escobar", "email": "mescobarcano@gmail.com" },
  { "name": "Zaira Estrada", "email": "zairaestradat1205@gmail.com" },
  { "name": "Angela Marcela Barco Cobo", "email": "angelabarco.trabajosocial@gmail.com" },
  { "name": "Jhoana Santacruz", "email": "yoisstcruz727@gmail.com" },
  { "name": "Sandra Milena Gomez Diaz", "email": "gerencia@empackingglobal.com" },
  { "name": "Francia Montoya", "email": "franciamontoya2@gmail.com" },
  { "name": "Dilan Jhanier Quintana", "email": "sec_gerencia@granabastos.com.co" },
  { "name": "Hector Varela", "email": "chvarela19@gmail.com" },
  { "name": "Maria Eugenia Largo", "email": "marilargo1004@gmail.com" },
  { "name": "Leidy Barrera", "email": "leidy910710@gmail.com" }
];

async function sendEmails() {
  console.log(`Starting mass mailer for ${users.length} users...`);
  
  const payload = JSON.stringify({ users });
  
  const options = {
    hostname: 'hwrlijzctnzbrkmurvjf.supabase.co',
    path: '/functions/v1/send-test-whatsapp-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      console.log('Response Data:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Request Error:', e);
  });

  req.write(payload);
  req.end();
}

sendEmails();
