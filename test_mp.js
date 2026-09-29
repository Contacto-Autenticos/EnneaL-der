import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hwrlijzctnzbrkmurvjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
);

async function test() {
    const { data, error } = await supabase.functions.invoke('create-mp-preference', {
        body: {
            reference: 'mlt-dir-12345-12345',
            price: 900000,
            title: 'MLT Dirección - Primera Cohorte',
            user_email: 'carlose.orozcob@gmail.com',
            back_url_custom: 'http://localhost:5173/mlt-direccion-success'
        }
    });

    console.log("Data:", data);
    console.log("Error:", error);
    
    // Also try direct fetch to see the body
    const response = await fetch('https://hwrlijzctnzbrkmurvjf.supabase.co/functions/v1/create-mp-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y'
        },
        body: JSON.stringify({
            reference: 'mlt-dir-12345-12345',
            price: 900000,
            title: 'MLT Dirección - Primera Cohorte',
            user_email: 'carlose.orozcob@gmail.com',
            back_url_custom: 'http://localhost:5173/mlt-direccion-success'
        })
    });
    
    console.log("Direct Fetch Status:", response.status);
    console.log("Direct Fetch Body:", await response.text());
}

test();
