import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.json()
    
    // Configuración de Brevo
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')?.trim()
    const TARGET_EMAILS = [
      { email: 'felipebeltranh@gmail.com', name: 'Felipe Beltrán' }
    ]

    if (!BREVO_API_KEY) {
      console.error('Missing BREVO_API_KEY')
      throw new Error('Server configuration error: Missing email provider API key')
    }

    // HTML formatter for the email body
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #002d44; border-bottom: 2px solid #ddbe3d; padding-bottom: 10px;">Nueva Evaluación Final - MLT Dirección</h2>
        
        <p>Aquí tienes una copia de las respuestas de la evaluación final.</p>

        <h3 style="color: #002d44; margin-top: 25px;">Datos del Participante</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>Nombre:</strong> ${formData.firstName} ${formData.lastName}<br/><br/>
          <strong>Correo:</strong> ${formData.email}
        </p>

        <h3 style="color: #002d44; margin-top: 25px;">1. Claridad e Impacto (1-10)</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>Claridad del reto antes de iniciar:</strong> ${formData.clarityBefore}<br/><br/>
          <strong>Claridad de dirección actual:</strong> ${formData.clarityAfter}<br/><br/>
          <strong>Cambios concretos generados:</strong> ${formData.changesImpact}<br/><br/>
          <strong>Aplicabilidad de herramientas:</strong> ${formData.toolsApplicability}
        </p>

        <h3 style="color: #002d44; margin-top: 25px;">2. Experiencia y Recomendación</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>Lo más valioso del proceso:</strong><br/>
          ${formData.mostValuable || 'N/A'}
        </p>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>Oportunidades de mejora:</strong><br/>
          ${formData.improvementAreas || 'N/A'}
        </p>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>¿Recomendaría MLT Dirección?:</strong><br/>
          ${formData.wouldRecommend || 'N/A'}
        </p>
        
        <h3 style="color: #002d44; margin-top: 25px;">3. Testimonio</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ddbe3d; margin-top: 5px;">
          <strong>Mensaje:</strong><br/>
          ${formData.testimonial || 'N/A'}
        </p>
      </div>
    `

    // --- Enviar a Brevo ---
    const brevoPayload = {
      sender: {
        name: "App MLT Dirección",
        email: "hola@autenticos.co"
      },
      to: TARGET_EMAILS,
      subject: `Evaluación Final MLT: ${formData.firstName} ${formData.lastName}`,
      htmlContent: emailHtml
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json', 
        'api-key': BREVO_API_KEY 
      },
      body: JSON.stringify(brevoPayload)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Error from Brevo:", errorText)
      throw new Error(`Failed to send email via Brevo: ${errorText}`)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-mlt-evaluacion:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
