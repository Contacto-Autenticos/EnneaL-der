import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Odoo RPC Helper
async function odooCall(url: string, service: string, method: string, args: any[]) {
  const response = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service,
        method,
        args
      },
      id: Math.floor(Math.random() * 1000)
    })
  });

  const res = await response.json();
  if (res.error) {
    throw new Error(`Odoo Error (${service}/${method}): ${JSON.stringify(res.error)}`);
  }
  return res.result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, test_type, results_summary, scores } = await req.json();

    let ODOO_URL = Deno.env.get('ODOO_URL')?.trim() || '';
    const ODOO_DB = Deno.env.get('ODOO_DB')?.trim() || '';
    const ODOO_USER = Deno.env.get('ODOO_USER')?.trim() || '';
    const ODOO_API_KEY = Deno.env.get('ODOO_API_KEY')?.trim() || '';

    // Normalize URL: remove trailing slash if exists
    if (ODOO_URL.endsWith('/')) {
      ODOO_URL = ODOO_URL.slice(0, -1);
    }

    if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY) {
      throw new Error('Faltan configuraciones de Odoo en Supabase Secrets');
    }

    console.log(`Iniciando integración Odoo para: ${email} (${test_type})`);

    // 1. Authenticate
    const uid = await odooCall(ODOO_URL, "common", "authenticate", [
      ODOO_DB, ODOO_USER, ODOO_API_KEY, {}
    ]);

    if (!uid) {
      throw new Error('Autenticación fallida en Odoo. Revisa el usuario y el API Key.');
    }

    // 2. Search for Partner
    const partnerIds = await odooCall(ODOO_URL, "object", "execute_kw", [
      ODOO_DB, uid, ODOO_API_KEY, "res.partner", "search",
      [[["email", "=", email]]]
    ]);

    let partnerId = partnerIds[0];

    if (!partnerId) {
      // 3. Create Partner if not exists
      partnerId = await odooCall(ODOO_URL, "object", "execute_kw", [
        ODOO_DB, uid, ODOO_API_KEY, "res.partner", "create",
        [{
          name: name || email,
          email: email,
          comment: `Creado automáticamente desde la App de Autodiagnóstico (${test_type})`
        }]
      ]);
      console.log(`Nuevo contacto creado en Odoo: ${partnerId}`);
    } else {
      console.log(`Contacto existente encontrado en Odoo: ${partnerId}`);
    }

    // 4. Create Lead in CRM
    const leadId = await odooCall(ODOO_URL, "object", "execute_kw", [
      ODOO_DB, uid, ODOO_API_KEY, "crm.lead", "create",
      [{
        name: `${test_type}: ${name || email}`,
        partner_id: partnerId,
        email_from: email,
        description: `
RESULTADOS DEL TEST: ${test_type}
USUARIO: ${name}
EMAIL: ${email}

RESUMEN:
${results_summary}

PUNTAJES:
${Object.entries(scores || {}).map(([k, v]) => `- ${k.toUpperCase()}: ${v}`).join('\n')}
        `.trim(),
        type: 'opportunity', // 'lead' or 'opportunity'
        priority: '2', // Medium priority
        tag_ids: [] // Could search/create tags like 'Autodiagnóstico'
      }]
    ]);

    console.log(`Oportunidad creada en Odoo CRM: ${leadId}`);

    return new Response(JSON.stringify({ success: true, lead_id: leadId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error en odoo-integration:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
