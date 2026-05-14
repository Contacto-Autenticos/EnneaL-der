import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to generate styled HTML email
function getEmailHtml(userName: string, companyName: string, contentHtml: string, isClient = false) {
  const greeting = isClient ? `¡Gracias, ${userName}!` : `Nuevo Diagnóstico: ${companyName}`;
  const mainMessage = isClient 
    ? `Hemos recibido tu diagnóstico completo para <strong>${companyName}</strong>. Nuestros consultores están analizando las brechas y desafíos que mencionaste para preparar una sesión de diagnóstico personalizada.`
    : `Se ha recibido un nuevo escaneo empresarial completo con la siguiente información detallada:`;

  return `
    <html lang="es">
    <body style="margin:0;padding:0;font-family: Arial, sans-serif;">
    <table style="background-color:#eaf2f6;padding:40px 20px;" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tbody>
    <tr>
    <td align="center">
    <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
    <tbody>
    <tr>
    <td align="center">
    <table width="520" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
    <tbody>
    <tr>
    <td style="font-size:26px;font-weight:bold;color:#002d44;text-align:center;padding-top:50px;padding-bottom:25px;">
    ${greeting}
    </td>
    </tr>
    <tr>
    <td style="font-size:16px;color:#1f2d38;text-align:center;line-height:1.6;padding-bottom:25px;">
    ${mainMessage}
    </td>
    </tr>
    <tr>
    <td style="padding-bottom:30px;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3efe6;border-radius:10px;padding:25px;">
    <tbody>
    <tr>
    <td style="font-size:12px;color:#c39a22;font-weight:bold;letter-spacing:1px;padding-bottom:15px;text-transform:uppercase;border-bottom: 1px solid rgba(195,154,34,0.2);">
    DETALLES DEL ESCANEO
    </td>
    </tr>
    <tr>
    <td style="font-size:15px;color:#1f2d38;line-height:1.7;padding-top:15px;">
    ${contentHtml}
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td style="font-size:15px;color:#1f2d38;line-height:1.6;padding-bottom:25px;text-align:center;opacity:0.8;">
    ${isClient ? 'Nos comunicaremos contigo muy pronto para agendar nuestra sesión de análisis.' : 'Por favor, revisa esta información antes de la sesión de diagnóstico con el cliente.'}
    </td>
    </tr>
    <tr>
    <td style="border-top:1px solid #EAF2F6;padding-top:30px;"></td>
    </tr>
    <tr>
    <td align="center" style="padding-top:20px;">
    <a href="https://www.autenticos.co" target="_blank">
    <img src="https://drive.google.com/uc?export=view&id=1klCDz1fqSl4sCiTN3eMd-vPjkDQFfF-h" style="width:180px;height:auto;display:block;" alt="Auténticos">
    </a>
    </td>
    </tr>
    <tr>
    <td align="center" style="padding:20px 0 25px 0;">
    <a href="https://www.linkedin.com/company/autenticos/" target="_blank" style="margin:0 10px;display:inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="24" alt="LinkedIn"></a>
    <a href="https://www.facebook.com/clubautenticos" target="_blank" style="margin:0 10px;display:inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" alt="Facebook"></a>
    <a href="https://www.instagram.com/autenticos.co" target="_blank" style="margin:0 10px;display:inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" alt="Instagram"></a>
    </td>
    </tr>
    <tr>
    <td style="text-align:center;font-size:14px;color:#1f2d38;font-weight:600;padding-bottom:50px;">
    Conócete. Lidera desde lo auténtico.
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </body>
    </html>
  `;
}

// Odoo RPC Helper
async function odooCall(url: string, service: string, method: string, args: any[]) {
  const response = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Math.floor(Math.random() * 1000)
    })
  });

  const res = await response.json();
  if (res.error) throw new Error(`Odoo Error: ${JSON.stringify(res.error)}`);
  return res.result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const data = await req.json();
    const { respName: firstName, respLastName: lastName, email, phone, companyName: company } = data;
    const fullName = `${firstName} ${lastName}`.trim();

    const ODOO_URL = Deno.env.get('ODOO_URL');
    const ODOO_DB = Deno.env.get('ODOO_DB');
    const ODOO_USER = Deno.env.get('ODOO_USER');
    const ODOO_API_KEY = Deno.env.get('ODOO_API_KEY');
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

    if (!ODOO_URL || !BREVO_API_KEY) throw new Error('Missing configuration');

    // Format description for Odoo (Plain Text)
    const plainDescription = `
DIAGNÓSTICO CORPORATIVO - ESCANEO EMPRESARIAL

S1. INFORMACIÓN GENERAL
- Empresa: ${data.companyName}
- Persona de contacto: ${fullName}
- Cargo: ${data.respRole}
- Nivel organizacional de interés: ${data.orgLevel}
- Área Intervención: ${data.interventionArea}

S2. CONTEXTO ESTRATÉGICO
- Desafíos: ${data.challenges || 'No especificado'}
- Cambios: ${data.changes || 'No especificado'}
- Objetivos: ${data.goals || 'No especificado'}
- Prioridades: ${data.priorities ? data.priorities.join(', ') : 'Ninguna'}
- Resultados Esperados: ${data.expectedResults || 'No especificado'}

S3. NECESIDADES Y BRECHAS
- Problemas Desempeño: ${data.performanceIssues || 'No especificado'}
- Áreas con Brechas: ${data.areaBreaches || 'No especificado'}
- Habilidades Faltantes: ${data.missingSkills || 'No especificado'}
- Urgencia: ${data.urgency}
- Consecuencias: ${data.consequences ? data.consequences.join(', ') : 'No especificado'}
- Brechas (1-5):
${Object.entries(data.breachesScores).map(([k, v]) => `  * ${k}: ${v}`).join('\n')}

S4. CULTURA Y CAMBIO
- Cultura: ${data.cultureDescription}
- Fortalezas: ${data.cultureStrengths}
- Barreras: ${data.cultureBarriers}
- Disposición Cambio: ${data.changeReadiness}/5
- Compromiso Líderes: ${data.leadershipCommitment}
- Programas Previos: ${data.hasPrevPrograms}
${data.hasPrevPrograms === 'Sí' ? `- Qué funcionó: ${data.prevWhatWorked}\n- Qué no funcionó: ${data.prevWhatNotWorked}` : ''}

S5. POBLACIÓN OBJETIVO
- Público: ${data.targetPublic && data.targetPublic.length > 0 ? data.targetPublic.join(', ') : 'No especificado'}
- Cantidad: ${data.participantCount}
- Necesidades: ${data.needsByLevel}

S6. FORMATO Y LOGÍSTICA
- Modalidad: ${data.preferredModality}
- Duración: ${data.idealDuration}
- Restricciones: ${data.logisticsRestrictions && data.logisticsRestrictions.length > 0 ? data.logisticsRestrictions.join(', ') : 'Ninguna'}
${data.logisticsDescription ? `- Detalles logística: ${data.logisticsDescription}` : ''}

S7. PRESUPUESTO Y DECISIÓN
- Inversión: ${data.investmentRange}
- Prioridad: ${data.investmentPriority}
- Factores Clave: ${data.decisionFactors || 'No especificado'}
    `.trim();

    // Format rich HTML for Email
    const goldColor = '#c39a22';
    const sectionStyle = `color: ${goldColor}; font-weight: bold; font-size: 16px; margin-top: 25px; margin-bottom: 12px; display: block; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;`;
    
    const formattedHtml = `
      <div style="${sectionStyle}">S1. INFORMACIÓN GENERAL</div>
      <strong>Empresa:</strong> ${data.companyName}<br/>
      <strong>Persona de contacto:</strong> ${fullName}<br/>
      <strong>Cargo:</strong> ${data.respRole}<br/>
      <strong>Nivel organizacional de interés:</strong> ${data.orgLevel}<br/>
      <strong>Área Intervención:</strong> ${data.interventionArea}<br/>

      <div style="${sectionStyle}">S2. CONTEXTO ESTRATÉGICO</div>
      <strong>Desafíos:</strong> ${data.challenges || 'No especificado'}<br/>
      <strong>Cambios:</strong> ${data.changes || 'No especificado'}<br/>
      <strong>Objetivos:</strong> ${data.goals || 'No especificado'}<br/>
      <strong>Prioridades:</strong> ${data.priorities ? data.priorities.join(', ') : 'Ninguna'}<br/>
      <strong>Resultados Esperados:</strong> ${data.expectedResults || 'No especificado'}<br/>

      <div style="${sectionStyle}">S3. NECESIDADES Y BRECHAS</div>
      <strong>Problemas Desempeño:</strong> ${data.performanceIssues || 'No especificado'}<br/>
      <strong>Áreas con Brechas:</strong> ${data.areaBreaches || 'No especificado'}<br/>
      <strong>Habilidades Faltantes:</strong> ${data.missingSkills || 'No especificado'}<br/>
      <strong>Urgencia:</strong> ${data.urgency}<br/>
      <strong>Consecuencias:</strong> ${data.consequences ? data.consequences.join(', ') : 'No especificado'}<br/>
      <strong>Brechas (1-5):</strong><br/>
      ${Object.entries(data.breachesScores).map(([k, v]) => `&nbsp;&nbsp;&bull; <strong>${k}:</strong> ${v}`).join('<br/>')}

      <div style="${sectionStyle}">S4. CULTURA Y CAMBIO</div>
      <strong>Cultura:</strong> ${data.cultureDescription}<br/>
      <strong>Fortalezas:</strong> ${data.cultureStrengths}<br/>
      <strong>Barreras:</strong> ${data.cultureBarriers}<br/>
      <strong>Disposición Cambio:</strong> ${data.changeReadiness}/5<br/>
      <strong>Compromiso Líderes:</strong> ${data.leadershipCommitment}<br/>
      <strong>Programas Previos:</strong> ${data.hasPrevPrograms}<br/>
      ${data.hasPrevPrograms === 'Sí' ? `<strong>Qué funcionó:</strong> ${data.prevWhatWorked}<br/><strong>Qué no funcionó:</strong> ${data.prevWhatNotWorked}` : ''}

      <div style="${sectionStyle}">S5. POBLACIÓN OBJETIVO</div>
      <strong>Público:</strong> ${data.targetPublic && data.targetPublic.length > 0 ? data.targetPublic.join(', ') : 'No especificado'}<br/>
      <strong>Cantidad:</strong> ${data.participantCount}<br/>
      <strong>Necesidades:</strong> ${data.needsByLevel}<br/>

      <div style="${sectionStyle}">S6. FORMATO Y LOGÍSTICA</div>
      <strong>Modalidad:</strong> ${data.preferredModality}<br/>
      <strong>Duración:</strong> ${data.idealDuration}<br/>
      <strong>Restricciones:</strong> ${data.logisticsRestrictions && data.logisticsRestrictions.length > 0 ? data.logisticsRestrictions.join(', ') : 'Ninguna'}<br/>
      ${data.logisticsDescription ? `<strong>Detalles logística:</strong> ${data.logisticsDescription}<br/>` : ''}

      <div style="${sectionStyle}">S7. PRESUPUESTO Y DECISIÓN</div>
      <strong>Inversión:</strong> ${data.investmentRange}<br/>
      <strong>Prioridad:</strong> ${data.investmentPriority}<br/>
      <strong>Factores Clave:</strong> ${data.decisionFactors || 'No especificado'}
    `;

    // --- Odoo Integration ---
    let leadId = null;
    try {
      const uid = await odooCall(ODOO_URL, "common", "authenticate", [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
      if (uid) {
        const partnerIds = await odooCall(ODOO_URL, "object", "execute_kw", [
          ODOO_DB, uid, ODOO_API_KEY, "res.partner", "search", [[["email", "=", email]]]
        ]);
        let partnerId = partnerIds[0];
        if (!partnerId) {
          partnerId = await odooCall(ODOO_URL, "object", "execute_kw", [
            ODOO_DB, uid, ODOO_API_KEY, "res.partner", "create",
            [{ name: fullName, email, phone, comment: 'Business Scan Participant', function: data.respRole }]
          ]);
        }
        leadId = await odooCall(ODOO_URL, "object", "execute_kw", [
          ODOO_DB, uid, ODOO_API_KEY, "crm.lead", "create",
          [{
            name: `DIAGNÓSTICO: ${company || fullName}`,
            partner_id: partnerId,
            email_from: email,
            description: plainDescription,
            type: 'opportunity',
            priority: '3'
          }]
        ]);
      }
    } catch (e) { console.error('Odoo error:', e); }

    // --- Brevo Notifications ---
    const adminHtml = getEmailHtml(fullName, company, formattedHtml, false);
    const clientHtml = getEmailHtml(fullName, company, formattedHtml, true);
    
    await Promise.all([
      // To Admin
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: "Auténticos Diagnóstico", email: "contacto@autenticos.co" },
          to: [
            { email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" }
          ],
          subject: `DIAGNÓSTICO EMPRESARIAL: ${company || fullName}`,
          htmlContent: adminHtml
        })
      }),
      // To Client
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: [{ email, name: fullName }],
          subject: `Confirmación de Diagnóstico - Auténticos`,
          htmlContent: clientHtml
        })
      })
    ]);

    return new Response(JSON.stringify({ success: true, lead_id: leadId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})
