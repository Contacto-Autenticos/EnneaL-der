// Setup for Supabase Edge Function to generate Wompi Integrity Signature
// This should be deployed to Supabase Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const WOMPI_PRIVATE_KEY = Deno.env.get("WOMPI_PRIVATE_KEY")
const WOMPI_INTEGRITY_SECRET = Deno.env.get("WOMPI_INTEGRITY_SECRET")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amountInCents, currency, reference } = await req.json()

        // Structure: reference + amountInCents + currency + integritySecret
        const chain = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`

        const msgUint8 = new TextEncoder().encode(chain)
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")

        return new Response(
            JSON.stringify({ signature }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
})
