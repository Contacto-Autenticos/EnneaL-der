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
    const { email, name, pdfBase64 } = await req.json()

    if (!email || !name || !pdfBase64) {
      throw new Error('Faltan datos obligatorios (email, name, pdfBase64)')
    }

    const emailBody = {
      templateId: 7,
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
        NAME: name
      },
      attachment: [
        {
          content: pdfBase64,
          name: "Reporte-Autodiagnostico.pdf"
        }
      ]
    };

    console.log('Enviando reporte Fascinantes a:', email);

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
