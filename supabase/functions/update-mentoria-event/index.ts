import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { rescheduleToken, startTime, endTime, clientTimeZone } = body;
    const tz = clientTimeZone || 'America/Bogota';

    if (!rescheduleToken || !startTime || !endTime) {
      throw new Error('Faltan parámetros requeridos.');
    }

    // 1. Fetch event from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: eventRecord, error: dbError } = await supabase
      .from('mentorship_events')
      .select('*')
      .eq('reschedule_token', rescheduleToken)
      .single();

    if (dbError || !eventRecord) {
      throw new Error('El link de reagendamiento es inválido o expiró.');
    }

    const { google_event_id, client_email, client_name, service_title } = eventRecord;

    // 2. Auth to Google Calendar
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    let privateKeyEnv = Deno.env.get('GOOGLE_PRIVATE_KEY');
    
    if (!clientEmail || !privateKeyEnv) {
      throw new Error('Missing Google Credentials');
    }
    const privateKey = privateKeyEnv.replace(/\\n/g, '\n');

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

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain Google Access Token');
    }

    const accessToken = tokenData.access_token;
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';

    // 3. Update Event in Google Calendar
    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(google_event_id)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start: { dateTime: startTime },
        end: { dateTime: endTime }
      })
    });

    if (!calendarResponse.ok) {
      const errData = await calendarResponse.json();
      throw new Error('Error al actualizar el evento en Google Calendar: ' + JSON.stringify(errData));
    }

    // 4. Update Event in Supabase
    await supabase
      .from('mentorship_events')
      .update({
        start_time: startTime,
        end_time: endTime
      })
      .eq('reschedule_token', rescheduleToken);

    // 5. Send Emails via Brevo
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (BREVO_API_KEY) {
      try {
        const rescheduleUrl = `https://mentorias.autenticos.co/reprogramar/${rescheduleToken}`;
        
        const formatICSDate = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mentoría Reagendada: ${service_title}`)}&dates=${formatICSDate(startTime)}/${formatICSDate(endTime)}`;

        const clientEmailPayload = {
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: [{ email: client_email, name: client_name }],
          subject: `Actualización: Tu Mentoría ha sido Reagendada`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2D3748; text-align: center;">Mentoría Reagendada Exitosamente</h2>
              <p>Hola <strong>${client_name}</strong>,</p>
              <p>Has reprogramado exitosamente tu sesión de <strong>${service_title}</strong>.</p>
              <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Nueva Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })}</p>
                <p style="margin: 5px 0;"><strong>⏰ Nueva Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz })} (${tz === 'America/Bogota' ? 'Hora Colombia' : 'Tu hora local'})</p>
              </div>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${gCalLink}" target="_blank" style="display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 0 5px;">Añadir al Calendario</a>
              </div>
            </div>
          `
        };

        const adminEmailPayload = {
          sender: { name: "Auténticos Notifications", email: "contacto@autenticos.co" },
          to: [{ email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" }],
          subject: `REAGENDAMIENTO: ${client_name} - ${service_title}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2D3748; text-align: center;">¡Un cliente ha reagendado!</h2>
              <p>El cliente <strong>${client_name}</strong> ha modificado la fecha de su mentoría de <strong>${service_title}</strong>.</p>
              <div style="background: #FFFBEB; border-left: 4px solid #D69E2E; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Nueva Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Bogota' })}</p>
                <p style="margin: 5px 0;"><strong>⏰ Nueva Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })} (Hora Colombia)</p>
                <p style="margin: 5px 0;"><strong>📧 Cliente:</strong> ${client_email}</p>
              </div>
              <p style="font-size: 0.9em; color: #718096; text-align: center;">Tu Google Calendar ya fue actualizado automáticamente con el nuevo horario.</p>
            </div>
          `
        };

        await Promise.all([
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify(clientEmailPayload)
          }),
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify(adminEmailPayload)
          })
        ]);
      } catch (emailError) {
        console.error('Error enviando correos de reagendamiento:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
