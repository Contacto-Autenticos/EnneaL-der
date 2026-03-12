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
    const { email, name, workshop_type, workshop_date, workshop_time } = await req.json()

    if (!email || !name || !workshop_type) {
      throw new Error('Faltan datos obligatorios (email, name, workshop_type)')
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY || ''
      },
      body: JSON.stringify({
        templateId: 1, // Using the user's template ID
        sender: {
          name: "EnneaLíder - Auténticos",
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
          workshop_name: workshop_type,
          workshop_date: workshop_date,
          workshop_time: workshop_time
        }
      })
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
