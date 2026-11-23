import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MP_ACCESS_TOKEN_LEGACY = Deno.env.get("MP_ACCESS_TOKEN");

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

serve(async (req) => {
  const url = new URL(req.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

  let topic = url.searchParams.get("type") || url.searchParams.get("topic");
  let body = null;

  try {
    if (req.body) {
      body = await req.json();
      if (!paymentId && body?.data?.id) paymentId = body.data.id;
      if (!topic && body?.type) topic = body.type;
      if (!topic && body?.action) topic = body.action;
    }
  } catch (_e) {
    // Body might be empty or not json, ignore
  }

  if (!paymentId) {
    return new Response("OK", { status: 200 });
  }

  if (topic !== "payment" && topic !== "payment.created" && topic !== "payment.updated") {
    return new Response("Ignored non-payment event", { status: 200 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN_MLT");
    if (!MP_ACCESS_TOKEN) {
      const { data: vaultToken } = await supabase.rpc("get_mp_access_token_mlt");
      if (typeof vaultToken === "string" && vaultToken.trim()) {
        MP_ACCESS_TOKEN = vaultToken.trim();
      }
    }
    if (!MP_ACCESS_TOKEN) {
      MP_ACCESS_TOKEN = MP_ACCESS_TOKEN_LEGACY;
    }

    let mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok && MP_ACCESS_TOKEN_LEGACY && MP_ACCESS_TOKEN_LEGACY !== MP_ACCESS_TOKEN) {
      mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN_LEGACY}`,
        },
      });
    }

    if (!mpResponse.ok) {
      console.error(`Failed to fetch payment ${paymentId} from MP`);
      return new Response("Error fetching payment", { status: 500 });
    }

    const paymentData = await mpResponse.json();
    const status = paymentData.status;
    const external_reference = String(paymentData.external_reference || "");

    // Sincronizar estado en tabla transactions si existe (para pagos PSE/Efecty de Enesencia que pasan de PENDING a APPROVED)
    if (status === "approved" && (external_reference.startsWith("ref-") || external_reference.startsWith("gen-"))) {
      try {
        await supabase
          .from("transactions")
          .update({
            status: "APPROVED",
            raw_data: paymentData,
          })
          .eq("transaction_id", String(paymentId));

        // Si aún no tenía access_code generado para este transaction_id, generarlo
        const { data: existingCode } = await supabase
          .from("access_codes")
          .select("code")
          .eq("transaction_id", String(paymentId))
          .maybeSingle();

        if (!existingCode) {
          await supabase.from("access_codes").insert([
            {
              code: generateAccessCode(),
              is_used: false,
              transaction_id: String(paymentId),
              created_at: new Date().toISOString(),
            },
          ]);
        }

        const payerEmail = paymentData.metadata?.customer_email || paymentData.payer?.email;
        if (payerEmail) {
          await supabase
            .from("user_leads")
            .update({ payment_status: "APPROVED", updated_at: new Date().toISOString() })
            .eq("email", String(payerEmail).toLowerCase());
        }
      } catch (txSyncErr) {
        console.warn("Aviso sincronizando transacción de Enesencia en webhook:", txSyncErr);
      }
    }

    if (status === "approved" && external_reference) {
      const match = external_reference.match(/workshop(?:-[a-z]+)?-(.+)-(\d+)$/i);

      if (match && match[1]) {
        const registrationId = match[1];

        const { data: regData, error: fetchError } = await supabase
          .from("workshop_registrations")
          .select("*")
          .eq("id", registrationId)
          .single();

        if (fetchError || !regData) {
          console.error("Registration not found:", registrationId);
          return new Response("Not found", { status: 200 });
        }

        if (regData.payment_status === "APPROVED") {
          console.log("Payment already processed for", registrationId);
          return new Response("Already processed", { status: 200 });
        }

        const { data: updatedData, error: updateError } = await supabase
          .from("workshop_registrations")
          .update({
            payment_status: "APPROVED",
            transaction_id: String(paymentId),
            raw_data: {
              ...regData.raw_data,
              mp_payment_data: paymentData,
            },
          })
          .eq("id", registrationId)
          .eq("payment_status", "PENDING")
          .select();

        if (updateError) {
          console.error("Error updating registration status:", updateError);
        } else if (updatedData && updatedData.length > 0) {
          console.log(`Registration ${registrationId} marked as APPROVED.`);

          // 3. Send Web Push Notification
          try {
            await supabase.functions.invoke("send-web-push", {
              body: {
                event_type: "workshop_inscription",
                details: {
                  email: regData.email,
                  amount: regData.amount || paymentData.transaction_amount,
                  reference: String(paymentId),
                  workshopName: regData.workshop_name,
                },
              },
            });
            console.log("Web push invoked successfully.");
          } catch (e) {
            console.error("Error invoking send-web-push:", e);
          }

          // 4. Send automated emails
          try {
            const workshopNameNormalized = String(regData.workshop_name || "").toLowerCase();
            const isMltDireccion =
              workshopNameNormalized.includes("mlt dirección") ||
              workshopNameNormalized.includes("mlt direccion");

            if (isMltDireccion) {
              await supabase.functions.invoke("send-mlt-welcome-email", {
                body: {
                  registrationId: regData.id,
                  email: regData.email,
                  full_name: regData.full_name,
                },
              });
              console.log("MLT Dirección welcome email dispatched.");
            } else {
              let emailQueue: any[] = [];
              let baseEmailInfo: Record<string, any> = {
                email: regData.email,
                name: regData.full_name,
              };

              if (regData.workshop_name === "Haz que suceda" || regData.workshop_name === "Haz Que Suceda") {
                const workshopDateHqs = new Date("2026-09-12T08:30:00-05:00");
                baseEmailInfo = {
                  ...baseEmailInfo,
                  workshop_type: "HAZ QUE SUCEDA",
                  workshop_date: "12 de Septiembre",
                  workshop_time: "8:30 AM - 12:30 PM",
                  workshop_location: "https://www.google.com/maps/search/Uniandinos+Bogota",
                  workshop_location_name: "Uniandinos Bogotá, Colombia",
                  workshop_location_url: "https://www.google.com/maps/search/Uniandinos+Bogota",
                  workshop_name: "Haz que suceda",
                  lugar_nombre: "Uniandinos Bogotá, Colombia",
                };

                emailQueue = [{ templateId: 1 }];

                const rem3Days = new Date(workshopDateHqs.getTime() - 3 * 24 * 60 * 60 * 1000);
                if (rem3Days > new Date()) {
                  emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });
                }
                const rem24h = new Date(workshopDateHqs.getTime() - 24 * 60 * 60 * 1000);
                if (rem24h > new Date()) {
                  emailQueue.push({ templateId: 3, scheduledAt: rem24h.toISOString() });
                }
              } else {
                baseEmailInfo = {
                  ...baseEmailInfo,
                  workshop_type: regData.workshop_name,
                  workshop_date: "Fecha por confirmar",
                  workshop_time: "Hora por confirmar",
                  workshop_location: "",
                  workshop_location_name: "Lugar por confirmar",
                  workshop_location_url: "",
                  workshop_name: regData.workshop_name,
                  lugar_nombre: "Lugar por confirmar",
                };
                emailQueue = [{ templateId: 1 }];
              }

              await Promise.all(
                emailQueue.map((item) =>
                  supabase.functions.invoke("send-workshop-email", {
                    body: { ...baseEmailInfo, ...item },
                  })
                )
              );
              console.log("Workshop emails dispatched.");
            }
          } catch (e) {
            console.error("Error dispatching workshop emails:", e);
          }
        } else {
          console.log(`Registration ${registrationId} was already updated by another process.`);
        }
      } else {
        console.log("Not a workshop reference, ignored:", external_reference);
      }
    }

    return new Response("Processed", { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
