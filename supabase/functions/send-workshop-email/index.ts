import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { email, name, workshop_type, workshop_date, workshop_time, workshop_location, templateId, scheduledAt } = await req.json()

    if (!email || !name || !workshop_type) {
      throw new Error('Faltan datos obligatorios (email, name, workshop_type)')
    }

    const emailBody: any = {
      templateId: templateId || 1, // Default to confirmation template if not provided
      sender: {
        name: "Auténticos",
        email: "hola@autenticos.co"
      },
      to: [
        {
          email: email,
          name: name
        }
      ],
      params: {
        user_name: name,
        name: name,
        nombre: name,
        NAME: name,
        
        workshop_name: workshop_type,
        workshop_type: workshop_type,
        taller: workshop_type,
        WORKSHOP: workshop_type,
        
        workshop_date: workshop_date,
        fecha: workshop_date,
        DATE: workshop_date,
        
        workshop_time: workshop_time,
        horario: workshop_time,
        TIME: workshop_time,
        
        workshop_location: workshop_location,
        lugar: workshop_location,
        LOCATION: workshop_location
      }
    };

    if (scheduledAt) {
      emailBody.scheduledAt = scheduledAt;
    }

    console.log('Enviando a Brevo:', JSON.stringify(emailBody, null, 2));

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY || ''
      },
      body: JSON.stringify(emailBody)
    })

    const result = await response.json()
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
