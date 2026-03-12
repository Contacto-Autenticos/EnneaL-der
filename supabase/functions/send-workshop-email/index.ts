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
        sender: {
          name: "EnneaLíder - Auténticos",
          email: "hola@autenticos.co" // Change this to your verified sender
        },
        to: [
          {
            email: email,
            name: name
          }
        ],
        subject: `¡Reserva Confirmada! Bienvenido al Taller ${workshop_type}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9f9f9; }
              .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #ddbe3d; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { color: #002d44; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .details-box { background: #fdfaf0; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 25px 0; }
              .detail-item { margin-bottom: 10px; font-size: 16px; }
              .detail-label { font-weight: bold; color: #b89b2d; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 2px; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
              .btn { display: inline-block; padding: 15px 30px; background-color: #ddbe3d; color: #002d44; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="title">¡Hola, ${name}!</div>
                  <p style="font-size: 18px; color: #666;">Tu lugar en el taller ha sido reservado con éxito.</p>
                </div>
                
                <p>Estamos emocionados de que formes parte de esta experiencia de transformación. Aquí tienes los detalles de tu taller:</p>
                
                <div class="details-box">
                  <div class="detail-item">
                    <div class="detail-label">Taller</div>
                    <div style="font-size: 18px; font-weight: bold; color: #002d44;">${workshop_type}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Fecha</div>
                    <div>${workshop_date}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Horario</div>
                    <div>${workshop_time}</div>
                  </div>
                </div>
                
                <p>Próximamente estaremos enviándote más información y el enlace de acceso por este mismo medio.</p>
                
                <div style="text-align: center;">
                  <a href="https://autenticos.co" class="btn">VISITAR NUESTRO SITIO</a>
                </div>
              </div>
              <div class="footer">
                <p>© 2026 Auténticos - EnneaLíder. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
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
