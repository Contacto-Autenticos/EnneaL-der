import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const buildEmailHTML = (title: string, message: string, name: string, serviceName: string, startTime: string, tz: string, meetLink: string, gCalLink: string, outlookLink: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <h2 style="color: #2D3748; text-align: center;">${title}</h2>
    <p>Hola <strong>${name}</strong>,</p>
    <p>${message}</p>
    <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })}</p>
      <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz })} (${tz === 'America/Bogota' ? 'Hora Colombia' : 'Tu hora local'})</p>
      <p style="margin: 5px 0;"><strong>💻 Reunión (Google Meet):</strong> <a href="${meetLink}" style="color: #3182CE;">Entrar a la sesión</a></p>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <p style="font-size: 0.9em; color: #4A5568; margin-bottom: 15px;">Añade este evento a tu calendario para no olvidarlo:</p>
      <a href="${gCalLink}" target="_blank" style="display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 5px;">Añadir a Google Calendar</a>
      <a href="${outlookLink}" target="_blank" style="display: inline-block; background-color: #0078D4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 5px;">Añadir a Outlook</a>
    </div>

    <p style="font-size: 0.9em; color: #718096; text-align: center;">Te recomendamos conectarte 5 minutos antes de la hora acordada. ¡Te esperamos!</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="text-align: center;">Saludos,<br /><strong>Equipo Auténticos</strong></p>
  </div>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) throw new Error("Missing BREVO_API_KEY");

    // 1. Obtener registros de sesiones informativas
    const { data: registrations, error: dbError } = await supabaseClient
      .from('workshop_registrations')
      .select('id, full_name, email, phone, raw_data')
      .eq('workshop_name', 'Sesión Informativa MLT Grupal');

    if (dbError) throw dbError;

    const nowMs = Date.now();
    const fetchPromises = [];
    const updates = [];

    const meetLink = "https://meet.google.com/wem-qaey-evw";
    const serviceName = "Sesión Informativa MLT";

    for (const reg of registrations || []) {
      const raw = reg.raw_data || {};
      const { session_date, reminders } = raw;
      if (!session_date || !reminders) continue;

      const startMs = new Date(session_date).getTime();
      const timeLeft = startMs - nowMs;
      
      let r24h = reminders.r24h;
      let r2h = reminders.r2h;
      let r10m = reminders.r10m;
      let emailToSend = null;

      // Determinar qué correo enviar
      if (!r24h && timeLeft <= 24 * 60 * 60 * 1000 && timeLeft > 2 * 60 * 60 * 1000) {
        emailToSend = '24h';
        r24h = true;
      } else if (!r2h && timeLeft <= 2 * 60 * 60 * 1000 && timeLeft > 10 * 60 * 1000) {
        emailToSend = '2h';
        r2h = true;
        r24h = true; // Omitir 24h si entramos en ventana de 2h
      } else if (!r10m && timeLeft <= 10 * 60 * 1000 && timeLeft > 0) {
        emailToSend = '10m';
        r10m = true;
        r2h = true;
        r24h = true;
      }

      // Si la sesión ya pasó, marcar todos como enviados para no reevaluar
      if (timeLeft <= 0 && (!r24h || !r2h || !r10m)) {
        r24h = true; r2h = true; r10m = true;
      }

      // Preparar envío de correo si aplica
      if (emailToSend) {
        const formatICSDate = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const endMs = startMs + 45 * 60000;
        const endTime = new Date(endMs).toISOString();
        const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName)}&dates=${formatICSDate(session_date)}/${formatICSDate(endTime)}&details=${encodeURIComponent(`Enlace de la reunión: ${meetLink}`)}`;
        const outlookLink = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(serviceName)}&startdt=${new Date(session_date).toISOString()}&enddt=${new Date(endTime).toISOString()}&body=${encodeURIComponent(`Enlace de la reunión: ${meetLink}`)}`;
        const tz = 'America/Bogota';

        let subject = "";
        let title = "";
        let message = "";

        if (emailToSend === '24h') {
          subject = `Recordatorio: Falta 1 día para la ${serviceName}`;
          title = "¡Falta 1 día para nuestra Sesión Informativa!";
          message = `Te recordamos que mañana es nuestra <strong>${serviceName}</strong>. ¡No te la pierdas!`;
        } else if (emailToSend === '2h') {
          subject = `¡Nos vemos en 2 horas! - ${serviceName}`;
          title = "¡Nos vemos en 2 horas!";
          message = `Estamos a tan solo 2 horas de iniciar nuestra <strong>${serviceName}</strong>. Ten listo todo para conectarte.`;
        } else if (emailToSend === '10m') {
          subject = `🔴 ¡Estamos a punto de empezar! - ${serviceName}`;
          title = "¡Estamos a punto de empezar!";
          message = `La <strong>${serviceName}</strong> inicia en 10 minutos. Haz clic en el enlace para entrar a la sala.`;
        }

        const payload = {
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: [{ email: reg.email, name: reg.full_name }],
          subject: subject,
          htmlContent: buildEmailHTML(title, message, reg.full_name, serviceName, session_date, tz, meetLink, gCalLink, outlookLink)
        };

        fetchPromises.push(
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify(payload)
          })
        );
      }

      // Si cambió algún flag, actualizar BD
      if (r24h !== reminders.r24h || r2h !== reminders.r2h || r10m !== reminders.r10m) {
        updates.push(
          supabaseClient.from('workshop_registrations').update({
            raw_data: { ...raw, reminders: { r24h, r2h, r10m } }
          }).eq('id', reg.id)
        );
      }
    }

    // Ejecutar envíos y actualizaciones
    if (fetchPromises.length > 0) {
      const emailRes = await Promise.all(fetchPromises);
      for (const res of emailRes) {
        if (!res.ok) console.error("Error from Brevo:", await res.text());
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: registrations?.length || 0,
        emailsSent: fetchPromises.length,
        dbUpdates: updates.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cron Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
