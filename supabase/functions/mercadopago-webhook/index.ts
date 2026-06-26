import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

serve(async (req) => {
    // MercadoPago often sends topic and id as query parameters, or in the body.
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
    } catch (e) {
        // Body might be empty or not json, ignore
    }

    // Acknowledge the webhook immediately to avoid MP retries
    if (!paymentId) {
        return new Response("OK", { status: 200 });
    }

    if (topic !== "payment" && topic !== "payment.created" && topic !== "payment.updated") {
        return new Response("Ignored non-payment event", { status: 200 });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch payment details from MercadoPago API
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
            }
        });

        if (!mpResponse.ok) {
            console.error(`Failed to fetch payment ${paymentId} from MP`);
            return new Response("Error fetching payment", { status: 500 });
        }

        const paymentData = await mpResponse.json();
        const status = paymentData.status; // e.g., "approved", "pending", "rejected"
        const external_reference = paymentData.external_reference;

        if (status === "approved" && external_reference) {
            // Extract the registration ID from external_reference
            // It looks like "workshop-123-17000000" or "workshop-hqs-123-17000000" or "workshop-hqs-<uuid>-17000000"
            const match = external_reference.match(/workshop(?:-[a-z]+)?-(.+)-(\d+)$/i);
            
            if (match && match[1]) {
                const registrationId = match[1];

                // 1. Check current status to avoid duplicate processing
                const { data: regData, error: fetchError } = await supabase
                    .from('workshop_registrations')
                    .select('*')
                    .eq('id', registrationId)
                    .single();

                if (fetchError || !regData) {
                    console.error("Registration not found:", registrationId);
                    return new Response("Not found", { status: 200 });
                }

                if (regData.payment_status === 'APPROVED') {
                    console.log("Payment already processed for", registrationId);
                    return new Response("Already processed", { status: 200 });
                }

                // 2. Update DB status to APPROVED atomically
                const { data: updatedData, error: updateError } = await supabase
                    .from('workshop_registrations')
                    .update({
                        payment_status: 'APPROVED',
                        transaction_id: String(paymentId),
                        raw_data: {
                            ...regData.raw_data,
                            mp_payment_data: paymentData
                        }
                    })
                    .eq('id', registrationId)
                    .eq('payment_status', 'PENDING')
                    .select();

                if (updateError) {
                    console.error("Error updating registration status:", updateError);
                } else if (updatedData && updatedData.length > 0) {
                    console.log(`Registration ${registrationId} marked as APPROVED.`);

                    // 3. Send Web Push Notification
                    try {
                        await supabase.functions.invoke('send-web-push', {
                            body: {
                                event_type: 'workshop_inscription',
                                details: {
                                    email: regData.email,
                                    amount: regData.amount || paymentData.transaction_amount,
                                    reference: String(paymentId),
                                    workshopName: regData.workshop_name
                                }
                            }
                        });
                        console.log("Web push invoked successfully.");
                    } catch (e) {
                        console.error("Error invoking send-web-push:", e);
                    }

                    // 4. Send automated emails via send-workshop-email
                    try {
                        let emailQueue = [];
                        let baseEmailInfo = {
                            email: regData.email,
                            name: regData.full_name,
                        };

                        if (regData.workshop_name === "Haz que suceda" || regData.workshop_name === "Haz Que Suceda") {
                            const workshopDateHqs = new Date('2026-06-27T09:00:00-05:00');
                            baseEmailInfo = {
                                ...baseEmailInfo,
                                workshop_type: 'HAZ QUE SUCEDA',
                                workshop_date: '27 de Junio',
                                workshop_time: '9:00 AM - 5:00 PM',
                                workshop_location: 'https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali',
                                workshop_location_name: 'Casa Obeso Cali, Colombia',
                                workshop_location_url: 'https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali',
                                workshop_name: 'Haz que suceda',
                                lugar_nombre: 'Casa Obeso Cali, Colombia'
                            };

                            emailQueue = [{ templateId: 1 }]; // Confirmation

                            // 3 days before
                            const rem3Days = new Date(workshopDateHqs.getTime() - 3 * 24 * 60 * 60 * 1000);
                            if (rem3Days > new Date()) {
                                emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });
                            }
                            // 24 hours before
                            const rem24h = new Date(workshopDateHqs.getTime() - 24 * 60 * 60 * 1000);
                            if (rem24h > new Date()) {
                                emailQueue.push({ templateId: 3, scheduledAt: rem24h.toISOString() });
                            }

                        } else if (regData.workshop_name === "Workshop Presencial Fascinantes") {
                            const workshopDateFas = new Date('2026-05-01T09:00:00-05:00');
                            baseEmailInfo = {
                                ...baseEmailInfo,
                                workshop_type: 'FASCINANTES',
                                workshop_date: '1 de Mayo',
                                workshop_time: '9:00 AM - 1:00 PM',
                                workshop_location: 'https://maps.app.goo.gl/R64NW2y99LhatQA37',
                                workshop_location_name: 'CAFE DEL RIO - CALI COLOMBIA',
                                workshop_location_url: 'https://maps.app.goo.gl/R64NW2y99LhatQA37',
                                workshop_name: 'Workshop Presencial Fascinantes',
                                lugar_nombre: 'CAFE DEL RIO - CALI COLOMBIA'
                            };

                            emailQueue = [{ templateId: 1 }];

                            const rem3Days = new Date(workshopDateFas.getTime() - 3 * 24 * 60 * 60 * 1000);
                            if (rem3Days > new Date()) {
                                emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });
                            }
                            const rem24h = new Date(workshopDateFas.getTime() - 24 * 60 * 60 * 1000);
                            if (rem24h > new Date()) {
                                emailQueue.push({ templateId: 3, scheduledAt: rem24h.toISOString() });
                            }
                        } else {
                            // Generic workshop handling
                            baseEmailInfo = {
                                ...baseEmailInfo,
                                workshop_type: regData.workshop_name,
                                workshop_date: 'Fecha por confirmar',
                                workshop_time: 'Hora por confirmar',
                                workshop_location: '',
                                workshop_location_name: 'Lugar por confirmar',
                                workshop_location_url: '',
                                workshop_name: regData.workshop_name,
                                lugar_nombre: 'Lugar por confirmar'
                            };
                            emailQueue = [{ templateId: 1 }];
                        }

                        // Send all emails
                        await Promise.all(
                            emailQueue.map((item) =>
                                supabase.functions.invoke('send-workshop-email', {
                                    body: { ...baseEmailInfo, ...item },
                                })
                            )
                        );
                        console.log("Workshop emails dispatched.");

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
