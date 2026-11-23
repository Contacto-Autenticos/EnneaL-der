import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () => {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  };
  return `AUTO-${segment()}-${segment()}`;
}

async function getPreviousPurchasesDiscountCOP(
  supabaseAdmin: ReturnType<typeof createClient>,
  rawEmail: string
): Promise<number> {
  const cleanEmail = String(rawEmail || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return 0;

  const { data } = await supabaseAdmin
    .from("transactions")
    .select("amount_in_cents, reference")
    .eq("customer_email", cleanEmail)
    .in("status", ["APPROVED", "approved"]);

  if (!data || data.length === 0) return 0;

  const qualifying = data.filter(
    (t: any) => t.reference && String(t.reference).toLowerCase().startsWith("ref-")
  );
  const totalCents = qualifying.reduce(
    (sum: number, t: any) => sum + Number(t.amount_in_cents || 0),
    0
  );
  return Math.floor(totalCents / 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action || "pay";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ACCIÓN 1: Validar cupón o código de afiliado en servidor
    if (action === "validate_coupon") {
      const code = String(body?.couponCode || "").trim().toUpperCase();
      const flow = String(body?.flow || "eneagrama");

      if (!code) {
        return json({ ok: false, valid: false, error: "Ingresa un código de descuento." });
      }

      if (flow === "hqs") {
        if (code === "NIILO2026") {
          return json({
            ok: true,
            valid: true,
            code: "NIILO2026",
            discountPercentage: 100,
            commercialName: null,
            isFree: true,
            label: "Cupón NIILO2026 aplicado (100% OFF)",
          });
        }
      }

      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("code, discount_percentage, is_active")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const pct = Math.min(100, Math.max(0, Number(coupon.discount_percentage)));
        return json({
          ok: true,
          valid: true,
          code: coupon.code,
          discountPercentage: pct,
          commercialName: null,
          isFree: pct >= 100,
          label: `Cupón ${coupon.code} aplicado (-${pct}%)`,
        });
      }

      const { data: affiliate } = await supabaseAdmin
        .from("affiliate_codes")
        .select("code, commercial_name, discount_percentage, is_active")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (affiliate) {
        const pct = Math.min(100, Math.max(0, Number(affiliate.discount_percentage)));
        return json({
          ok: true,
          valid: true,
          code: affiliate.code,
          discountPercentage: pct,
          commercialName: affiliate.commercial_name,
          isFree: pct >= 100,
          label: `Código de afiliado aplicado (-${pct}% • ${affiliate.commercial_name})`,
        });
      }

      return json({
        ok: true,
        valid: false,
        error: "Código no válido o expirado.",
      });
    }

    // ACCIÓN 2: Consultar descuento por compra previa del test (para Programa Genuinos)
    if (action === "check_previous_purchases") {
      const discountCOP = await getPreviousPurchasesDiscountCOP(supabaseAdmin, body?.email || "");
      return json({
        ok: true,
        discountCOP,
      });
    }

    // ACCIÓN 3: Redimir inscripción o acceso con 100% de descuento ($0 COP)
    if (action === "redeem_free") {
      const flow = String(body?.flow || "eneagrama");
      const code = String(body?.couponCode || "").trim().toUpperCase();
      const customerEmail = String(body?.customerEmail || "").trim().toLowerCase();
      const customerName = String(body?.customerName || "Participante").trim();

      if (!code) throw new Error("Se requiere un cupón válido para inscripción gratuita.");

      let isFullDiscount = false;
      if (flow === "hqs" && code === "NIILO2026") {
        isFullDiscount = true;
      } else {
        const { data: coupon } = await supabaseAdmin
          .from("coupons")
          .select("discount_percentage")
          .eq("code", code)
          .eq("is_active", true)
          .maybeSingle();
        if (coupon && Number(coupon.discount_percentage) >= 100) {
          isFullDiscount = true;
        } else {
          const { data: aff } = await supabaseAdmin
            .from("affiliate_codes")
            .select("discount_percentage")
            .eq("code", code)
            .eq("is_active", true)
            .maybeSingle();
          if (aff && Number(aff.discount_percentage) >= 100) {
            isFullDiscount = true;
          }
        }
      }

      if (!isFullDiscount) {
        throw new Error("El cupón ingresado no cubre el 100% del valor.");
      }

      if (flow === "hqs") {
        const { data: inserted, error: insErr } = await supabaseAdmin
          .from("workshop_registrations")
          .insert([
            {
              full_name: customerName,
              email: customerEmail,
              phone: String(body?.customerPhone || ""),
              city: String(body?.customerCity || ""),
              workshop_name: "Haz que suceda",
              amount: 0,
              payment_status: "APPROVED",
              raw_data: {
                coupon: code,
                food_restriction: body?.foodRestriction || "No",
                mobility_requirement: body?.mobilityRequirement || "No",
              },
            },
          ])
          .select("id")
          .single();

        if (insErr) throw new Error("No fue posible guardar tu inscripción.");

        return json({
          ok: true,
          status: "approved",
          registrationId: inserted.id,
          isFree: true,
        });
      }

      const automatedCode = generateAccessCode();
      const freeTxId = `FREE-${code}-${Date.now()}`;
      await supabaseAdmin.from("access_codes").insert([
        {
          code: automatedCode,
          is_used: false,
          transaction_id: freeTxId,
          created_at: new Date().toISOString(),
        },
      ]);

      return json({
        ok: true,
        status: "approved",
        id: freeTxId,
        automatedCode,
        isFree: true,
      });
    }

    // ACCIÓN 4: Procesar Pago Real con Mercado Pago Payment Brick
    const {
      formData,
      flow = "eneagrama", // 'eneagrama' | 'dominios' | 'genuinos' | 'hqs'
      mode = "normal", // 'normal' | 'plan'
      bumpSelected = false,
      plan = "virtual", // 'virtual' | 'presencial' (para genuinos)
      couponCode: rawCouponCode = "",
      customerEmail: reqEmail = "",
      customerName: reqName = "",
      customerPhone = "",
      customerCity = "",
      birthDate = null,
      foodRestriction = "No",
      mobilityRequirement = "No",
    } = body;

    if (!formData) throw new Error("Faltan los datos del formulario de pago.");

    // Obtener Access Token encriptado desde Supabase Vault
    let MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN_MLT");
    if (!MP_ACCESS_TOKEN) {
      const { data: vaultToken } = await supabaseAdmin.rpc("get_mp_access_token_mlt");
      if (typeof vaultToken === "string" && vaultToken.trim()) {
        MP_ACCESS_TOKEN = vaultToken.trim();
      }
    }
    if (!MP_ACCESS_TOKEN) {
      MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    }
    if (!MP_ACCESS_TOKEN) {
      throw new Error("Falta el secret MP_ACCESS_TOKEN en Supabase Vault.");
    }

    const cleanEmail = String(reqEmail || formData?.payer?.email || "cliente@autenticos.co")
      .trim()
      .toLowerCase();
    const cleanName = String(reqName || "Participante Auténticos").trim();
    const couponCode = String(rawCouponCode || "").trim().toUpperCase();

    // Calcular monto base y descuento en servidor según el flujo
    let baseCOP = 75000;
    let description = "Informe Avanzado de Eneagrama - Auténticos";
    let externalReference = `ref-${Date.now()}`;
    let discountPct = 0;
    let commercialName: string | null = null;
    let registrationId: string | null = null;

    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("discount_percentage")
        .eq("code", couponCode)
        .eq("is_active", true)
        .maybeSingle();
      if (coupon) {
        discountPct = Math.min(100, Math.max(0, Number(coupon.discount_percentage)));
      } else {
        const { data: affiliate } = await supabaseAdmin
          .from("affiliate_codes")
          .select("discount_percentage, commercial_name")
          .eq("code", couponCode)
          .eq("is_active", true)
          .maybeSingle();
        if (affiliate) {
          discountPct = Math.min(100, Math.max(0, Number(affiliate.discount_percentage)));
          commercialName = affiliate.commercial_name;
        }
      }
    }

    let finalAmountCOP = 75000;

    if (flow === "eneagrama") {
      const isPlanOnly = mode === "plan";
      baseCOP = isPlanOnly ? 15000 : 75000;
      const discountedBase = Math.floor(baseCOP * (1 - discountPct / 100));
      const bumpCOP = !isPlanOnly && bumpSelected ? 15000 : 0;
      finalAmountCOP = discountedBase + bumpCOP;
      description = isPlanOnly
        ? "Plan de Acción Estratégico Eneagrama - Auténticos"
        : bumpSelected
        ? "Informe Avanzado de Eneagrama + Plan de Acción - Auténticos"
        : "Informe Avanzado de Eneagrama - Auténticos";
      externalReference = `ref-${Date.now()}`;
    } else if (flow === "dominios") {
      baseCOP = 75000;
      finalAmountCOP = Math.floor(baseCOP * (1 - discountPct / 100));
      description = "Autodiagnóstico 6 Dominios Fundamentales - Auténticos";
      externalReference = `ref-autodiag-${Date.now()}`;
    } else if (flow === "genuinos") {
      const isVirtual = plan === "virtual";
      baseCOP = isVirtual ? 365000 : 870000;
      const prevDiscount = await getPreviousPurchasesDiscountCOP(supabaseAdmin, cleanEmail);
      const afterPrev = Math.max(2000, baseCOP - prevDiscount);
      finalAmountCOP = Math.max(2000, Math.floor(afterPrev * (1 - discountPct / 100)));
      description = `Programa Genuinos - Plan ${isVirtual ? "Virtual" : "Presencial"}`;
      externalReference = `gen-${isVirtual ? "virtual" : "presencial"}-${Date.now()}`;
    } else if (flow === "hqs") {
      baseCOP = 450000;
      finalAmountCOP = Math.max(2000, Math.floor(baseCOP * (1 - discountPct / 100)));
      description = "Taller Presencial Haz Que Suceda - Auténticos";

      // Crear pre-registro en workshop_registrations en estado PENDING
      const { data: regRows, error: regErr } = await supabaseAdmin
        .from("workshop_registrations")
        .insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            phone: String(customerPhone || ""),
            city: String(customerCity || ""),
            workshop_name: "Haz que suceda",
            amount: finalAmountCOP,
            payment_status: "PENDING",
            raw_data: {
              food_restriction: foodRestriction || "No",
              mobility_requirement: mobilityRequirement || "No",
              coupon: couponCode || null,
            },
          },
        ])
        .select("id")
        .single();

      if (regErr || !regRows) {
        throw new Error("No fue posible registrar tus datos de inscripción.");
      }
      registrationId = regRows.id;
      externalReference = `workshop-hqs-${registrationId}-${Date.now()}`;
    }

    finalAmountCOP = Math.max(2000, Math.round(finalAmountCOP));

    const paymentPayload: Record<string, any> = {
      ...formData,
      transaction_amount: finalAmountCOP,
      description,
      external_reference: externalReference,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
      metadata: {
        flow,
        mode,
        bump_selected: Boolean(bumpSelected),
        plan,
        coupon_code: couponCode || null,
        commercial_name: commercialName,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: customerPhone || null,
        birth_date: birthDate || null,
        registration_id: registrationId,
      },
    };

    if (!paymentPayload.payer?.email) {
      paymentPayload.payer = { ...(paymentPayload.payer || {}), email: cleanEmail };
    }

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(paymentPayload),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago Payment Error (Enesencia):", mpData);
      const errorMsg =
        mpData.message ||
        mpData.cause?.[0]?.description ||
        "Error al procesar el pago con Mercado Pago.";
      return json({ error: errorMsg, mp_error: mpData }, 400);
    }

    const paidCOP = Number(mpData.transaction_amount ?? finalAmountCOP);
    const paymentIdStr = String(mpData.id);
    const normalizedStatus = String(mpData.status || "").toUpperCase(); // 'APPROVED', 'PENDING', etc.
    let automatedCode: string | null = null;

    // 1. Registrar siempre la transacción en la tabla transactions (con reference 'ref-...' para Eneagrama/Dominios)
    try {
      await supabaseAdmin.from("transactions").insert([
        {
          transaction_id: paymentIdStr,
          reference: externalReference,
          customer_email: cleanEmail,
          customer_name: cleanName,
          amount_in_cents: Math.round(paidCOP * 100),
          currency: "COP",
          payment_method_type: (mpData.payment_type_id || "CARD").toUpperCase(),
          payment_method_brand: (mpData.payment_method_id || "MERCADOPAGO").toUpperCase(),
          status: normalizedStatus,
          raw_data: mpData,
        },
      ]);
    } catch (txErr) {
      console.warn("Aviso guardando en transactions:", txErr);
    }

    // 2. Acciones post-pago inmediatas cuando el pago queda aprobado
    if (mpData.status === "approved") {
      if (flow === "eneagrama") {
        automatedCode = generateAccessCode();
        await supabaseAdmin.from("access_codes").insert([
          {
            code: automatedCode,
            is_used: false,
            transaction_id: paymentIdStr,
            created_at: new Date().toISOString(),
          },
        ]);

        await supabaseAdmin
          .from("user_leads")
          .update({
            payment_status: "APPROVED",
            updated_at: new Date().toISOString(),
          })
          .eq("email", cleanEmail);

        supabaseAdmin.functions
          .invoke("send-web-push", {
            body: {
              event_type: "advanced_test_purchase",
              details: {
                email: cleanEmail,
                amount: paidCOP,
                reference: externalReference,
              },
            },
          })
          .catch(() => {});
      } else if (flow === "dominios") {
        await supabaseAdmin.from("user_leads").insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            birth_date: birthDate || null,
            source: "fascinantes_autodiag",
            payment_status: "APPROVED",
          },
        ]);

        supabaseAdmin.functions
          .invoke("send-web-push", {
            body: {
              event_type: "dominios_purchase",
              details: {
                email: cleanEmail,
                amount: paidCOP,
                reference: externalReference,
              },
            },
          })
          .catch(() => {});
      } else if (flow === "genuinos") {
        const isVirtual = plan === "virtual";
        await supabaseAdmin.from("user_leads").insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            phone: customerPhone || null,
            source: `genuinos_${isVirtual ? "virtual" : "presencial"}`,
            payment_status: "APPROVED",
          },
        ]);

        // Generar también código de acceso automático para que en /eneagrama-payment-success pueda iniciar su análisis avanzado
        automatedCode = generateAccessCode();
        await supabaseAdmin.from("access_codes").insert([
          {
            code: automatedCode,
            is_used: false,
            transaction_id: paymentIdStr,
            created_at: new Date().toISOString(),
          },
        ]);

        const baseWorkshopInfo = {
          email: cleanEmail,
          name: cleanName,
          workshop_type: isVirtual ? "VIRTUAL" : "PRESENCIAL",
          workshop_date: isVirtual ? "14, 15, 16 y 17 de Abr" : "11 de Abril",
          workshop_time: isVirtual ? "7:00 PM - 9:00 PM (Col)" : "9:00 AM - 5:00 PM",
        };

        supabaseAdmin.functions
          .invoke("send-workshop-email", {
            body: { ...baseWorkshopInfo, templateId: 1 },
          })
          .catch(() => {});

        supabaseAdmin.functions
          .invoke("send-web-push", {
            body: {
              event_type: "workshop_inscription",
              details: {
                email: cleanEmail,
                amount: paidCOP,
                reference: externalReference,
                workshopName: `Programa Genuinos (${isVirtual ? "Virtual" : "Presencial"})`,
              },
            },
          })
          .catch(() => {});
      }
      // Nota para flow === 'hqs': dejamos workshop_registrations en 'PENDING' para que mercadopago-webhook
      // haga la transición atómica PENDING -> APPROVED y envíe el correo de Haz que suceda sin duplicar.
    }

    return json({
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id,
      payment_type_id: mpData.payment_type_id,
      transaction_details: mpData.transaction_details,
      transaction_amount: paidCOP,
      currency_id: mpData.currency_id ?? "COP",
      reference: externalReference,
      automatedCode,
      registrationId,
      commercialName,
    });
  } catch (error: any) {
    console.error("enesencia-process-payment error:", error);
    return json({ error: error.message || "Error interno al procesar el pago." }, 400);
  }
});
