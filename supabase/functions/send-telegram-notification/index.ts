import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_type, details } = await req.json()

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      console.error("Missing Telegram configuration.")
      return new Response(
        JSON.stringify({ error: "Telegram configuration missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    let message = "🔔 *Nueva Notificación*\n\n";

    if (event_type === 'free_test') {
      message = `🟢 *Test Básico Finalizado*\n\n` +
                `👤 Nombre: ${details.name || 'Desconocido'}\n` +
                `📧 Correo: ${details.email || 'Desconocido'}\n` +
                `🎯 Resultado: ${details.enneatype || 'No definido'}`
    } else if (event_type === 'advanced_test_purchase') {
      message = `💰 *Compra: Análisis Avanzado*\n\n` +
                `👤 Cliente: ${details.email || 'Desconocido'}\n` +
                `💵 Monto: $${details.amount || '0'} COP\n` +
                `🧾 Ref: ${details.reference || 'N/A'}`
    } else if (event_type === 'dominios_purchase') {
      message = `🏢 *Compra: Autodiagnóstico 6 Dominios*\n\n` +
                `👤 Cliente: ${details.email || 'Desconocido'}\n` +
                `💵 Monto: $${details.amount || '0'} COP\n` +
                `🧾 Ref: ${details.reference || 'N/A'}`
    } else if (event_type === 'workshop_inscription') {
      message = `🎟️ *Inscripción a Taller*\n\n` +
                `👤 Cliente: ${details.email || 'Desconocido'}\n` +
                `💵 Monto: $${details.amount || '0'} COP\n` +
                `🧾 Ref: ${details.reference || 'N/A'}`
    } else {
      message += JSON.stringify(details, null, 2);
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    })

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram API error: ${err}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
