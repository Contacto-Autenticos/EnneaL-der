import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toHex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { reference, amount, currency } = await req.json()
        // Retrieve secret from environment variables
        const secret = Deno.env.get('WOMPI_INTEGRITY_SECRET')

        if (!secret) {
            throw new Error('WOMPI_INTEGRITY_SECRET is not set')
        }

        // Concatenate values for the signature: reference + amount + currency + secret
        const stringToSign = `${reference}${amount}${currency}${secret}`

        const encoder = new TextEncoder()
        const data = encoder.encode(stringToSign)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const signature = toHex(hashBuffer)

        return new Response(
            JSON.stringify({ signature, reference, amount, currency }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
