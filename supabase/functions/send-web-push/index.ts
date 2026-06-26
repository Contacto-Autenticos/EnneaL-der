import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { event_type, details } = await req.json();

        // Determinar título y mensaje
        let title = 'Nueva Alerta Auténticos';
        let body = 'Tienes una nueva notificación de la plataforma.';
        const origin = req.headers.get('origin') || 'https://enesencia.autenticos.co';
        let url = `${origin}/admin`;

        if (event_type === 'free_test') {
            title = '🎯 Test Básico Finalizado';
            body = `Usuario (${details.name} - ${details.email}) finalizó el test con resultado: Tipo ${details.enneatype}`;
        } else if (event_type === 'purchase_intent') {
            title = '🎟️ Intención de Compra';
            body = `El usuario ${details.email} está en la pasarela de pago para adquirir ${details.product || 'un producto'}.`;
        } else if (event_type === 'advanced_test_purchase') {
            title = '💵 ¡Nueva Compra Exitosa!';
            body = `El usuario ${details.email} ha comprado Test Avanzado por $${details.amount} COP. Ref: ${details.reference}`;
        } else if (event_type === 'dominios_purchase') {
            title = '💵 ¡Nueva Compra Exitosa!';
            body = `El usuario ${details.email} ha comprado Autodiagnóstico por $${details.amount} COP. Ref: ${details.reference}`;
        } else if (event_type === 'workshop_inscription') {
            const wName = details.workshopName ? ` (${details.workshopName})` : '';
            title = `💵 ¡Nueva Compra Exitosa!`;
            body = `El usuario ${details.email} ha comprado Inscripción a Taller${wName}. Ref: ${details.reference}`;
        }

        const payload = JSON.stringify({ title, body, url });

        // Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Web Push Config
        webPush.setVapidDetails(
            Deno.env.get('VAPID_SUBJECT') || 'mailto:soporte@autenticos.co',
            Deno.env.get('VAPID_PUBLIC_KEY')!,
            Deno.env.get('VAPID_PRIVATE_KEY')!
        );

        // Fetch subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            return webPush.sendNotification(pushSubscription, payload).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log('Subscription expired: ', err);
                    return supabase.from('push_subscriptions').delete().eq('id', sub.id);
                } else {
                    console.error('Error sending push notification: ', err);
                }
            });
        });

        await Promise.all(promises);

        return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error processing web push:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
