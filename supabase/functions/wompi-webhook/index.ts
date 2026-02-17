// Setup for Supabase Edge Function to handle Wompi Webhooks
// This should be deployed to Supabase Functions to update the user's status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
    const { data } = await req.json()
    const transaction = data.transaction

    if (transaction.status === 'APPROVED') {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Update the user_leads table or a separate payments table
        const { error } = await supabase
            .from('user_leads')
            .update({ payment_status: 'APPROVED', updated_at: new Date() })
            .eq('email', transaction.customer_email) // Or use a custom reference

        if (error) console.error('Error updating payment status:', error)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
})
