import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts';

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
    const { name, email, phone, serviceRequired, guests, startTime, endTime, operatorEmail, clientTimeZone, remainingSessions, totalSessions, magicToken, modality } = body;
    const tz = clientTimeZone || 'America/Bogota';
    const isVirtual = modality !== 'presencial';

    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    let privateKeyEnv = Deno.env.get('GOOGLE_PRIVATE_KEY');
    
    if (!clientEmail || !privateKeyEnv) {
      throw new Error('Missing Google Credentials in Supabase Secrets');
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
    const calendarId = operatorEmail || Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';
    const meetLink = "https://meet.google.com/ofb-gcng-fvb";
    
    const wpMessage = encodeURIComponent("Hola Felipe, he agendado una mentoría presencial y me comunico para coordinar el lugar.");
    const whatsappLink = `https://wa.me/573153514590?text=${wpMessage}`;

    const connectionInfo = isVirtual 
      ? `LINK REUNIÓN: ${meetLink}`
      : `LUGAR: A coordinar vía WhatsApp. Cliente debe contactar a: ${whatsappLink}`;

    const eventBody = {
      summary: `Mentoría: ${name} - ${serviceRequired}`,
      description: `
        CLIENTE: ${name}
        EMAIL: ${email}
        TELÉFONO: ${phone}
        SERVICIO: ${serviceRequired}
        MODALIDAD: ${isVirtual ? 'Virtual' : 'Presencial'}
        ${connectionInfo}
      `.trim(),
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      ...(!isVirtual && { location: 'Lugar a coordinar con Felipe' })
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
      return new Response(
        JSON.stringify({ error: "Error al crear el evento", details: eventData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (BREVO_API_KEY) {
      try {
        const clientRecipients = [{ email: email, name: name }];
        if (guests) {
          const guestList = guests.split(',').map((g: string) => g.trim()).filter((g: string) => g);
          guestList.forEach((guestEmail: string) => {
            clientRecipients.push({ email: guestEmail, name: "Invitado" });
          });
        }

        const formatICSDate = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const meetingText = isVirtual ? `Enlace de la reunión: ${meetLink}` : `Contacto para coordinar lugar: ${whatsappLink}`;
        const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mentoría: ${serviceRequired}`)}&dates=${formatICSDate(startTime)}/${formatICSDate(endTime)}&details=${encodeURIComponent(meetingText)}`;

        // Guardar el evento en Supabase para permitir reagendamiento
        let rescheduleToken = null;
        try {
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: dbData, error: dbError } = await supabase
            .from('mentorship_events')
            .insert([{
              google_event_id: eventData.id,
              client_email: email,
              client_name: name,
              service_title: serviceRequired,
              start_time: startTime,
              end_time: endTime
            }])
            .select('reschedule_token')
            .single();

          if (dbError) throw dbError;
          rescheduleToken = dbData.reschedule_token;
        } catch (dbErr) {
          console.error('Error saving event to database:', dbErr);
        }

        const rescheduleUrl = rescheduleToken ? `https://mentorias.autenticos.co/reprogramar/${rescheduleToken}` : '';

        let magicLinkSection = "";
        if (remainingSessions !== undefined && remainingSessions > 0) {
            const agendarUrl = `https://mentorias.autenticos.co/agendar-paquete/${magicToken}`;
            magicLinkSection = `
              <div style="background: #FFFBEB; border-left: 4px solid #D69E2E; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #975A16; margin-top: 0;">¡Tienes sesiones disponibles!</h3>
                <p>Te quedan <strong>${remainingSessions}</strong> sesión(es) de tu paquete de ${totalSessions}.</p>
                <p>Cuando estés listo para agendar tu próxima mentoría, usa tu enlace mágico (guárdalo bien y no lo compartas):</p>
                <a href="${agendarUrl}" style="display: inline-block; background-color: #D69E2E; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; margin-top: 10px;">Agendar próxima sesión</a>
              </div>
            `;
        }

        const clientEmailPayload = {
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: clientRecipients,
          subject: `Confirmación de Mentoría: ${serviceRequired}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #2D3748; text-align: center;">¡Mentoría Confirmada!</h2>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Tu mentoría de <strong>${serviceRequired}</strong> ha sido agendada correctamente.</p>
              <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz })} (${tz === 'America/Bogota' ? 'Hora Colombia' : 'Tu hora local'})</p>
                ${isVirtual 
                  ? `<p style="margin: 5px 0;"><strong>💻 Reunión (Google Meet):</strong> <a href="${meetLink}" style="color: #3182CE;">Entrar a la sesión</a></p>`
                  : `<p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> Presencial (Cali)</p>
                     <p style="margin: 15px 0 5px 0;">Haz clic en el botón para coordinar el lugar exacto con Felipe:</p>
                     <a href="${whatsappLink}" style="display: inline-block; background-color: #25D366; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">Contactar por WhatsApp</a>`
                }
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${gCalLink}" target="_blank" style="display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 0 5px;">Añadir a Google Calendar</a>
              </div>

              ${rescheduleUrl ? `
              <div style="text-align: center; margin: 25px 0; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="color: #718096; font-size: 0.95em; margin-bottom: 15px;">¿Ocurrió un imprevisto? Puedes reprogramar tu cita de forma automática usando el siguiente botón:</p>
                <a href="${rescheduleUrl}" style="display: inline-block; background-color: #EDF2F7; color: #2D3748; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; border: 1px solid #CBD5E0;">Reprogramar Cita</a>
              </div>
              ` : ''}

              ${magicLinkSection}

              <p style="font-size: 0.9em; color: #718096; text-align: center;">Te recomendamos conectarte 5 minutos antes de la hora acordada.</p>
            </div>
          `
        };

        let magicLinkSectionAdmin = "";
        if (remainingSessions !== undefined) {
            magicLinkSectionAdmin = `
              <div style="background: #FFFBEB; border-left: 4px solid #D69E2E; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #975A16; margin-top: 0;">Detalles del Paquete</h3>
                <p>Este agendamiento hace parte de un paquete de <strong>${totalSessions || 'varias'} sesiones</strong>.</p>
                <p style="margin-bottom: 0;"><strong>Sesiones pendientes por agendar:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #D69E2E;">${remainingSessions}</span></p>
              </div>
            `;
        }

        const adminEmailPayload = {
          sender: { name: "Auténticos Notifications", email: "contacto@autenticos.co" },
          to: [{ email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" }],
          subject: `NUEVA MENTORÍA: ${name} - ${serviceRequired}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #2D3748; text-align: center;">¡Nueva Mentoría Recibida!</h2>
              <p>Hola <strong>Felipe</strong>,</p>
              <p>Tienes un nuevo agendamiento de <strong>${serviceRequired}</strong> por parte de <strong>${name}</strong>.</p>
              
              <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #3182CE;">${email}</a></p>
                <p style="margin: 5px 0;"><strong>📱 Teléfono:</strong> ${phone}</p>
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Bogota' })}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })} (Hora Colombia)</p>
                <p style="margin: 5px 0;"><strong>📍 Modalidad:</strong> ${isVirtual ? 'Virtual' : 'Presencial'}</p>
                ${isVirtual 
                  ? `<p style="margin: 5px 0;"><strong>💻 Reunión (Google Meet):</strong> <a href="${meetLink}" style="color: #3182CE;">Entrar a la sesión</a></p>`
                  : `<p style="margin: 5px 0;"><strong>💬 Contacto Cliente (WhatsApp):</strong> El cliente deberá contactarte al celular o puedes escribirle a <a href="https://wa.me/57${phone.replace(/\D/g, '')}" style="color: #25D366;">${phone}</a></p>`
                }
              </div>

              ${magicLinkSectionAdmin}
              
              <p style="font-size: 0.9em; color: #718096; text-align: center;">El evento ya fue agregado a tu Google Calendar principal.</p>
            </div>
          `
        };

        const welcomeEmailPayload = {
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: [{ email: email, name: name }],
          subject: "Bienvenido a tu proceso de mentoría con Auténticos",
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; color: #333; line-height: 1.6;">
              <p>Hola, <strong>${name}</strong>.</p>
              
              <p>Qué bueno tenerte por aquí.</p>
              <p>Desde este momento comienza tu proceso de mentoría con Auténticos. La idea es que aprovechemos cada conversación para ganar claridad, comprender mejor lo que estás viviendo, tomar decisiones y convertirlas en acciones concretas.</p>
              
              <p>Antes de nuestra primera sesión quiero pedirte algo importante: completa tu <strong>Punto de partida</strong>. Este formulario me permitirá conocerte un poco mejor, entender qué quieres trabajar y llegar preparado a nuestra conversación.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mentorias.autenticos.co/punto-de-partida" style="display: inline-block; background-color: #D69E2E; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Completa tu Punto de partida aquí</a>
              </div>
              
              <p>Te recomiendo hacerlo con calma y honestidad. No necesitas tener todas las respuestas ni escribir demasiado.</p>
              
              <p>Nos vemos pronto.<br>
              Un abrazo,<br>
              <strong>Felipe Beltrán Hernández</strong><br>
              Auténticos</p>
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
          }),
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify(welcomeEmailPayload)
          })
        ]);
      } catch (emailError) {
        console.error('Error enviando correos:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, event: eventData, meetLink: meetLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
