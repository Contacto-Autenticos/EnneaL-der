import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, serviceRequired, guests, startTime, endTime, operatorEmail } = body;

    // Get env variables
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    let privateKeyEnv = Deno.env.get('GOOGLE_PRIVATE_KEY');
    
    if (!clientEmail || !privateKeyEnv) {
      throw new Error('Missing Google Credentials in Supabase Secrets');
    }

    // Fix multiline string issue if needed
    const privateKey = privateKeyEnv.replace(/\\n/g, '\n');

    // Generate JWT for Google OAuth2
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const pkcs8 = await importPKCS8(privateKey, 'RS256');

    const jwt = await new SignJWT({
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/calendar.events',
    })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .sign(pkcs8);

    // Get Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Token Error:', tokenData);
      throw new Error('Failed to obtain Google Access Token');
    }

    const accessToken = tokenData.access_token;

    // Calendar to use
    const calendarId = operatorEmail || Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';

    // Use the permanent Meet link provided by the user
    const meetLink = "https://meet.google.com/ofb-gcng-fvb";

    const eventBody = {
      summary: `Reserva: ${name} - ${serviceRequired}`,
      description: `
        CLIENTE: ${name}
        EMAIL: ${email}
        TELÉFONO: ${phone}
        SERVICIO: ${serviceRequired}
        LINK REUNIÓN: ${meetLink}
      `.trim(),
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      }
    };

    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    const eventData = await calendarResponse.json();

    if (!calendarResponse.ok) {
      console.error('Google API Error:', eventData);
      return new Response(
        JSON.stringify({ error: "Error al crear el evento en Google Calendar", details: eventData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Evento creado con éxito. Usando link fijo:', meetLink);

    // Send confirmation emails via Brevo
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (BREVO_API_KEY) {
      try {
        const emailPayload = {
          sender: { name: "Auténticos", email: "hola@autenticos.co" },
          to: [
            { email: email, name: name }, // To client
            { email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" } // To Felipe
          ],
          subject: `Confirmación de Cita: ${serviceRequired}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #2D3748; text-align: center;">¡Cita Confirmada!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Tu sesión de <strong>${serviceRequired}</strong> ha sido agendada correctamente.</p>
              <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (Hora Colombia)</p>
                <p style="margin: 5px 0;"><strong>💻 Reunión (Google Meet):</strong> <a href="${meetLink}" style="color: #3182CE;">Entrar a la sesión</a></p>
              </div>
              <p style="font-size: 0.9em; color: #718096; text-align: center;">Te recomendamos conectarte 5 minutos antes de la hora acordada.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="text-align: center;">Saludos,<br /><strong>Equipo Auténticos</strong></p>
            </div>
          `
        };

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify(emailPayload)
        });
      } catch (emailError) {
        console.error('Error enviando correos:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        event: eventData,
        meetLink: meetLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
