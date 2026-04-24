import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, unit_price, user_email, reference, back_url_custom } = await req.json();

    const origin = req.headers.get("origin") || "https://enesencia.autenticos.co";
    const defaultBackUrl = `${origin}/dominios-payment-status`;
    const finalBackUrl = back_url_custom || defaultBackUrl;

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: reference,
            title: title,
            unit_price: unit_price,
            quantity: 1,
            currency_id: "COP",
          }
        ],
        external_reference: reference,
        back_urls: {
          success: `${finalBackUrl}?status=approved`,
          failure: `${finalBackUrl}?status=failure`,
          pending: `${finalBackUrl}?status=pending`,
        },
        auto_return: "approved",
        payer: {
          email: user_email
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Mercado Pago:", data);
      return new Response(JSON.stringify({ error: data.message || "Error en Mercado Pago", detail: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ id: data.id, init_point: data.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error en la función create-mp-preference:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
