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
    const body = await req.json().catch(() => ({}));
    
    // 1. Obtenemos el chatId y el mensaje dinámico del body
    const chatId = body.chatId;
    const textMessage = body.message;

    if (!chatId || !textMessage) {
        throw new Error("Falta el 'chatId' o el 'message' en la petición.");
    }

    // 2. Obtenemos las credenciales de Green API
    const idInstance = Deno.env.get('GREENAPI_ID_INSTANCE');
    const apiToken = Deno.env.get('GREENAPI_TOKEN');
    const host = Deno.env.get('GREENAPI_HOST') || 'api.green-api.com';
    
    if (!idInstance || !apiToken) {
      throw new Error("Faltan las credenciales de Green API en Supabase.");
    }

    // 3. Hacemos la petición POST a Green API
    const url = `https://${host}/waInstance${idInstance}/sendMessage/${apiToken}`;
    console.log(`Enviando mensaje al grupo: ${chatId}`);

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
      JSON.stringify({ success: true, greenapi_response: result }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error enviando mensaje:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
