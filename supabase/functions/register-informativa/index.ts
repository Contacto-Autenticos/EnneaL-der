import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { name, email, phone, startTime, endTime, clientTimeZone } = body;
    const tz = clientTimeZone || 'America/Bogota';

    const meetLink = "https://meet.google.com/wem-qaey-evw";
    const serviceName = "Sesión Informativa MLT";

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("Missing BREVO_API_KEY");
    }

    const formatICSDate = (dateStr: string) => new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName)}&dates=${formatICSDate(startTime)}/${formatICSDate(endTime)}&details=${encodeURIComponent(`Enlace de la reunión: ${meetLink}`)}`;
    const outlookLink = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(serviceName)}&startdt=${new Date(startTime).toISOString()}&enddt=${new Date(endTime).toISOString()}&body=${encodeURIComponent(`Enlace de la reunión: ${meetLink}`)}`;

    const clientEmailPayload = {
      sender: { name: "Auténticos", email: "contacto@autenticos.co" },
      to: [{ email: email, name: name }],
      subject: `Confirmación de Registro: ${serviceName}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2D3748; text-align: center;">¡Registro Confirmado!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu cupo para la <strong>${serviceName}</strong> ha sido reservado correctamente.</p>
          <div style="background: #F7FAFC; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(startTime).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })}</p>
            <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz })} (${tz === 'America/Bogota' ? 'Hora Colombia' : 'Tu hora local'})</p>
            <p style="margin: 5px 0;"><strong>💻 Reunión (Google Meet):</strong> <a href="${meetLink}" style="color: #3182CE;">Entrar a la sesión</a></p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <p style="font-size: 0.9em; color: #4A5568; margin-bottom: 15px;">Añade este evento a tu calendario para no olvidarlo:</p>
            <a href="${gCalLink}" target="_blank" style="display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 0 5px;">Añadir a Google Calendar</a>
            <a href="${outlookLink}" target="_blank" style="display: inline-block; background-color: #0078D4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 0.9em; margin: 0 5px;">Añadir a Outlook</a>
          </div>

          <p style="font-size: 0.9em; color: #718096; text-align: center;">Te recomendamos conectarte 5 minutos antes de la hora acordada. ¡Te esperamos!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="text-align: center;">Saludos,<br /><strong>Equipo Auténticos</strong></p>
        </div>
      `
    };

    const adminEmailPayload = {
      sender: { name: "Auténticos Notifications", email: "contacto@autenticos.co" },
      to: [{ email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" }],
      subject: `NUEVO REGISTRO INFORMATIVA: ${name}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fff;">
          <h2 style="color: #2b6cb0;">Nuevo Registro - Sesión Informativa MLT</h2>
          <p>Hola <strong>Felipe</strong>,</p>
          <p>Alguien se ha registrado para la sesión informativa grupal.</p>
          
          <div style="background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> ${phone}</p>
            <p style="margin: 5px 0;"><strong>📅 Para el día:</strong> ${new Date(startTime).toLocaleString('es-ES', { timeZone: 'America/Bogota' })} (Hora Col)</p>
          </div>
          
          <p style="font-size: 0.85em; color: #718096;">Este es un mensaje automático del sistema de registros.</p>
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

    return new Response(
      JSON.stringify({ success: true, message: "Correo enviado" }),
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
