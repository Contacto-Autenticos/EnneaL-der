import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getEmailHTML = (firstName: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); background-color: #ffffff;">
  <h2 style="color: #2D3748; text-align: center; margin-bottom: 25px; font-size: 22px;">Nos vemos este jueves: Por qué no todas las técnicas funcionan para todos</h2>

  <p style="font-size: 16px; color: #4A5568;">Hola <strong>${firstName}</strong>,</p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Sabemos que tienes un interés en tu propio desarrollo personal. Pero siendo honestos, el ritmo del día a día a veces nos pasa por encima y terminamos posponiendo esos espacios que son solo para nosotros. Es completamente normal.</p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Por eso, queremos invitarte a hacer una pausa con nosotros. Este <strong>jueves a las 7:30 PM (Hora Colombia)</strong>, tendremos una sesión en vivo muy especial.</p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">En este espacio no solo compartiremos los detalles del Master Live Training, sino que hablaremos de un tema muy revelador: <strong>¿Por qué no todas las técnicas de desarrollo personal y liderazgo sirven para todo el mundo?</strong></p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Para que no tengas que estar pendiente del correo, hemos creado un grupo exclusivo en WhatsApp. Por ahí te enviaremos el enlace directo de la videollamada unos minutos antes de empezar, sin ruido ni saturación.</p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Haz clic aquí abajo para unirte y asegurar tu lugar:</p>
  
  <div style="text-align: center; margin: 35px 0;">
    <a href="https://chat.whatsapp.com/BlyxWFUfGYL6b5sYAuyf8E?s=sw&p=a&ilr=0" target="_blank" style="display: inline-block; background-color: #25D366; color: white; text-decoration: none; padding: 16px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.2);">
      UNIRME AL GRUPO DE WHATSAPP
    </a>
  </div>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Nos vemos el jueves, será un espacio muy valioso.</p>
  
  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">Un abrazo,<br />Equipo Auténticos</p>
</div>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { users } = await req.json();
    if (!users || !Array.isArray(users)) {
      throw new Error("Missing users array in request body");
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("Missing BREVO_API_KEY");
    }

    let successCount = 0;
    const errors = [];

    for (const user of users) {
      const firstName = user.name.split(' ')[0];
      const payload = {
        sender: { name: "Auténticos", email: "contacto@autenticos.co" },
        to: [{ email: user.email.trim(), name: firstName }],
        subject: `${firstName}, nos vemos este jueves: Por qué no todas las técnicas funcionan para todos`,
        htmlContent: getEmailHTML(firstName)
      };

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        errors.push({ email: user.email, error: errText });
      } else {
        successCount++;
      }
      
      // Add a small delay to respect API rate limits
      await new Promise(r => setTimeout(r, 150));
    }

    return new Response(
      JSON.stringify({ success: true, message: `Sent ${successCount} emails`, errors }),
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
