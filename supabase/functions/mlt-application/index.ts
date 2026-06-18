import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculateScore(data: any) {
  let block2 = 0;
  if (data.currentMoment === "Estoy creciendo y quiero prepararme para un siguiente nivel.") block2 = 15;
  else if (data.currentMoment === "Tengo buenos resultados, pero siento que algo importante necesita cambiar.") block2 = 15;
  else if (data.currentMoment === "Estoy en una etapa de transición o redefinición.") block2 = 12;
  else if (data.currentMoment === "Me siento agotado o sobrecargado y necesito recuperar claridad.") block2 = 8;
  else if (data.currentMoment === "Solo estoy explorando opciones.") block2 = 0;

  let impactScore = 1;
  if (data.decisionImpact === "A mi familia o círculo cercano.") impactScore = 2;
  else if (data.decisionImpact === "A un equipo pequeño.") impactScore = 3;
  else if (data.decisionImpact === "A un equipo grande o varias áreas.") impactScore = 4;
  else if (data.decisionImpact === "A una empresa, comunidad u organización completa.") impactScore = 5;

  let peopleScore = 1;
  if (data.peopleInCharge === "1 a 3 personas.") peopleScore = 2;
  else if (data.peopleInCharge === "4 a 10 personas.") peopleScore = 3;
  else if (data.peopleInCharge === "11 a 30 personas.") peopleScore = 4;
  else if (data.peopleInCharge === "Más de 30 personas.") peopleScore = 5;

  let decisionScore = 1;
  if (data.decisionLevel === "Medio: tomo decisiones sobre mi trabajo o proyectos.") decisionScore = 2;
  else if (data.decisionLevel === "Alto: tomo decisiones que afectan equipos, clientes o resultados.") decisionScore = 4;
  else if (data.decisionLevel === "Muy alto: tomo decisiones estratégicas para una empresa, comunidad u organización.") decisionScore = 5;

  let block3 = impactScore + peopleScore + decisionScore; 

  let beliefsScore = (Number(data.questionBeliefsReadiness || 1) - 1) * 2; 
  let failureScore = 0;
  if (data.failureAttitude === "Sentirme frustrado, pero no siempre revisar mi responsabilidad.") failureScore = 2;
  else if (data.failureAttitude === "Revisar qué pude haber hecho diferente.") failureScore = 4;
  else if (data.failureAttitude === "Buscar activamente aprendizaje y asumir responsabilidad.") failureScore = 6;
  else if (data.failureAttitude === "Pedir retroalimentación y trabajar sobre mí mismo.") failureScore = 8;
  
  let feedbackScore = (Number(data.feedbackComfort || 1) - 1) * 2;
  let block4Sum = beliefsScore + failureScore + feedbackScore; 
  let block4 = block4Sum * (25 / 24);

  let expectationsScore = 0;
  const highAlign = ["Mayor claridad personal", "Fortalecer mi propósito", "Vivir una experiencia profunda de crecimiento", "Mejorar mis relaciones", "Tomar mejores decisiones"];
  const mediumAlign = ["Mejor liderazgo", "Recuperar dirección", "Gestionar mejor mi energía", "Aumentar mi impacto"];
  const expList = data.expectations || [];
  expList.forEach((e: string) => {
    if (highAlign.includes(e)) expectationsScore += 4;
    else if (mediumAlign.includes(e)) expectationsScore += 3;
    else if (e === "Hacer networking") expectationsScore += 1;
  });
  let block5 = expectationsScore * (20 / 12);

  let commitmentScore = 0;
  if (data.commitment90Days === "Sí, completamente.") commitmentScore = 10;
  else if (data.commitment90Days === "Sí, aunque debo organizar mi agenda.") commitmentScore = 7;
  else if (data.commitment90Days === "Tengo dudas sobre mi disponibilidad.") commitmentScore = 3;

  let participationScore = (Number(data.activeParticipationReadiness || 1) - 1) * 2;
  let priorityScore = (Number(data.processPriority || 1) - 1) * 2;
  let block6Sum = commitmentScore + participationScore + priorityScore; 
  let block6 = block6Sum * (25 / 26);

  const rawScore = block2 + block3 + block4 + block5 + block6;
  const finalScore = Math.round(rawScore);

  let classification = "🔴 Aún no es el momento adecuado";
  if (finalScore >= 85) classification = "✅ Admitido";
  else if (finalScore >= 70) classification = "🟡 Admitido con entrevista";
  else if (finalScore >= 55) classification = "🟠 Lista de espera";

  return { finalScore, classification };
}

// Helper to generate styled HTML email
function getEmailHtml(userName: string, contentHtml: string, finalScore: number, classification: string, isClient = false) {
  const greeting = isClient 
    ? `¡Gracias por postularte a Master Live Training, ${userName}!` 
    : `<strong>Nueva Postulación MLT</strong><br/><span style="font-weight: normal; font-size: 20px;">${userName}</span>`;
  const mainMessage = isClient 
    ? `Hemos recibido tu postulación. Nuestro equipo revisará cuidadosamente tu información para asegurar que este programa es el paso adecuado para tu momento actual.`
    : `Se ha recibido una nueva postulación para Master Live Training con la siguiente información:`;

  const scoringSection = !isClient ? `
    <tr>
    <td style="padding-bottom:15px;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff; border: 2px solid #ddbe3d; border-radius:10px; padding:20px; text-align:center;">
    <tbody>
    <tr>
    <td style="font-size:14px;color:#c39a22;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">
    RESULTADO DEL SCORING
    </td>
    </tr>
    <tr>
    <td style="font-size:36px;color:#002d44;font-weight:bold;margin:10px 0;">
    ${finalScore}/100
    </td>
    </tr>
    <tr>
    <td style="font-size:18px;color:#1f2d38;font-weight:bold;">
    ${classification}
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
  ` : '';

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
    ${scoringSection}
    <tr>
    <td style="padding-bottom:30px;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3efe6;border-radius:10px;padding:25px;">
    <tbody>
    <tr>
    <td style="font-size:12px;color:#c39a22;font-weight:bold;letter-spacing:1px;padding-bottom:15px;text-transform:uppercase;border-bottom: 1px solid rgba(195,154,34,0.2);">
    DETALLES DE LA POSTULACIÓN
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
    ${isClient ? 'Pronto te contactaremos con los siguientes pasos.' : 'Por favor, revisa esta información para decidir la aceptación del candidato.'}
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
    <td style="text-align:center;font-size:14px;color:#1f2d38;font-weight:600;padding-top: 20px; padding-bottom:50px;">
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
    console.log("Received data:", JSON.stringify(data, null, 2));
    
    const { 
      name, email, whatsapp: phone, location, ageRange, occupation, company, role,
      currentMoment, mltReason, urgentChallenge,
      decisionImpact, peopleInCharge, decisionLevel,
      questionBeliefsReadiness, failureAttitude, feedbackComfort, aspectToWork,
      expectations, valuableResult,
      commitment90Days, activeParticipationReadiness, processPriority, impediments
    } = data;

    let ODOO_URL = Deno.env.get('ODOO_URL')?.trim() || '';
    const ODOO_DB = Deno.env.get('ODOO_DB')?.trim() || '';
    const ODOO_USER = Deno.env.get('ODOO_USER')?.trim() || '';
    const ODOO_API_KEY = Deno.env.get('ODOO_API_KEY')?.trim() || '';
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')?.trim() || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')?.trim() || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() || '';

    if (ODOO_URL.endsWith('/')) ODOO_URL = ODOO_URL.slice(0, -1);

    if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY || !BREVO_API_KEY) {
      console.error('Missing Odoo or Brevo configuration');
      throw new Error('Server configuration error (missing secrets)');
    }

    // Calculate score
    const { finalScore, classification } = calculateScore(data);

    // Update Supabase Database
    try {
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        // We match by email and name to find the row that was just inserted by the client
        // Then we update the score and classification
        await fetch(`${SUPABASE_URL}/rest/v1/mlt_applications?email=eq.${encodeURIComponent(email)}&name=eq.${encodeURIComponent(name)}&order=created_at.desc&limit=1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            score: finalScore,
            classification: classification
          })
        });
      }
    } catch (dbUpdateErr) {
      console.error("Failed to update database with score:", dbUpdateErr);
    }

    const plainDescription = `
POSTULACIÓN MLT

*** RESULTADO SCORING ***
Puntaje: ${finalScore}/100
Clasificación: ${classification}
*************************

B1. DATOS BÁSICOS
- Nombre: ${name}
- Email: ${email}
- WhatsApp: ${phone}
- Ubicación: ${location}
- Edad: ${ageRange}
- Ocupación: ${occupation}
- Empresa: ${company || 'N/A'}
- Cargo: ${role || 'N/A'}

B2. MOMENTO ACTUAL
- Momento: ${currentMoment}
- Por qué MLT: ${mltReason || 'N/A'}
- Desafío urgente: ${urgentChallenge || 'N/A'}

B3. RESPONSABILIDAD E IMPACTO
- Impacto de decisiones: ${decisionImpact}
- Personas a cargo: ${peopleInCharge}
- Nivel de decisiones: ${decisionLevel}

B4. DISPOSICIÓN AL CAMBIO
- Cuestionar creencias: ${questionBeliefsReadiness}/5
- Ante una falla: ${failureAttitude}
- Comodidad con feedback: ${feedbackComfort}/5
- Aspecto a trabajar: ${aspectToWork || 'N/A'}

B5. EXPECTATIVAS
- Qué espera: ${expectations ? expectations.join(', ') : 'N/A'}
- Resultado valioso: ${valuableResult || 'N/A'}

B6. COMPROMISO
- Compromiso 90 días: ${commitment90Days}
- Dispuesto a participar: ${activeParticipationReadiness}/5
- Prioridad del proceso: ${processPriority}/5
- Impedimentos: ${impediments || 'Ninguno'}
    `.trim();

    const goldColor = '#c39a22';
    const sectionStyle = "color: " + goldColor + "; font-weight: bold; font-size: 16px; margin-top: 25px; margin-bottom: 12px; display: block; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 5px;";
    
    const formattedHtml = `
      <div style="${sectionStyle}">B1. DATOS BÁSICOS</div>
      <strong>Nombre:</strong> ${name}<br/>
      <strong>WhatsApp:</strong> ${phone}<br/>
      <strong>Ubicación:</strong> ${location}<br/>
      <strong>Edad:</strong> ${ageRange}<br/>
      <strong>Ocupación:</strong> ${occupation}<br/>
      <strong>Empresa:</strong> ${company || 'N/A'}<br/>
      <strong>Cargo:</strong> ${role || 'N/A'}<br/>

      <div style="${sectionStyle}">B2. MOMENTO ACTUAL</div>
      <strong>Momento:</strong> ${currentMoment}<br/>
      <strong>Por qué MLT:</strong> ${mltReason || 'N/A'}<br/>
      <strong>Desafío urgente:</strong> ${urgentChallenge || 'N/A'}<br/>

      <div style="${sectionStyle}">B3. RESPONSABILIDAD E IMPACTO</div>
      <strong>Impacto de decisiones:</strong> ${decisionImpact}<br/>
      <strong>Personas a cargo:</strong> ${peopleInCharge}<br/>
      <strong>Nivel de decisiones:</strong> ${decisionLevel}<br/>

      <div style="${sectionStyle}">B4. DISPOSICIÓN AL CAMBIO</div>
      <strong>Cuestionar creencias:</strong> ${questionBeliefsReadiness}/5<br/>
      <strong>Ante una falla:</strong> ${failureAttitude}<br/>
      <strong>Comodidad con feedback:</strong> ${feedbackComfort}/5<br/>
      <strong>Aspecto a trabajar:</strong> ${aspectToWork || 'N/A'}<br/>

      <div style="${sectionStyle}">B5. EXPECTATIVAS</div>
      <strong>Qué espera:</strong> ${expectations ? expectations.join(', ') : 'N/A'}<br/>
      <strong>Resultado valioso:</strong> ${valuableResult || 'N/A'}<br/>

      <div style="${sectionStyle}">B6. COMPROMISO</div>
      <strong>Compromiso 90 días:</strong> ${commitment90Days}<br/>
      <strong>Dispuesto a participar:</strong> ${activeParticipationReadiness}/5<br/>
      <strong>Prioridad del proceso:</strong> ${processPriority}/5<br/>
      <strong>Impedimentos:</strong> ${impediments || 'Ninguno'}<br/>
    `;

    // --- Odoo Integration ---
    let leadId = null;
    let odooLog = { status: 'starting', steps: [] as string[], error: null as any };
    try {
      odooLog.steps.push("Auth starting");
      const uid = await odooCall(ODOO_URL, "common", "authenticate", [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
      odooLog.steps.push("Auth success, uid: " + uid);
      
      if (uid) {
        odooLog.steps.push("Searching partner: " + email);
        const partnerIds = await odooCall(ODOO_URL, "object", "execute_kw", [
          ODOO_DB, uid, ODOO_API_KEY, "res.partner", "search", [[["email", "=", email]]]
        ]);
        
        let partnerId = partnerIds[0];
        if (!partnerId) {
          odooLog.steps.push("Partner not found, creating: " + name);
          partnerId = await odooCall(ODOO_URL, "object", "execute_kw", [
            ODOO_DB, uid, ODOO_API_KEY, "res.partner", "create",
            [{ 
              name: name, 
              email: email, 
              phone: phone, 
              comment: 'Candidato MLT', 
              function: role || occupation
            }]
          ]);
          odooLog.steps.push("Partner created, id: " + partnerId);
        } else {
          odooLog.steps.push("Partner found, id: " + partnerId);
        }
        
        odooLog.steps.push("Creating CRM lead");
        leadId = await odooCall(ODOO_URL, "object", "execute_kw", [
          ODOO_DB, uid, ODOO_API_KEY, "crm.lead", "create",
          [{
            name: "POSTULACIÓN MLT: " + name,
            partner_id: partnerId,
            email_from: email,
            description: plainDescription,
            type: 'opportunity',
            priority: finalScore >= 85 ? '3' : (finalScore >= 70 ? '2' : '1')
          }]
        ]);
        odooLog.steps.push("Lead created, id: " + leadId);
        odooLog.status = 'success';
      }
    } catch (e) { 
      console.error('Odoo integration failed:', e);
      odooLog.status = 'failed';
      odooLog.error = e.message || e;
    }

    // --- Brevo Notifications ---
    const adminHtml = getEmailHtml(name, formattedHtml, finalScore, classification, false);
    const clientHtml = getEmailHtml(name, formattedHtml, finalScore, classification, true);
    
    await Promise.all([
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: "Auténticos MLT", email: "contacto@autenticos.co" },
          to: [
            { email: "felipebeltranh@gmail.com", name: "Felipe Beltrán" }
          ],
          subject: `[${finalScore}] POSTULACIÓN MLT: ` + name,
          htmlContent: adminHtml
        })
      }),
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: "Auténticos", email: "contacto@autenticos.co" },
          to: [{ email, name: name }],
          subject: `Confirmación de Postulación MLT - Auténticos`,
          htmlContent: clientHtml
        })
      })
    ]);

    return new Response(JSON.stringify({ success: true, lead_id: leadId, score: finalScore, classification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})
