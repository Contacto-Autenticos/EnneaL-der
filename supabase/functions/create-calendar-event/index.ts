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

    // Re-enable Google Meet but keep attendees empty to avoid 403 error
    const eventBody = {
      summary: `Reserva: ${name}`,
      description: `
        CLIENTE: ${name}
        EMAIL: ${email}
        TELÉFONO: ${phone}
        SERVICIO: ${serviceRequired}
      `.trim(),
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    };

    // Use conferenceDataVersion=1 to enable Meet link generation
    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`, {
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
        JSON.stringify({ error: "Error al crear evento con Meet", details: eventData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract Meet link from response
    const meetLink = eventData.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri || eventData.hangoutLink;

    console.log('Evento creado con éxito. Link de Meet:', meetLink);

    // Send confirmation emails via Brevo
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (BREVO_API_KEY) {
      try {
        const emailPayload = {
          sender: { name: "Auténticos", email: "hola@autenticos.co" },
          to: [
            { email: email, name: name }, // Al cliente
            { email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" } // A Felipe
          ],
          subject: `Confirmación de Cita: ${serviceRequired}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #333;">¡Cita Agendada con Éxito!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Tu cita para <strong>${serviceRequired}</strong> ha sido confirmada.</p>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <p><strong>Detalles de la reunión:</strong></p>
              <ul>
                <li><strong>Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (Hora Colombia)</li>
                <li><strong>Link de Google Meet:</strong> <a href="${meetLink}">${meetLink}</a></li>
              </ul>
              <p>Si tienes alguna duda, puedes contactarnos respondiendo a este correo.</p>
              <br />
              <p>Saludos,<br /><strong>Equipo Auténticos</strong></p>
            </div>
          `
        };

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify(emailPayload)
        });

        if (brevoResponse.ok) {
          console.log('Correos de confirmación enviados correctamente');
        } else {
          const brevoError = await brevoResponse.json();
          console.error('Error al enviar correos por Brevo:', brevoError);
        }
      } catch (emailError) {
        console.error('Error en el proceso de envío de correos:', emailError);
      }
    } else {
      console.warn('BREVO_API_KEY no configurada. No se enviaron correos.');
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
