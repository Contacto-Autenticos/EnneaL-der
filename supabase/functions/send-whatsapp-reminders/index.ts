import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Cors headers
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
    // 1. Obtenemos el tipo de recordatorio del body de la petición
    const body = await req.json().catch(() => ({}));
    const reminderType = body.type || 'now'; // por defecto enviamos el de "en vivo" si no se especifica

    // 2. Obtenemos las credenciales de Green API
    const idInstance = Deno.env.get('GREENAPI_ID_INSTANCE');
    const apiToken = Deno.env.get('GREENAPI_TOKEN');
    const host = Deno.env.get('GREENAPI_HOST') || 'api.green-api.com';
    
    if (!idInstance || !apiToken) {
      throw new Error("Faltan las credenciales de Green API");
    }

    // 3. Definimos el ID del grupo y el link
    const chatId = "120363427746764541@g.us"; 
    const meetLink = "https://meet.google.com/wem-qaey-evw"; 
    
    // Bloqueo temporal para el 23 de julio de 2026 (evento reprogramado)
    if (['24h', '6h', '2h', '10m', 'now'].includes(reminderType)) {
      // Ajustar la zona horaria a GMT-5 (Colombia/Ecuador/Perú) para validar la fecha localmente
      const isToday = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().startsWith('2026-07-23');
      if (isToday) {
        return new Response(
          JSON.stringify({ success: true, message: "Envío cancelado para hoy (evento reprogramado)" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // 4. Seleccionamos el mensaje según el tipo
    let textMessage = "";
    
    switch (reminderType) {
      case '24h':
        textMessage = `¡Hola a todos! 👋 Les recordamos que mañana a esta misma hora (7:30 PM) tendremos nuestra charla sobre "¿Por qué no todas las técnicas de desarrollo personal y liderazgo sirven para todo el mundo?". Ve preparando tus preguntas y un lugar tranquilo. ¡Nos vemos pronto!`;
        break;
      case '6h':
        textMessage = `¡Faltan solo 6 horas! ⏳ Hoy a las 7:30 PM nos conectamos. Prepárate para descubrir ¿Por qué no todas las técnicas de desarrollo personal y liderazgo sirven para todo el mundo?.`;
        break;
      case '2h':
        textMessage = `¡Ya casi! 🚀 En 2 horas empezamos nuestra sesión exclusiva donde hablaremos sobre ¿Por qué no todas las técnicas de desarrollo personal y liderazgo sirven para todo el mundo?. Ve alistando todo, recuerda que nos conectaremos por Google Meet.\n\nAquí tienes el enlace para que lo tengas a la mano:\n${meetLink}`;
        break;
      case '10m':
        textMessage = `¡Atención! 🚨 En 10 minutos abrimos la sala. Ve ingresando para asegurarte de que tu audio y video funcionen bien.\n\nAquí tienes el enlace para unirte:\n${meetLink}`;
        break;
      case 'now':
      default:
        textMessage = `¡ESTAMOS EN VIVO! 🔴 Ya dimos inicio a la Sesión Informativa. Entra ahora mismo para que no te pierdas ninguna de las herramientas que compartiremos.\n\nÚnete aquí:\n${meetLink}`;
        break;
    }

    // 5. Hacemos la petición POST a Green API
    const url = `https://${host}/waInstance${idInstance}/sendMessage/${apiToken}`;
    console.log(`Enviando recordatorio tipo [${reminderType}] al grupo: ${chatId}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        message: textMessage
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
       throw new Error(`Error de Green API: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, type: reminderType, greenapi_response: result }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error enviando recordatorio:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
